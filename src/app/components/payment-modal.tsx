import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { AlertCircle, CheckCircle2, Loader, Download } from 'lucide-react';
import { payments as apiPayments } from '../../services/api';

interface PaymentModalProps {
  booking_id: string | number;
  amount: number;
  service_name: string;
  user_email: string;
  user_name: string;
  onPaymentSuccess?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    PaystackPop: any;
  }
}

export function PaymentModal({
  booking_id,
  amount,
  service_name,
  user_email,
  user_name,
  onPaymentSuccess,
  isOpen,
  onClose,
}: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('💳 PaymentModal state:', { isOpen, booking_id, amount, user_email, user_name });
    console.log('💳 isOpen:', isOpen);
    if (isOpen) {
      console.log('💳 Payment modal should be visible now');
    }
  }, [isOpen, booking_id, amount]);

  // Download invoice
  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true);
      console.log('📥 Downloading invoice for booking:', booking_id);
      await apiPayments.downloadInvoice(booking_id);
      console.log('✅ Invoice downloaded successfully');
    } catch (err) {
      console.error('❌ Failed to download invoice:', err);
      setError('Failed to download invoice. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Load Paystack script
  const loadPaystackScript = () => {
    return new Promise<boolean>((resolve) => {
      if (window.PaystackPop) {
        console.log('✓ Paystack already loaded');
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('✓ Paystack script loaded successfully');
        // Wait for PaystackPop to be available
        const checkPaystack = setInterval(() => {
          if (window.PaystackPop) {
            clearInterval(checkPaystack);
            resolve(true);
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkPaystack);
          if (window.PaystackPop) {
            resolve(true);
          } else {
            console.error('❌ PaystackPop did not load');
            resolve(false);
          }
        }, 5000);
      };
      script.onerror = (err) => {
        console.error('❌ Failed to load Paystack script:', err);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccess('');

      console.log('💳 Initializing payment:', { booking_id, amount, user_email });

      // Initialize payment with backend
      const paymentResponse = await apiPayments.initialize({
        email: user_email,
        amount,
        booking_id,
        full_name: user_name
      });

      console.log('✓ Payment initialized:', paymentResponse);
      
      // Validate response
      if (!paymentResponse.publicKey) {
        throw new Error('Backend did not provide Paystack public key');
      }
      if (!paymentResponse.reference) {
        throw new Error('Backend did not provide payment reference');
      }

      console.log('✓ Loading Paystack script...');
      const loaded = await loadPaystackScript();
      if (!loaded || !window.PaystackPop) {
        throw new Error('Failed to load Paystack payment gateway. Please refresh and try again.');
      }

      console.log('✓ Paystack ready, setting up payment handler...');

      // Open Paystack popup
      const handler = window.PaystackPop.setup({
        key: paymentResponse.publicKey, // Use the public key from backend response
        email: user_email,
        amount: Math.round(amount * 100), // in kobo
        ref: paymentResponse.reference,
        currency: 'GHS',
        onClose: () => {
          console.log('⚠ Payment modal closed by user');
          setIsLoading(false);
        },
        onSuccess: async (response: any) => {
          console.log('✓ Payment successful on Paystack:', response.reference);

          // Verify payment with backend
          try {
            const verifyResponse = await apiPayments.verify(response.reference);
            console.log('✓ Payment verified:', verifyResponse);

            setSuccess('Payment successful! Your booking is confirmed.');

            // Persist reference and booking id for subsequent pages
            try {
              if (response.reference) sessionStorage.setItem('paymentReference', response.reference);
              if (booking_id) sessionStorage.setItem('bookingId', String(booking_id));
            } catch (e) {
              console.warn('Could not write sessionStorage for payment reference/booking id', e);
            }

            // If verification returned a booking_id or order_id, navigate directly to the invoice download
            const bookingIdFromVerify = verifyResponse?.booking_id || verifyResponse?.bookingId || booking_id;
            const orderIdFromVerify = verifyResponse?.order_id || verifyResponse?.orderId || null;

            try {
              if (bookingIdFromVerify) {
                const invoiceUrl = `/api/payments/invoice/${bookingIdFromVerify}`;
                console.log('➡ Redirecting to booking invoice URL:', invoiceUrl);
                window.location.assign(invoiceUrl);
                return;
              }

              if (orderIdFromVerify || response.metadata?.order_id) {
                const oid = orderIdFromVerify || response.metadata?.order_id;
                const invoiceUrl = `/api/payments/invoice/order/${oid}`;
                console.log('➡ Redirecting to order invoice URL:', invoiceUrl);
                window.location.assign(invoiceUrl);
                return;
              }
            } catch (navErr) {
              console.warn('Could not redirect to invoice URL, falling back to payment-success:', navErr);
            }

            // Fallback: redirect to the payment success page so the user can view/print invoice
            const qs = new URLSearchParams();
            if (booking_id) qs.set('booking_id', String(booking_id));
            if (verifyResponse?.reference) qs.set('reference', verifyResponse.reference);

            const successUrl = `${window.location.origin}/payment-success?${qs.toString()}`;
            console.log('➡ Redirecting to payment success page:', successUrl);
            window.location.assign(successUrl);
            if (onPaymentSuccess) onPaymentSuccess();
          } catch (err) {
            console.error('❌ Payment verification failed:', err);
            setError('Payment verification failed. Please contact support.');
          }
          setIsLoading(false);
        }
      });

      console.log('🔓 Opening Paystack iframe...');
      handler.openIframe();
      console.log('✓ Paystack iframe opened');
    } catch (err) {
      console.error('❌ Payment error:', err);
      setError(err instanceof Error ? err.message : 'Payment initialization failed. Please try again.');
      setIsLoading(false);
    }
  };

  return isOpen ? createPortal(
    <div className="fixed inset-0 flex items-center justify-center">
      {/* Black overlay */}
      <div className="fixed inset-0 bg-black/80 z-40" onClick={onClose} />
      
      {/* Modal - above overlay */}
      <div className="relative z-50 bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto w-full max-w-md">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Complete Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          {/* Payment Summary */}
          <Card className="bg-gray-50">
            <CardContent className="pt-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Service</span>
                <span className="font-medium">{service_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount</span>
                <span className="text-lg font-bold text-blue-600">
                  GH₵{amount.toFixed(2)}
                </span>
              </div>
              <div className="border-t pt-2 flex justify-between items-center">
                <span className="text-sm font-semibold">Total Due</span>
                <span className="text-xl font-bold">GH₵{amount.toFixed(2)}</span>
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
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-green-800">{success}</p>
              </div>

              {/* Download Invoice Button */}
              <Button
                onClick={handleDownloadInvoice}
                disabled={isDownloading}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                size="lg"
              >
                {isDownloading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Payment Methods Info */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded">
            <p className="text-xs text-blue-900">
              <strong>Accepted Payment Methods:</strong> Credit/Debit Cards, Mobile Money (MTN, Vodafone, AirtelTigo)
            </p>
          </div>

          {/* Pay Button */}
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              `Pay GH₵${amount.toFixed(2)}`
            )}
          </Button>

          {/* Security Badge */}
          <p className="text-xs text-center text-gray-500">
            🔒 Secure payment powered by Paystack
          </p>
        </div>
      </div>
    </div>,
    document.body
  ) : null;
}