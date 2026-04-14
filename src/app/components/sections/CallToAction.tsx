import { Button } from '../ui/button';
import { ArrowRight, Wrench, Zap, Award, Calendar } from 'lucide-react';

interface CallToActionProps {
  onBook: () => void;
}

const benefits = [
  {
    icon: Wrench,
    title: 'Expert Technicians',
    description: 'Certified professionals',
  },
  {
    icon: Zap,
    title: 'Fast Service',
    description: 'Quick turnaround',
  },
  {
    icon: Award,
    title: '100% Satisfaction Guarantee',
    description: 'Quality assured',
  },
];

export function CallToAction({ onBook }: CallToActionProps) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Ready to Get Your Vehicle Serviced?
            </h2>
            <p className="text-gray-600 text-lg mb-10">
              Schedule your appointment today and experience professional automotive care with our certified technicians.
            </p>

            {/* Benefits List */}
            <div className="space-y-4 mb-10">
              {benefits.map((benefit, idx) => {
                const IconComponent = benefit.icon;
                return (
                  <div key={idx} className="flex items-start gap-4 group">
                    <div className="p-3 bg-gray-800 rounded-lg group-hover:bg-gray-900 transition-colors flex-shrink-0">
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{benefit.title}</h3>
                      <p className="text-gray-500 text-sm">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA Button */}
            <Button
              onClick={onBook}
              className="bg-gray-900 hover:bg-gray-800 text-white font-bold px-4 py-2 sm:px-10 sm:py-4 text-base sm:text-lg rounded-xl gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 inline-flex items-center justify-center"
            >
              <Calendar className="w-5 h-5" />
              Book Your Service Today
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>

          {/* Right Side - Visual Card with Image */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl blur-2xl opacity-50" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
              <img
                src="https://plus.unsplash.com/premium_photo-1677009541474-1fc2642943c1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Professional auto service technician"
                className="w-full h-[500px] object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
