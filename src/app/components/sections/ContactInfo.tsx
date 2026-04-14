import { Mail, Phone, MapPin, Clock } from 'lucide-react';

export function ContactInfo() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
      
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <Phone className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Phone</h3>
            <p className="text-gray-600">+233 242 123 456</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <Mail className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Email</h3>
            <p className="text-gray-600">info@autoservice.com</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Address</h3>
            <p className="text-gray-600">Osu, Accra<br />Ghana</p>
          </div>
        </div>
        
        <div className="flex items-start gap-4">
          <Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Hours</h3>
            <p className="text-gray-600">Mon-Fri: 9AM-6PM<br />Sat: 10AM-4PM<br />Sun: Closed</p>
          </div>
        </div>
      </div>
    </div>
  );
}




