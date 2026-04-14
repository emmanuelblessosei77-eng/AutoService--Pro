import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Clock, BadgeCheck, ChevronRight, Wrench } from 'lucide-react';
import { Header } from './header';
import { Footer } from './footer';
import { useTheme } from '../contexts/ThemeContext';
import { ServicesGrid } from './sections/ServicesGrid';
import { services as apiServices } from '../../services/api';
import servicesHeroImg from '../images/services.jpg';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiService {
  id: number | string;
  name: string;
  description: string;
  price: number | string;
  image_url?: string;
  category?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number | string;
  image_url?: string;
  category?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// Removed categories

const WHY_US = [] as const;

// ─── Component ────────────────────────────────────────────────────────────────

export function ServicesPage() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [allServices, setAllServices] = useState<Service[]>([]);
  // Removed category state
  const [loading, setLoading] = useState(true);

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response: ApiService[] = await apiServices.getAll();
        if (Array.isArray(response)) {
          const mapped: Service[] = response.map((s) => ({
            id: String(s.id),
            name: s.name,
            description: s.description,
            price: s.price,
            image_url: s.image_url,
            category: s.category,
          }));
          setAllServices(mapped);
        }
      } catch (err) {
        console.error('Failed to fetch services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // No category filtering
  const filteredServices = allServices;

  const handleSelectService = (_serviceId: string) => {
    navigate('/register');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-white'}`}>
      <Header />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-4 sm:pt-8">
        <div className="relative overflow-hidden w-full h-[520px] sm:h-[650px] flex items-center justify-center">
          <img
            src={servicesHeroImg}
            alt="Our Services"
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
            style={{ objectFit: 'cover' }}
          />
          <div className="absolute inset-0 bg-[#0a1324]/65 z-[1]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/90 via-[#0b1220]/68 to-[#0b1220]/45 z-[2]" />
          <div
            className="absolute inset-0 z-[3]"
            style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0) 35%, rgba(5,10,20,0.7) 100%)' }}
          />
          <div className="relative z-20 text-center w-full flex flex-col items-center justify-center h-full">
            <motion.h1
              className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-tight drop-shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Our Services
            </motion.h1>
          </div>
        </div>
      </section>

      {/* Category filter removed */}

      {/* ── Services Grid ─────────────────────────────────────────────────── */}
      {loading ? (
        <section className={`py-24 transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-gray-50'}`}>
          <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`rounded-2xl overflow-hidden border animate-pulse ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-gray-200'}`}
              >
                <div className={`h-52 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
                <div className="p-5 space-y-3">
                  <div className={`h-5 rounded w-3/4 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
                  <div className={`h-4 rounded w-full ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
                  <div className={`h-4 rounded w-5/6 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
                  <div className="flex justify-between pt-2">
                    <div className={`h-7 rounded-full w-20 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
                    <div className={`h-8 rounded-lg w-24 ${isDark ? 'bg-slate-800' : 'bg-gray-200'}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <ServicesGrid services={filteredServices} onSelectService={handleSelectService} />
      )}

      {/* ── Why Choose Us ─────────────────────────────────────────────────── */}
      {WHY_US.length > 0 && (
        <section className={`py-16 border-t transition-colors duration-300 ${isDark ? 'bg-[#10141c] border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {WHY_US.map(({ icon: Icon, label, desc, accent }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45 }}
                  className={`flex items-start gap-4 p-6 rounded-2xl border transition-colors ${isDark ? 'border-slate-800 bg-slate-900/50 hover:border-cyan-500/30' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                >
                  <div className={`flex-shrink-0 w-11 h-11 rounded-xl border flex items-center justify-center ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
                    <Icon className={`w-5 h-5 ${accent}`} />
                  </div>
                  <div>
                    <p className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{label}</p>
                    <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
