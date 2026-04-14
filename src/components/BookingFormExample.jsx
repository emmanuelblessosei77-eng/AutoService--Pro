import React, { useState } from 'react';
import { 
  showSuccess, 
  showError, 
  showConfirm, 
  showLoading, 
  closeAlert,
  showToast 
} from '../utils/alertUtils';

/**
 * Example Booking Component with SweetAlert2 Integration
 * This demonstrates how to use alerts for a typical booking workflow
 */
const BookingFormExample = () => {
  const [formData, setFormData] = useState({
    vehicleType: '',
    serviceType: '',
    date: '',
    time: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.vehicleType) {
      showError('Validation Error', 'Please select a vehicle type.');
      return false;
    }
    if (!formData.serviceType) {
      showError('Validation Error', 'Please select a service type.');
      return false;
    }
    if (!formData.date) {
      showError('Validation Error', 'Please select a date.');
      return false;
    }
    if (!formData.time) {
      showError('Validation Error', 'Please select a time.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Show confirmation
    const result = await showConfirm(
      'Confirm Booking?',
      `Service: ${formData.serviceType}\nDate: ${formData.date}\nTime: ${formData.time}`,
      'Confirm Booking',
      'Cancel'
    );

    if (!result.isConfirmed) {
      return;
    }

    // Submit the booking
    try {
      setLoading(true);
      showLoading('Creating your booking...');

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      closeAlert();
      setLoading(false);

      if (response.ok) {
        const booking = await response.json();
        
        showSuccess(
          'Booking Confirmed!',
          `Booking ID: ${booking.id}\nYou will receive a confirmation email.`
        );

        // Show quick toast
        showToast('Check your email!', 'success', 3000);

        // Reset form
        setFormData({
          vehicleType: '',
          serviceType: '',
          date: '',
          time: '',
          notes: ''
        });

      } else {
        const error = await response.json();
        showError('Booking Failed', error.message || 'Unable to create booking.');
      }
    } catch (error) {
      closeAlert();
      setLoading(false);
      showError('Error', error.message);
    }
  };

  const handleCancel = async () => {
    if (formData.vehicleType || formData.serviceType) {
      const result = await showConfirm(
        'Discard Changes?',
        'Are you sure you want to cancel? Your changes will be lost.',
        'Yes, Cancel',
        'Keep Editing'
      );

      if (result.isConfirmed) {
        setFormData({
          vehicleType: '',
          serviceType: '',
          date: '',
          time: '',
          notes: ''
        });
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Book a Service</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Vehicle Type</label>
          <select
            name="vehicleType"
            value={formData.vehicleType}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select vehicle type</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="truck">Truck</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="">Select service</option>
            <option value="oil-change">Oil Change</option>
            <option value="tire-rotation">Tire Rotation</option>
            <option value="brake-service">Brake Service</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Time</label>
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Additional Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
            rows="3"
            placeholder="Any special requests?"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Booking...' : 'Book Service'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading}
            className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 disabled:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingFormExample;
