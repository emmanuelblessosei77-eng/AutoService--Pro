import { Button } from '../ui/button';
import { Loader } from 'lucide-react';

interface ServiceOption {
  id: number;
  name: string;
  price: number;
  description?: string;
}

interface BookingStepProps {
  bookingForm: {
    name: string;
    email: string;
    phone: string;
    service: string;
    date: string;
    time: string;
    notes: string;
  };
  services: ServiceOption[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export function BookingStep({
  bookingForm,
  services,
  isSubmitting,
  onSubmit,
  onChange,
}: BookingStepProps) {
  // Debug: Log services array before rendering
  console.log('BookingStep services prop:', services);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Name *</label>
        <input
          type="text"
          name="name"
          value={bookingForm.name}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Your name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Email *</label>
        <input
          type="email"
          name="email"
          value={bookingForm.email}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Phone *</label>
        <input
          type="tel"
          name="phone"
          value={bookingForm.phone}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="+233 000 000 000"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Service *</label>
        <select
          name="service"
          value={bookingForm.service}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id.toString()}>
              {service.name} - GH₵{service.price.toFixed(2)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Date *</label>
        <input
          type="date"
          name="date"
          value={bookingForm.date}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Time *</label>
        <input
          type="time"
          name="time"
          value={bookingForm.time}
          onChange={onChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Notes</label>
        <textarea
          name="notes"
          value={bookingForm.notes}
          onChange={onChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          placeholder="Any additional information..."
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg font-semibold transition-all transform hover:scale-105"
        >
          {isSubmitting ? (
            <>
              <Loader className="h-4 w-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            'Book Now'
          )}
        </Button>
      </div>
    </form>
  );
}
