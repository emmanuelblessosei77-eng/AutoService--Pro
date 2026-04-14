// filepath: src/app/components/booking-payment-breakdown.tsx
// Component to display cost breakdown before payment

import React, { useState, useEffect } from 'react';
import { bookings as apiBookings } from '../../services/api';

interface PartDetail {
  id: number;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

interface CostBreakdown {
  bookingId: number;
  servicePrice: number;
  serviceName: string;
  partsPrice: number;
  approvedPartsCount: number;
  totalPrice: number;
  breakdown: Array<{
    type: 'service' | 'parts';
    description: string;
    amount: number;
  }>;
}

interface BookingWithCosts {
  id: number;
  service_name: string;
  status: string;
  parts_cost: number;
  total_cost: number;
  costBreakdown: CostBreakdown;
  partsDetails: PartDetail[];
}

interface BookingPaymentBreakdownProps {
  bookingId: number;
  onPaymentConfirm?: (totalAmount: number) => void;
}

export const BookingPaymentBreakdown: React.FC<BookingPaymentBreakdownProps> = ({
  bookingId,
  onPaymentConfirm,
}) => {
  const [booking, setBooking] = useState<BookingWithCosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPartsDetails, setShowPartsDetails] = useState(false);

  useEffect(() => {
    const fetchbooking = async () => {
      try {
        setLoading(true);
        const data = await apiBookings.getById(String(bookingId));
        setBooking(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchbooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="text-gray-500">Loading booking details...</div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded">
        <p className="text-red-700">{error || 'Could not load booking details'}</p>
      </div>
    );
  }

  const { costBreakdown, partsDetails } = booking;

  return (
    <div className="max-w-md mx-auto p-4 border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Payment Summary</h2>
        <p className="text-sm text-gray-600">Booking #{bookingId}</p>
      </div>

      {/* Service Cost */}
      <div className="mb-4 pb-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-gray-700 font-medium">Service</p>
            <p className="text-xs text-gray-500">{costBreakdown.serviceName}</p>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            ₦{costBreakdown.servicePrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Parts Cost Section */}
      {costBreakdown.partsPrice > 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <button
            onClick={() => setShowPartsDetails(!showPartsDetails)}
            className="w-full flex justify-between items-center hover:bg-gray-50 p-2 rounded transition"
          >
            <div className="text-left">
              <p className="text-gray-700 font-medium">Approved Parts</p>
              <p className="text-xs text-gray-500">
                {costBreakdown.approvedPartsCount} item{costBreakdown.approvedPartsCount !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg font-semibold text-gray-900">
                ₦{costBreakdown.partsPrice.toLocaleString()}
              </p>
              <span className="text-gray-400">{showPartsDetails ? '▼' : '▶'}</span>
            </div>
          </button>

          {/* Expandable Parts Details */}
          {showPartsDetails && partsDetails.length > 0 && (
            <div className="mt-2 ml-4 space-y-2 bg-gray-50 p-3 rounded">
              {partsDetails.map((part) => (
                <div key={part.id} className="flex justify-between text-sm">
                  <div className="text-gray-700">
                    <p className="font-medium">{part.name}</p>
                    <p className="text-xs text-gray-500">
                      {part.quantity} × ₦{part.unitPrice.toLocaleString()}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    ₦{part.totalPrice.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* No Parts Message */}
      {costBreakdown.partsPrice === 0 && (
        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-500 italic">No approved parts at this time</p>
        </div>
      )}

      {/* Total Due */}
      <div className="mb-6 p-3 bg-blue-50 border border-blue-100 rounded">
        <div className="flex justify-between items-center">
          <p className="text-gray-800 font-semibold">Total Due</p>
          <p className="text-2xl font-bold text-blue-600">
            ₦{costBreakdown.totalPrice.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Payment Status */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full"></span>
          <p className="text-sm text-gray-600">
            Status: <span className="font-medium capitalize">{booking.status}</span>
          </p>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onPaymentConfirm?.(costBreakdown.totalPrice)}
        disabled={booking.status === 'completed' || booking.status === 'cancelled'}
        className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-400 text-slate-950 font-semibold rounded-lg transition"
      >
        {booking.status === 'completed' ? 'Already Paid' : booking.status === 'cancelled' ? 'Booking Cancelled' : 'Proceed to Payment'}
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 text-center mt-3">
        You will be redirected to Paystack to complete the payment
      </p>
    </div>
  );
};

/**
 * Usage Example in Customer Dashboard:
 * 
 * import { BookingPaymentBreakdown } from './booking-payment-breakdown';
 * 
 * const handlePaymentConfirm = async (totalAmount: number) => {
 *   try {
      const response = await fetch('http://localhost:4001/api/payments/initialize', {
 *       method: 'POST',
 *       headers: {
 *         'Content-Type': 'application/json',
 *         'Authorization': `Bearer ${authToken}`
 *       },
 *       body: JSON.stringify({
 *         booking_id: bookingId,
 *         email: customerEmail,
 *         amount: totalAmount,  // This includes service + parts
 *         return_url: 'http://localhost:5181/dashboard?tab=bookings'
 *       })
 *     });
 * 
 *     const paymentData = await response.json();
 *     if (paymentData.authorization_url) {
 *       window.location.href = paymentData.authorization_url;
 *     }
 *   } catch (error) {
 *     console.error('Payment initialization failed:', error);
 *   }
 * };
 * 
 * <BookingPaymentBreakdown
 *   bookingId={currentBooking.id}
 *   onPaymentConfirm={handlePaymentConfirm}
 * />
 */
