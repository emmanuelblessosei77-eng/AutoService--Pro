import { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { AlertCircle, CheckCircle2, Loader, X } from 'lucide-react';
import { payments as apiPayments, bookings as apiBookings } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

interface PaymentStepProps {
  booking_details: any; // Booking details not yet created
  booking_id?: string | number; // Optional: if booking already exists (booking-first flow)
  amount: number;
  service_name: string;
  user_email: string;
  user_name: string;
  onPaymentSuccess: () => void;
  onCancel?: () => void;
}

export function PaymentStep({
  booking_details,
  booking_id,
  amount,
  service_name,
  user_email,
  user_name,
  onPaymentSuccess,
  onCancel,
}: PaymentStepProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [checkPaymentError, setCheckPaymentError] = useState('');
  const [hasPendingPayment, setHasPendingPayment] = useState(false);

  // Detect if user returned from Paystack without completing the redirect
  useEffect(() => {
    const ref = sessionStorage.getItem('paymentReference');
    if (ref) {
      setHasPendingPayment(true);
      setIsLoading(false);
    }
  }, []);
  
  // Ensure amount is a number
  const numericAmount = (() => {
    const n = typeof amount === 'string' ? parseFloat(amount) : amount;
    return isNaN(Number(n)) ? 0 : Number(n);
  })();

  const handleCancel = () => {
    console.log('🔙 Payment cancelled - no booking was created');
    
    // Clear session storage
    sessionStorage.removeItem('paymentReference');
    sessionStorage.removeItem('bookingDetails');
    
    // Call onCancel callback if provided
    if (onCancel) {
      onCancel();
    }
  };

  // Manually check if payment was completed and create booking if so
  const handleCheckPayment = async () => {
    setIsCheckingPayment(true);
    setCheckPaymentError('');
    try {
      const paymentReference = sessionStorage.getItem('paymentReference');
      if (!paymentReference) {
        setCheckPaymentError('No payment reference found. Please complete payment on Paystack first.');
        setIsCheckingPayment(false);
        return;
      }

      console.log('🔍 Manually verifying payment with reference:', paymentReference);
      const verification = await apiPayments.verify(paymentReference);

      if (verification.success) {
        console.log('✅ Payment verified successfully');
        
        // Create booking after successful payment
        const bookingDetailsStr = sessionStorage.getItem('bookingDetails');
        if (bookingDetailsStr) {
          const bookingDetails = JSON.parse(bookingDetailsStr);
          console.log('💫 Creating booking after payment verified...');
          
          const newBooking = await apiBookings.create({
            user_id: bookingDetails.user_id,
            service_id: bookingDetails.service_id,
            vehicle_id: bookingDetails.vehicle_id,
            booking_datetime: bookingDetails.booking_datetime,
            status: 'scheduled',
            payment_status: 'completed',
            notes: bookingDetails.notes
          });
          
          console.log(`✅ Booking #${newBooking.id} created`);
          
          // Set flags for dashboard
          const userId = bookingDetails.user_id;
          localStorage.removeItem(`dashboard_${userId}`);
          sessionStorage.setItem('forceRefreshDashboard', 'true');
          sessionStorage.setItem('newBookingId', String(newBooking.id));
          
          // Navigate to dashboard
          setTimeout(() => {
            navigate('/dashboard');
          }, 1000);
        }
      } else {
        setCheckPaymentError(verification.message || 'Payment not verified yet. Please try again.');
      }
    } catch (err) {
      console.error('❌ Error checking payment:', err);
      setCheckPaymentError(err instanceof Error ? err.message : 'Failed to check payment status');
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      // Get booking ID from booking_details (which has the created booking) or prop
      const bookingId = booking_details?.id || booking_id;

      console.log('💳 PAYMENT STEP: Processing payment for EXISTING booking');
      console.log('   Booking details received:', booking_details);
      console.log('   Extracted booking ID:', bookingId);
      console.log('   Amount: GH₵' + numericAmount);
      console.log('   User: ' + user_name + ' (' + user_email + ')');

      if (!bookingId) {
        console.error('❌ No booking ID found!');
        console.log('   booking_details:', booking_details);
        console.log('   booking_id prop:', booking_id);
        throw new Error('Booking ID is missing. Booking should have been created before payment.');
      }

      // Construct return URL for after payment
      const baseUrl = window.location.origin;
      const returnUrl = `${baseUrl}/payment-success`;
      console.log('📍 Return URL (for Paystack redirect):');
      console.log('   Full URL:', returnUrl);
      console.log('   Expected redirect:', `${returnUrl}?reference=XXX`);

      // Store booking_id in sessionStorage so payment-success can find it
      sessionStorage.setItem('pendingBookingId', String(bookingId));
      console.log('💾 Stored booking_id in sessionStorage:', bookingId);
      
      console.log('📡 Calling apiPayments.initialize WITH booking_id (booking already created)');
      const paymentResponse = await apiPayments.initialize({
        email: user_email,
        amount: numericAmount,
        booking_id: bookingId, // Booking already exists!
        full_name: user_name,
        return_url: returnUrl
      });

      console.log('✅ Payment initialization response:', paymentResponse);
      console.log('   Keys in response:', Object.keys(paymentResponse));

      // Store reference in sessionStorage for verification
      const reference = paymentResponse.reference || paymentResponse.data?.reference || paymentResponse?.data?.reference;
      const authUrl = paymentResponse.authorization_url || paymentResponse.data?.authorization_url || paymentResponse?.data?.authorization_url;
      
      if (reference) {
        sessionStorage.setItem('paymentReference', reference);
        console.log(`💾 Payment reference stored: ${reference}`);
        
        // Already stored bookingId above
        console.log(`✅ Booking ID already in sessionStorage for payment-success to update`);
        
        // ALSO store in localStorage (survives full page navigation) for stuck payment recovery
        localStorage.setItem('lastPaymentReference', reference);
        localStorage.setItem('lastPaymentTime', new Date().toISOString());
        console.log('💾 Also backed up to localStorage for stuck payment recovery');
      } else {
        console.warn('⚠️  No reference in payment response');
        throw new Error('No payment reference returned by backend');
      }

      console.log('✓ Payment initialized:', paymentResponse);

      // Validate response
      if (!authUrl) {
        console.error('❌ Payment initialization returned no authorization URL', paymentResponse);
        console.log('   Response keys:', Object.keys(paymentResponse));
        console.log('   Full response:', JSON.stringify(paymentResponse, null, 2));
        throw new Error('No payment URL provided by backend');
      }

      console.log('🔗 REDIRECTING TO PAYSTACK:', authUrl);
      console.log('🔗 Complete Paystack URL structure:');
      console.log('   Authorization URL:', authUrl);
      console.log('   Reference:', reference);
      console.log('   Payment ID:', paymentResponse.payment_id);
      
      // Use window.location.assign for clarity
      setTimeout(() => {
        console.log('🔄 Executing redirect to Paystack checkout...');
        window.location.assign(authUrl);
      }, 100);
      
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment initialization failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Summary */}
      <Card className="bg-gray-50 dark:bg-gray-800/70 border-gray-200 dark:border-gray-700">
        <CardContent className="pt-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-300">Service</span>
            <span className="font-medium text-gray-900 dark:text-white">{service_name}</span>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Total Due</span>
            <span className="text-xl font-bold text-gray-900 dark:text-white">GH₵{numericAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <div className="space-y-2">
        <div>
          <Label className="text-xs text-gray-600">Name</Label>
          <p className="font-medium">{user_name}</p>
        </div>
        <div>
          <Label className="text-xs text-gray-600">Email</Label>
          <p className="font-medium text-sm">{user_email}</p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-red-800">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-green-800">{success}</p>
        </div>
      )}

      {/* Payment Methods Info */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded">
        <p className="text-xs text-blue-900">
          <strong>Accepted Payment Methods:</strong> Credit/Debit Cards, Mobile Money (MTN, Vodafone, AirtelTigo)
        </p>
      </div>

      {/* Recovery: user returned from Paystack without being auto-redirected */}
      {hasPendingPayment && (
        <div className="p-3 bg-yellow-50 border border-yellow-300 rounded space-y-2">
          <p className="text-xs text-yellow-800 font-medium">
            Already completed payment on Paystack? Click below to verify and continue.
          </p>
          {checkPaymentError && (
            <p className="text-xs text-red-700">{checkPaymentError}</p>
          )}
          <Button
            onClick={handleCheckPayment}
            disabled={isCheckingPayment}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            size="sm"
          >
            {isCheckingPayment ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify My Payment'
            )}
          </Button>
        </div>
      )}

      {/* Pay and Cancel Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handlePayment}
          disabled={isLoading}
          className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay GH₵${numericAmount.toFixed(2)}`
          )}
        </Button>
        <Button
          onClick={handleCancel}
          disabled={isLoading}
          variant="outline"
          className="px-4"
          size="lg"
          title="Cancel booking"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Security Badge */}
      <p className="text-xs text-center text-gray-500">
        🔒 Secure payment powered by Paystack
      </p>
    </div>
  );
}
