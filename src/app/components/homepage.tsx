import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { CalendarDays, Wrench, Car, Star, ArrowRight, CheckCircle, Shield, Clock, Phone, Mail, MapPin, ChevronDown } from 'lucide-react';
import { Header } from './header';
import { Footer } from './footer';
import { useTheme } from '../contexts/ThemeContext';
import { BookingForm } from './BookingForm';
import { PartCard } from './sections/PartCard';
import { ServiceCard } from './sections/ServiceCard';
import { services as servicesAPI, carParts as carPartsAPI } from '../../services/api';
import carouselImg from '../images/carousel2.jpg';
import deserveImg from '../images/deserve.jpg';
import aboutus2Img from '../images/aboutus2.jpg';
import oilChangeImg from '../images/oil-change.jpg';
import diagnosisImg from '../images/diagnosis1.jpg';
import brakeServiceImg from '../images/brakeservice.jpg';
import batteryImg from '../images/battery.jpg';
import airFilterReplImg from '../images/airfilterreplacement.jpg';
import airFilterImg from '../images/airfilter.jpg';
import generalRepairImg from '../images/general-repair.jpg';
import tireServiceImg from '../images/tire-services.jpg';
import transmissionImg from '../images/transmissionfluid.jpg';
import brakePadImg from '../images/brake pad set.jpg';
import premiumOilImg from '../images/premium oil filter.jpg';
import alternatorImg from '../images/altenator.jpg';
import shockAbsorberImg from '../images/shock absorber.jpg';
import tireImg from '../images/tire-114259_1920.jpg';

const SERVICE_IMAGES: Record<string, string> = {
  'oil change': oilChangeImg,
  'diagnostic': diagnosisImg,
  'diagnostics': diagnosisImg,
  'brake service': brakeServiceImg,
  'brake': brakeServiceImg,
  'battery': batteryImg,
  'air filter replacement': airFilterReplImg,
  'air filter': airFilterImg,
  'general repair': generalRepairImg,
  'general': generalRepairImg,
  'tire': tireServiceImg,
  'tyre': tireServiceImg,
  'transmission': transmissionImg,
};

function resolveServiceImg(name: string, fallback?: string): string | undefined {
  const key = (name || '').toLowerCase();
  for (const [k, v] of Object.entries(SERVICE_IMAGES)) {
    if (key.includes(k)) return v;
  }
  return fallback;
}

const PART_IMAGES: Record<string, string> = {
  'brake pad': brakePadImg,
  'air filter replacement': airFilterReplImg,
  'air filter': airFilterImg,
  'premium oil filter': premiumOilImg,
  'oil filter': premiumOilImg,
  'battery': batteryImg,
  'alternator': alternatorImg,
  'shock absorber': shockAbsorberImg,
  'tire': tireImg,
  'tyre': tireImg,
  'transmission fluid': transmissionImg,
};

function resolvePartImg(name: string, fallback?: string | null): string | undefined {
  const key = (name || '').toLowerCase();
  for (const [k, v] of Object.entries(PART_IMAGES)) {
    if (key.includes(k)) return v;
  }
  return fallback ?? undefined;
}

// ─── Location Bar ───────────────────────────────────────────────────────────

