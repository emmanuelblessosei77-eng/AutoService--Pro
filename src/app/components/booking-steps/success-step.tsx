import { useState } from 'react';
import { Button } from '../ui/button';
import { Loader, Download, CheckCircle2 } from 'lucide-react';
import { payments as apiPayments } from '../../../services/api';

interface SuccessStepProps {
  booking: {
    id: string | number;
    service: { name: string };
    amount: number;
    email: string;
    name: string;
  };
  onClose: () => void;
}

export function SuccessStep({ booking, onClose }: SuccessStepProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true);
      setDownloadError('');
      console.log('📥 Downloading invoice for booking:', booking.id);
      await apiPayments.downloadInvoice(booking.id);
      console.log('✅ Invoice downloaded successfully');
    } catch (err) {
      console.error('❌ Failed to download invoice:', err);
      setDownloadError('Failed to download invoice. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4 text-center">
      {/* Success Icon */}
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>

      {/* Success Message */}
      <div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Booking Confirmed!</h2>
        <p className="text-gray-600 text-sm">
          Your booking has been successfully created and payment has been processed.
        </p>
      </div>

      {/* Booking Details */}
      <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Booking ID:</span>
          <span className="font-semibold">#{booking.id}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Service:</span>
          <span className="font-semibold">{booking.service.name}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Amount Paid:</span>
          <span className="font-semibold text-green-600">GH₵{booking.amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Confirmation email:</span>
          <span className="font-semibold text-sm">{booking.email}</span>
        </div>
      </div>

      {/* Download Button */}
      {downloadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
          {downloadError}
        </div>
      )}

      <Button
        onClick={handleDownloadInvoice}
        disabled={isDownloading}
        className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950"
        size="lg"
      >
        {isDownloading ? (
          <>
            <Loader className="h-4 w-4 mr-2 animate-spin" />
            Downloading Invoice...
          </>
        ) : (
          <>
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </>
        )}
      </Button>

      {/* Next Steps */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded text-left">
        <p className="text-xs text-blue-900">
          <strong>What's next?</strong> Our team will contact you soon to confirm the exact date and time for your service appointment.
        </p>
      </div>

      {/* Close Button */}
      <Button
        onClick={onClose}
        className="w-full bg-gray-600 hover:bg-gray-700 text-white"
        size="lg"
      >
        Close
      </Button>
    </div>
  );
}
