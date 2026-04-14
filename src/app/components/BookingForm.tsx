import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { bookings as apiBookings, services as apiServices } from '../../services/api';
import { BookingStep, PaymentStep, SuccessStep } from './booking-steps';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import React from 'react';
// Import VisuallyHidden from Radix UI
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ServiceOption {
  id: number;
  name: string;
  price: number;
  description?: string;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please check the console for details.</div>;
    }

    return this.props.children;
  }
}

export function BookingForm({ isOpen, onClose }: BookingFormProps) {
  const [step, setStep] = useState<'booking' | 'payment' | 'success'>('booking');
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [currentBooking, setCurrentBooking] = useState<any>(null);

  // Load services when dialog opens
  useEffect(() => {
    if (isOpen) {
      loadServices();
      loadUserInfo();
    }
  }, [isOpen]);

  const loadServices = async () => {
    try {
      console.log('🔄 Loading services...');
      const data = await apiServices.getAll();
      console.log('✅ Raw API response:', data); // Log raw API response

      if (Array.isArray(data)) {
        console.log(`✅ Processed services (${data.length}):`, data);
        setServices(data);
      } else {
        console.warn('⚠️ Unexpected data format:', data);
      }
    } catch (error) {
      console.error('❌ Failed to load services:', error);
      setServices([
        { id: 1, name: 'Regular Maintenance', price: 99.00, description: 'Comprehensive maintenance' },
        { id: 2, name: 'Diagnostics Check', price: 149.00, description: 'Diagnostics check' },
        { id: 3, name: 'Brake Service', price: 120.00, description: 'Brake inspection and replacement' },
      ]);
    } finally {
      console.log('🔍 Final services state:', services);
    }
  };

  const loadUserInfo = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          setBookingForm(prev => ({
            ...prev,
            name: user.name || '',
            email: user.email || '',
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load user info:', error);
    }
  };

  const getSelectedService = (): ServiceOption | undefined => {
    return services.find(s => s.id.toString() === bookingForm.service);
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      const userStr = localStorage.getItem('user');
      
      if (!token || !userStr) {
        alert('Please login first to make a booking');
        setIsSubmitting(false);
        return;
      }

      const user = JSON.parse(userStr);
      
      // Validate user data
      if (!user.id) {
        alert('Invalid user data. Please login again');
        setIsSubmitting(false);
        return;
      }

      const selectedService = getSelectedService();

      if (!selectedService) {
        alert('Please select a service');
        setIsSubmitting(false);
        return;
      }

      // Validate booking date/time
      if (!bookingForm.date || !bookingForm.time) {
        alert('Please select a date and time');
        setIsSubmitting(false);
        return;
      }

      const bookingDateTime = new Date(`${bookingForm.date}T${bookingForm.time}`).toISOString();

      // For payment-first flow: DON'T create booking yet
      // Just store booking details to be created after payment succeeds
      const bookingDetailsForPayment = {
        // No ID yet - booking not created until payment succeeds
        user_id: parseInt(user.id),
        service_id: selectedService.id,
        vehicle_id: null, // Not applicable for homepage bookings
        booking_datetime: bookingDateTime,
        notes: bookingForm.notes || '',
        service_name: selectedService.name,
        amount: selectedService.price,
        email: bookingForm.email || user.email,
        name: bookingForm.name || user.name,
      };

      console.log('💳 Booking details prepared for payment (not creating booking yet):', bookingDetailsForPayment);

      // Set current booking for payment step display (including full booking details)
      setCurrentBooking({
        ...bookingDetailsForPayment,
        service: selectedService,
      });

      // Move to payment step
      setStep('payment');
      setIsSubmitting(false);
    } catch (error: any) {
      console.error('Booking creation error:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      alert(`Error: ${errorMsg}`);
      setIsSubmitting(false);
    }
  };

  const handleBookingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({ ...prev, [name]: value }));
  };

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      onClose();
      setStep('booking');
      setCurrentBooking(null);
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        service: '',
        date: '',
        time: '',
        notes: '',
      });
    }
  };

  const handlePaymentSuccess = () => {
    console.log('✅ Payment successful, moving to success step');
    setStep('success');
  };

  const handleCloseSuccess = () => {
    handleDialogChange(false);
  };

  // Log step changes
  useEffect(() => {
    console.log('📍 Current step:', step, 'currentBooking:', currentBooking?.id);
  }, [step, currentBooking]);

  // Debugging: verify titleId and aria-labelledby (moved inside component)
  useEffect(() => {
    console.log('BookingForm component mounted');

    const titleElement = document.getElementById('dialog-title');
    const contentElement = document.querySelector('[aria-labelledby="dialog-title"]');

    if (titleElement) {
      console.log('DialogTitle element:', titleElement);
    } else {
      console.warn('DialogTitle element not found');
    }

    if (contentElement) {
      console.log('DialogContent element:', contentElement);
    } else {
      console.warn('DialogContent element not found');
    }
  }, []);

  // If in payment mode, render using React Portal (completely outside Dialog)
  // Return ONLY the portal and nothing else
  if (step === 'payment' && currentBooking && isOpen) {
    return createPortal(
      <div className="fixed inset-0 pointer-events-none z-50">
        {/* Black overlay - non-interactive */}
        <div className="fixed inset-0 bg-black/80 pointer-events-auto" onClick={onClose} />
        
        {/* Payment modal - clickable */}
        <div className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-white rounded-lg shadow-2xl max-w-2xl w-[90%] p-6 pointer-events-auto z-50">
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Complete Payment</h2>
              <p className="text-sm text-gray-600 mt-1">
                Pay for your {currentBooking.service.name} service
              </p>
            </div>
            <PaymentStep
              booking_details={{
                user_id: currentBooking.user_id,
                service_id: currentBooking.service_id,
                vehicle_id: currentBooking.vehicle_id,
                booking_datetime: currentBooking.booking_datetime,
                notes: currentBooking.notes,
                service_name: currentBooking.service_name,
                email: currentBooking.email,
                name: currentBooking.name,
              }}
              amount={currentBooking.amount}
              service_name={currentBooking.service_name || currentBooking.service.name}
              user_email={currentBooking.email}
              user_name={currentBooking.name}
              onPaymentSuccess={handlePaymentSuccess}
            />
          </div>
        </div>
      </div>,
      document.body
    );
  }

  // If not in payment mode, show the Dialog
  if (!isOpen) {
    return null;
  }

  return (
    <Dialog open={isOpen && step !== 'payment'} onOpenChange={handleDialogChange}>
      <DialogContent className="max-w-2xl" key={`${step}-${currentBooking?.id}`}> 
        {/* Always render a single DialogHeader as the first child for accessibility */}
        <DialogHeader>
          <DialogTitle>
            {step === 'booking' && 'Book a Service'}
            {step === 'success' && currentBooking && 'Booking Confirmed!'}
            {step !== 'booking' && step !== 'success' && (
              <VisuallyHidden>
                Notice
              </VisuallyHidden>
            )}
          </DialogTitle>
          {step === 'booking' && (
            <DialogDescription>
              Fill out the form below and our team will contact you to confirm your booking.
            </DialogDescription>
          )}
          {step === 'success' && currentBooking && (
            <DialogDescription>
              Your booking has been successfully created
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Render content after header for all steps */}
        {step === 'booking' && (
          <BookingStep
            bookingForm={bookingForm}
            services={services}
            isSubmitting={isSubmitting}
            onSubmit={handleBookingSubmit}
            onChange={handleBookingChange}
          />
        )}
        {step === 'success' && currentBooking && (
          <SuccessStep
            booking={currentBooking}
            onClose={handleCloseSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

