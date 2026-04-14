import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Calendar, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { services as apiServices, bookings as apiBookings } from '../../services/api';

// NO MOCK DATA - ONLY REAL DATABASE SERVICES

interface BookingData {
  serviceType: string;
  date: string;
  time: string;
  vehicle: string;
  description: string;
}

export function InteractiveServiceBooking() {
  const [isOpen, setIsOpen] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);  // Start empty - REAL DATA ONLY
  const [bookingData, setBookingData] = useState({
    serviceType: '',
    date: '',
    time: '',
    vehicle: '',
    description: '',
  });
  const [step, setStep] = useState(1);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Fetch REAL services from backend on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await apiServices.getAll();
        if (response && Array.isArray(response)) {
          const formattedServices = response.map((service: any) => ({
            id: service.id,
            name: service.name,
            p: selectedService,
      estimatedCompletion: calculateEstimatedCompletion(),
    });
    setStep(3);
  };

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      // Submit booking to backend
      const bookingPayload = {
        serviceId: bookingData.serviceType,
        date: bookingData.date,
        time: bookingData.time,
        vehicle: bookingData.vehicle,
        notes: bookingData.description,
        estimatedDuration: selectedService?.duration,
        totalCost: selectedService?.price,
      };

      await apiBookings.create(bookingPayload);
      setBookingSuccess(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setIsOpen(false);
        setStep(1);
        setBookingData({ serviceType: '', date: '', time: '', vehicle: '', description: '' });
        setConfirmationData(null);
        setBookingSuccess(false);
      }, 2000);
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Booking submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
    fetchServices();
  }, []);

  const selectedService = serviceTypes.find(s => s.id === bookingData.serviceType);

  const calculateEstimatedCompletion = () => {
    if (!bookingData.date || !bookingData.time || !selectedService) return null;
    const [hours, minutes] = bookingData.time.split(':').map(Number);
    const completionHours = hours + selectedService.duration;
    return `${String(Math.floor(completionHours % 24)).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  const handleBooking = () => {
    setConfirmationData({
      ...bookingData,
      service,
      estimatedCompletion: calculateEstimatedCompletion(),
    });
    setStep(3);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    setStep(1);
    setBookingData({ serviceType: '', date: '', time: '', vehicle: '', description: '' });
    // You can add notification here
  };

  return (
    
       setIsOpen(true)} className="gap-2">
        
        Book a Service
      

      
        
          
            Book a Service
            
              Step {step} of 3 - {step === 1 ? 'Select Service' : step === 2 ? 'Choose Date & Time' : 'Confirm Booking'}
            
          

          {step === 1 && (
            
              
                
                  Select Service Type
                
                
                  {serviceTypes.map(service => (
                     setBookingData({ ...bookingData, serviceType: service.id })}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        bookingData.serviceType === service.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {service.name}
                      ${service.price}
                      ~{service.duration}h
                    
                  ))}
                
              

              {selectedService && (
                
                  Service Details
                  
                    
                      Service: {selectedService.name}
                    
                    
                      Price: ${selectedService.price}
                    
                    
                      Estimated Duration: {selectedService.duration} hour
                      {selectedService.duration > 1 ? 's' : ''}
                    
                  
                
              )}

               setStep(2)}
                disabled={!bookingData.serviceType}
                className="w-full"
              >
                Next
              
            
          )}

          {step === 2 && (
            
              
                
                  Vehicle
                   setBookingData({ ...bookingData, vehicle: v })}>
                    
                      
                    
                    
                      2020 Toyota Camry (ABC-123)
                      2019 Honda Civic (XYZ-789)
                    
                  
                

                
                  Date
                   setBookingData({ ...bookingData, date: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                  />
                

                
                  Time
                   setBookingData({ ...bookingData, time: e.target.value })}
                  />
                
              

              
                Additional Notes
                 setBookingData({ ...bookingData, description: e.target.value })}
                />
              

              {bookingData.date && bookingData.time && (
                
                  
                    
                      
                      
                        Estimated completion: {calculateEstimatedCompletion()}
                      
                    
                  
                
              )}

              
                 setStep(1)} variant="outline" className="flex-1">
                  Back
                
                 handleBooking()}
                  disabled={!bookingData.date || !bookingData.time || !bookingData.vehicle}
                  className="flex-1"
                >
                  Review Booking
                
              
            
          )}

          {step === 3 && confirmationData && (
            <div>
              <CardContent className="border-t">
                <div className="py-6 space-y-4">
                  {bookingSuccess ? (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
                      <p className="text-lg font-semibold text-green-600">Booking Confirmed!</p>
                      <p className="text-gray-600 mt-2">Your booking has been submitted successfully.</p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">Service</span>
                          <span>{confirmationData.service.name}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">Date & Time</span>
                          <span>{new Date(confirmationData.date).toLocaleDateString()} {confirmationData.time}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">Estimated Duration</span>
                          <span>{confirmationData.service.duration}h</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span className="font-medium">Estimated Completion</span>
                          <span>{confirmationData.estimatedCompletion}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded border border-blue-200">
                          <span className="font-semibold">Total Cost</span>
                          <span className="font-semibold text-blue-600">${confirmationData.service.price}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>

              {!bookingSuccess && (
                <div className="flex gap-3 p-4 border-t">
                  <Button onClick={() => setStep(2)} variant="outline" className="flex-1">
                    Back
                  </Button>
                  <Button 
                    onClick={handleConfirm}
                    disabled={isSubmitting}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
                  </Button>
                </div>
              )}
            </div>
          )}
        
      
    
  );
}