function LocationBar() {
  const { isDark } = useTheme();
  return (
    <div className={`w-full text-xs py-2.5 px-4 border-b transition-colors duration-300 ${isDark ? 'bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 text-gray-200 border-white/10' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <a
            href="https://maps.google.com/?q=Osu,+Accra,+Ghana"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 hover:text-white transition-colors min-w-0"
          >
            <span className="w-5 h-5 rounded-full bg-blue-500/15 ring-1 ring-blue-300/30 inline-flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 transition-colors">
              <MapPin className="w-3 h-3 text-blue-300" />
            </span>
            <span className="truncate">Osu, Accra, Ghana</span>
          </a>
        </div>
        <div className="flex items-center gap-3">
          <a href="tel:+233242123456" className="group inline-flex items-center gap-2 hover:text-white transition-colors">
            <span className="w-5 h-5 rounded-full bg-blue-500/15 ring-1 ring-blue-300/30 inline-flex items-center justify-center flex-shrink-0 group-hover:bg-blue-500/25 transition-colors">
              <Phone className="w-3 h-3 text-blue-300" />
            </span>
            <span>+233 242 123 456</span>
          </a>
          <span className="hidden sm:inline-flex items-center gap-2 text-gray-300">
            <span className="w-5 h-5 rounded-full bg-blue-500/15 ring-1 ring-blue-300/30 inline-flex items-center justify-center flex-shrink-0">
              <Clock className="w-3 h-3 text-blue-300" />
            </span>
            Mon-Fri: 9AM-6PM
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Service {
  id: number | string;
  name?: string;
  title?: string;
  description?: string;
  price?: number;
  image_url?: string;
  image?: string;
}

interface CarPart {
  id: number | string;
  name: string;
  price: number;
  image_url?: string;
  image?: string;
  stock_quantity?: number;
  quantity?: number;
  is_available?: boolean;
  description?: string;
}

// ─── Animated Counter ─────────────────────────────────────────────────────────

interface CounterProps {
  target: string;
  duration?: number;
}

function AnimatedCounter({ target, duration = 1800 }: CounterProps) {
  const [display, setDisplay] = useState('0');
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const cleaned = target.replace(/,/g, '');
    const match = cleaned.match(/^(\d+)(.*)$/);
    if (!match) { setDisplay(target); return; }
    const end = parseInt(match[1], 10);
    const suffix = match[2];
    let start = 0;
    const step = Math.ceil(end / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      setDisplay(start.toLocaleString() + suffix);
      if (start >= end) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{display}</span>;
}

// ─── Hero Section (Static Premium — Wix-style) ───────────────────────────────

interface HeroSectionProps {
  onBookClick: () => void;
}

function HeroSection({ onBookClick }: HeroSectionProps) {
  const { isDark } = useTheme();
  return (
    <section className={`relative min-h-[92vh] flex items-center overflow-hidden ${isDark ? 'bg-[#10141c]' : 'bg-gray-900'}`}>
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={carouselImg}
          alt="Car Service Hero"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-[#0a1324]/65" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/90 via-[#0b1220]/68 to-[#0b1220]/45" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at center, rgba(0,0,0,0) 35%, rgba(5,10,20,0.7) 100%)'
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 lg:px-16 pt-24 pb-20">
        <div className="max-w-3xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6"
          >
            <span className="text-cyan-300 text-lg md:text-2xl font-black tracking-tight leading-none">
              Welcome to AutoService Pro
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.0] tracking-tight mb-6"
          >
            Expert Car
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-cyan-300 to-blue-400 drop-shadow-[0_4px_14px_rgba(34,211,238,0.28)]">
              Service &amp; Repair
            </span>
            <span className="block text-white font-extrabold">Done Right.</span>
          </motion.h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-base md:text-lg text-slate-200/90 leading-relaxed mb-8 max-w-xl"
          >
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-5 text-sm text-slate-300"
          >
            {[
              { icon: Shield, text: 'Certified Technicians' },
              { icon: CheckCircle, text: 'Satisfaction Guaranteed' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2">
                <Icon className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                <span>{text}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1"
      >
        <span className="text-xs text-gray-500 uppercase tracking-widest">Scroll</span>
        <ChevronDown className="w-5 h-5 text-gray-500 animate-bounce" />
      </motion.div>

      {/* Floating contact bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className="absolute bottom-0 right-0 z-10 hidden lg:flex items-center gap-0"
      >
        <a
          href="tel:+233000000000"
          className="flex items-center gap-2.5 bg-cyan-500 text-slate-950 px-6 py-4 text-sm font-semibold hover:bg-cyan-400 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Call Us Now
        </a>
        <a
          href="#location"
          className="flex items-center gap-2.5 bg-white/10 backdrop-blur-sm border-l border-white/20 text-white px-6 py-4 text-sm font-semibold hover:bg-white/20 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Find Us
        </a>
      </motion.div>
    </section>
  );
}

// ─── About Us Card ──────────────────────────────────────────────────────────

function AboutUsCard() {
  const { isDark } = useTheme();
  return (
    <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className={`rounded-2xl overflow-hidden shadow-[0_20px_60px_-30px_rgba(8,47,73,0.15)] flex flex-col lg:flex-row-reverse border backdrop-blur-sm ${isDark ? 'bg-slate-900/55 border-slate-700/70' : 'bg-gray-50 border-gray-200'}`}>

          {/* Image — right side */}
          <div className="relative lg:w-[45%] h-72 lg:h-auto min-h-[340px] flex-shrink-0">
            <img
              src={aboutus2Img}
              alt="About AutoService Pro"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-black/35" />
          </div>

          {/* Text — left side */}
          <motion.div
            className="lg:w-[55%] flex flex-col justify-center px-8 py-12 lg:px-14 lg:py-16 gap-7"
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <span className={`inline-block text-xs font-semibold tracking-widest uppercase ${isDark ? 'text-cyan-300' : 'text-blue-600'}`}>
              About Us
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold leading-snug ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
              Accra's Trusted Auto Workshop
            </h2>
            <p className={`text-base leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
              Founded in 2016 in Osu, Accra, AutoService Pro has grown from a single bay into a full-scale workshop. We combine certified expertise with honest, transparent service — so you always know exactly what's happening with your vehicle.
            </p>

            <ul className="grid grid-cols-2 gap-3">
              {[
                { icon: CheckCircle, text: '5,000+ Cars Serviced',    color: isDark ? 'text-emerald-300' : 'text-emerald-600' },
                { icon: Shield,       text: '20+ Certified Mechanics', color: isDark ? 'text-sky-300' : 'text-sky-600' },
                { icon: Star,         text: '98% Satisfaction Rate',   color: isDark ? 'text-amber-300' : 'text-amber-500' },
                { icon: Clock,        text: 'In Business Since 2016',  color: isDark ? 'text-violet-300' : 'text-violet-600' },
              ].map(({ icon: Icon, text, color }) => (
                <li key={text} className={`flex items-center gap-2.5 text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>
                  <Icon className={`w-4 h-4 flex-shrink-0 ${color}`} />
                  {text}
                </li>
              ))}
            </ul>

            <div>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold px-6 py-3 rounded-xl transition-colors"
              >
                Learn More About Us
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Why Choose Us ───────────────────────────────────────────────────────────

const reasons = [
  {
    icon: Shield,
    title: 'Certified & Vetted',
    desc: 'Every mechanic on our platform is background-checked, certified, and continuously trained on the latest vehicle technology.',
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-slate-900/60',
  },
  {
    icon: CheckCircle,
    title: 'Transparent Pricing',
    desc: 'No hidden fees — ever. You see the full cost breakdown before confirming. What you see is exactly what you pay.',
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-slate-900/60',
  },
  {
    icon: Clock,
    title: 'Fast & Reliable',
    desc: 'Most services are completed same-day. Track your vehicle\'s progress in real time, directly from your dashboard.',
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-slate-900/60',
  },
  {
    icon: Car,
    title: 'All Makes & Models',
    desc: 'From Hyundai to Toyota to Mercedes — our team has the expertise and tools to handle every make and model on Ghanaian roads.',
    color: 'from-orange-500 to-orange-600',
    bg: 'bg-slate-900/60',
  },
];

function WhyChooseUs() {
  const { isDark } = useTheme();
  return (
    <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-200' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
            Why AutoService Pro
          </span>
          <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Built for Ghanaian Roads</h2>
          <p className={`mt-3 text-base max-w-xl mx-auto ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            We understand the local market and your vehicle's needs — from Accra traffic to up-country terrain.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {reasons.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              viewport={{ once: true }}
              className={`rounded-2xl p-6 border hover:shadow-lg transition-all duration-300 flex flex-col gap-4 ${isDark ? 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/40' : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-blue-50'}`}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${r.color} flex items-center justify-center shadow-md`}>
                <r.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className={`text-base font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{r.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300/85' : 'text-gray-600'}`}>{r.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

const steps = [
  {
    number: 1,
    Icon: CalendarDays,
    title: 'Book Online',
    description: 'Choose your service, pick a date and time that suits you, and confirm your booking in under two minutes.',
  },
  {
    number: 2,
    Icon: Car,
    title: 'Come to Our Shop',
    description: 'Drive in or drop off your vehicle at our workshop in Osu, Accra. Our team will be ready to receive you.',
  },
  {
    number: 3,
    Icon: Wrench,
    title: 'We Diagnose & Fix',
    description: 'Our certified mechanics inspect your vehicle, diagnose any issues, and carry out expert repairs — keeping you updated throughout.',
  },
  {
    number: 4,
    Icon: CheckCircle,
    title: 'Drive Away Happy',
    description: 'Pick up your fully serviced vehicle and get back on the road with confidence — with a full service report in hand.',
  },
];

function HowItWorks() {
  const { isDark } = useTheme();
  return (
    <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-white'}`}>
      <div className="max-w-5xl mx-auto px-4">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-200' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
            Simple Process
          </span>
          <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>How It Works</h2>
          <p className={`mt-3 text-base max-w-xl mx-auto ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Getting your car serviced has never been easier — three straightforward steps.
          </p>
        </motion.div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-10 md:gap-0">
          <div className={`hidden md:block absolute top-10 left-[calc(12.5%+1.5rem)] right-[calc(12.5%+1.5rem)] h-0.5 ${isDark ? 'bg-cyan-500/25' : 'bg-blue-200'}`} />
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="flex-1 flex flex-col items-center text-center px-4 relative"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true }}
            >
              <div className={`relative z-10 w-20 h-20 rounded-full backdrop-blur-md border flex flex-col items-center justify-center mb-5 ${isDark ? 'bg-white/10 border-cyan-300/50 shadow-[0_0_0_1px_rgba(34,211,238,0.2),0_10px_26px_-16px_rgba(34,211,238,0.5)]' : 'bg-blue-50 border-blue-300 shadow-[0_4px_20px_-8px_rgba(37,99,235,0.3)]'}`}>
                <span className={`text-xs font-bold leading-none ${isDark ? 'text-cyan-200' : 'text-blue-600'}`}>0{step.number}</span>
                <step.Icon className={`w-6 h-6 mt-1 ${isDark ? 'text-cyan-100' : 'text-blue-600'}`} />
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{step.title}</h3>
              <p className={`text-sm leading-relaxed max-w-xs ${isDark ? 'text-slate-300/85' : 'text-gray-600'}`}>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Services ────────────────────────────────────────────────────────

function FeaturedServicesStrip({ services }: { services: Service[] }) {
  const shown = services.slice(0, 3);
  const { isDark } = useTheme();

  return (
    <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-200' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
            Our Services
          </span>
          <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Featured Services</h2>
          <p className={`mt-3 text-base max-w-xl mx-auto ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Professional care for every make and model on Ghanaian roads.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
          {shown.map((service, i) => {
            const title = service.title ?? service.name ?? 'Service';
            const img = resolveServiceImg(title, service.image_url ?? service.image);
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <ServiceCard
                  title={title}
                  description={service.description}
                  price={service.price ?? ''}
                  imageUrl={img}
                  bookHref="/register"
                />
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link
            to="/services"
            className="inline-flex items-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-6 py-3 rounded-xl hover:bg-cyan-400 transition-colors shadow-sm text-sm"
          >
            View All Services
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Featured Shop Items ──────────────────────────────────────────────────────

function FeaturedShopStrip({ parts }: { parts: CarPart[] }) {
  const available = parts
    .filter(p => {
      if (p.is_available !== undefined) return p.is_available;
      const qty = p.stock_quantity ?? p.quantity ?? 1;
      return qty > 0;
    })
    .slice(0, 3);
  const { isDark } = useTheme();

  return (
    <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-white'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'bg-emerald-500/10 border border-emerald-400/30 text-emerald-200' : 'bg-emerald-50 border border-emerald-200 text-emerald-700'}`}>
            Auto Parts Shop
          </span>
          <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Genuine Parts &amp; Accessories</h2>
          <p className={`mt-3 text-base max-w-xl mx-auto ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Quality parts sourced directly from trusted suppliers — at competitive prices.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-stretch">
          {available.map((part, i) => {
            const img = resolvePartImg(part.name, part.image_url ?? part.image);
            return (
              <motion.div
                key={part.id}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: i * 0.08 }}
                viewport={{ once: true }}
              >
                <PartCard
                  name={part.name}
                  price={part.price}
                  imageUrl={img}
                  description={part.description}
                  stockQuantity={part.stock_quantity ?? part.quantity}
                  actionLabel="Shop Now"
                  actionHref="/shop"
                />
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="text-center mt-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
        >
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-cyan-500 text-slate-950 font-semibold px-6 py-3 rounded-xl hover:bg-cyan-400 transition-colors shadow-sm text-sm"
          >
            View Shop
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Location Section ────────────────────────────────────────────────────────

function LocationSection() {
  const { isDark } = useTheme();
  return (
    <section id="location" className={`py-20 transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-gray-50'}`}>
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${isDark ? 'bg-cyan-500/10 border border-cyan-400/30 text-cyan-200' : 'bg-blue-50 border border-blue-200 text-blue-600'}`}>
            Find Us
          </span>
          <h2 className={`text-3xl md:text-4xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Our Location</h2>
          <p className={`mt-3 text-base max-w-xl mx-auto ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
            Visit us at our workshop in Osu, Accra. We're easy to find and always ready to receive you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Info cards */}
          <motion.div
            className="flex flex-col gap-5"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <div className={`rounded-2xl p-6 border flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200'}`}>
              <MapPin className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Address</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  Osu, Accra<br />
                  Ghana
                </p>
                <a
                  href="https://maps.google.com/?q=Osu,+Accra,+Ghana"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 mt-2 text-xs font-semibold transition-colors ${isDark ? 'text-cyan-300 hover:text-cyan-200' : 'text-blue-600 hover:text-blue-700'}`}
                >
                  Get Directions <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            <div className={`rounded-2xl p-6 border flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200'}`}>
              <Phone className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Phone</h3>
                <a href="tel:+233242123456" className={`text-sm transition-colors ${isDark ? 'text-slate-300 hover:text-cyan-300' : 'text-gray-600 hover:text-blue-600'}`}>+233 242 123 456</a>
              </div>
            </div>

            <div className={`rounded-2xl p-6 border flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200'}`}>
              <Mail className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Email</h3>
                <a href="mailto:info@autoservice.com" className={`text-sm transition-colors ${isDark ? 'text-slate-300 hover:text-cyan-300' : 'text-gray-600 hover:text-blue-600'}`}>info@autoservice.com</a>
              </div>
            </div>

            <div className={`rounded-2xl p-6 border flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow ${isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-gray-200'}`}>
              <Clock className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <h3 className={`font-semibold mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Working Hours</h3>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                  Monday – Friday: 7am – 7pm<br />
                  Saturday: 8am – 5pm<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </motion.div>

          {/* Map */}
          <motion.div
            className={`lg:col-span-2 rounded-2xl overflow-hidden shadow-lg border h-96 lg:h-full min-h-80 ${isDark ? 'border-slate-800' : 'border-gray-200'}`}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <iframe
              title="AutoService Pro Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.7958!2d-0.1870!3d5.5501!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2d34a333%3A0xb78caa5729e32d5b!2sOxford%20Street%2C%20Osu%2C%20Accra%2C%20Ghana!5e0!3m2!1sen!2sgh!4v1700000000000"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '320px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

const testimonials = [
  {
    name: 'Kwame Asante',
    location: 'Accra, Ghana',
    text: 'Booked online in under two minutes. The mechanics were professional and my car was ready ahead of schedule. Absolutely brilliant service — I recommend AutoService Pro to everyone.',
  },
  {
    name: 'Abena Mensah',
    location: 'Kumasi, Ghana',
    text: 'I was kept updated throughout the entire repair process. Pricing was fully transparent with no hidden charges whatsoever. I would highly recommend AutoService Pro.',
  },
  {
    name: 'Samuel Osei',
    location: 'Tema, Ghana',
    text: 'Best auto workshop in Ghana. The 24/7 support line is a lifesaver — they helped me out on a Sunday evening when I broke down. Five stars without question.',
  },
];

function Testimonials() {
  const { isDark } = useTheme();
  return (
    <section className={`py-20 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-[#0f1c3f]' : 'bg-blue-600'}`}>
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 25px 25px, white 2px, transparent 0), radial-gradient(circle at 75px 75px, white 2px, transparent 0)', backgroundSize: '100px 100px' }}
      />
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -16 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-bold uppercase tracking-widest mb-4">
            Customer Stories
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">Trusted Across Ghana</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: i * 0.12 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 flex flex-col gap-4 hover:bg-white/15 transition-colors duration-300"
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-white/90 text-sm leading-relaxed flex-1">"{t.text}"</p>
              <div className="flex items-center gap-3 pt-3 border-t border-white/20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{t.name}</p>
                  <p className="text-xs text-blue-100 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {t.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Banner ───────────────────────────────────────────────────────────────

interface CTABannerProps {
  onBook: () => void;
}

function CTABanner({ onBook }: CTABannerProps) {
  return (
    <section className="relative py-36 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <img
          src={deserveImg}
          alt="Car service"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gray-900/80" />
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-bold uppercase tracking-widest mb-6">
            Get Started Today
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
            Your Car Deserves
            <span className="text-cyan-300"> Expert Care.</span>
          </h2>
          <p className="text-gray-300 text-base md:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied Ghanaian drivers who trust AutoService Pro with their vehicles.
            Book a service today or explore our full parts catalogue.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={onBook}
              className="inline-flex items-center justify-center gap-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg shadow-cyan-900/35 transition-all text-base"
            >
              <CalendarDays className="w-5 h-5" />
              Book a Service
            </motion.button>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2.5 border-2 border-white/25 bg-white/5 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/10 hover:border-white/40 transition-all text-base"
              >
                Browse Parts Shop
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Homepage ─────────────────────────────────────────────────────────────────

export function Homepage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [fetchedServices, setFetchedServices] = useState<Service[]>([]);
  const [fetchedParts, setFetchedParts] = useState<CarPart[]>([]);

  useEffect(() => {
    servicesAPI.getAll()
      .then((data: unknown) => { if (Array.isArray(data)) setFetchedServices(data as Service[]); })
      .catch((err: unknown) => console.error('Failed to fetch services:', err));
  }, []);

  useEffect(() => {
    carPartsAPI.getAll()
      .then((data: unknown) => { if (Array.isArray(data)) setFetchedParts(data as CarPart[]); })
      .catch((err: unknown) => console.error('Failed to fetch car parts:', err));
  }, []);

  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-white'}`}>
      <div>
        <LocationBar />
        <Header />
        <HeroSection onBookClick={() => setIsBookingOpen(true)} />
        <AboutUsCard />
        <HowItWorks />
        <FeaturedServicesStrip services={fetchedServices} />
        <FeaturedShopStrip parts={fetchedParts} />
        <LocationSection />
        <CTABanner onBook={() => setIsBookingOpen(true)} />
        <BookingForm isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />
        <Footer />
      </div>
    </div>
  );
}
