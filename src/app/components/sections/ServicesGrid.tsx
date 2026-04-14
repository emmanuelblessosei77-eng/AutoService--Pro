import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, PackageSearch } from 'lucide-react';
import { ServiceCard } from './ServiceCard';
import { useTheme } from '../../contexts/ThemeContext';
import oilChangeImg from '../../images/oil-change.jpg';
import diagnosticImg from '../../images/diagnosis1.jpg';
import brakeImg from '../../images/brakeservice.jpg';
import batteryImg from '../../images/battery.jpg';
import airFilterImg from '../../images/airfilterreplacement.jpg';
import cabinFilterImg from '../../images/airfilter.jpg';

const SERVICE_LOCAL_IMAGES: Record<string, string> = {
  'oil change': oilChangeImg,
  'diagnostics': diagnosticImg,
  'diagnostic': diagnosticImg,
  'brake service': brakeImg,
  'brake': brakeImg,
  'battery': batteryImg,
  'air filter': airFilterImg,
  'cabin filter': cabinFilterImg,
};

function resolveServiceImage(name: string, imageUrl?: string): string | undefined {
  const key = (name || '').toLowerCase();
  for (const [k, v] of Object.entries(SERVICE_LOCAL_IMAGES)) {
    if (key.includes(k)) return v;
  }
  return imageUrl;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number | string;
  image_url?: string;
  category?: string;
}

interface ServicesGridProps {
  services: Service[];
  onSelectService: (serviceId: string) => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' as const },
  }),
};

export function ServicesGrid({ services, onSelectService }: ServicesGridProps) {
  const { isDark } = useTheme();

  if (services.length === 0) {
    return (
      <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-gray-50'}`}>
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`}>
            <PackageSearch className={`w-9 h-9 ${isDark ? 'text-slate-400' : 'text-gray-500'}`} />
          </div>
          <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>No services found</h3>
          <p className={`mb-8 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
            Try a different category or check back soon.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 font-semibold rounded-lg transition-colors bg-cyan-500 hover:bg-cyan-400 text-slate-950"
          >
            Book a Service <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-16 transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {services.map((service, i) => {
            const resolvedImg = resolveServiceImage(service.name, service.image_url);
            return (
              <motion.div
                key={service.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0,0,0,0.10)' }}
              >
                <ServiceCard
                  title={service.name}
                  description={service.description}
                  price={service.price}
                  imageUrl={resolvedImg}
                  onBook={() => onSelectService(service.id)}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
