
import { Link } from 'react-router-dom';
import { Eye, Star, Zap, Heart, Shield, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Header } from './header';
import { Footer } from './footer';
import { useTheme } from '../contexts/ThemeContext';
import aboutus1 from '../images/aboutus1.jpg';
import aboutus2 from '../images/aboutus2.jpg';

const fadeUp: any = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, delay: i * 0.12, ease: 'easeOut' },
  }),
};

const stats: { value: string; label: string }[] = [
  { value: '5,000+', label: 'Cars Serviced' },
  { value: '8+',     label: 'Years Experience' },
  { value: '20+',    label: 'Expert Mechanics' },
  { value: '98%',    label: 'Customer Satisfaction' },
];

const values: { icon: React.ReactNode; title: string; description: string }[] = [
  {
    icon: <Eye className="w-7 h-7 text-cyan-400" />,
    title: 'Transparency',
    description:
      'We keep you fully informed — clear estimates, no hidden charges, and honest advice every step of the way.',
  },
  {
    icon: <Star className="w-7 h-7 text-emerald-600" />,
    title: 'Quality',
    description:
      'Only genuine parts and certified technicians touch your vehicle. We never cut corners on craftsmanship.',
  },
  {
    icon: <Zap className="w-7 h-7 text-amber-500" />,
    title: 'Speed',
    description:
      'Efficient workflows and a well-stocked parts inventory mean faster turnaround without sacrificing precision.',
  },
  {
    icon: <Heart className="w-7 h-7 text-red-500" />,
    title: 'Customer Care',
    description: 'We treat every customer like family and every car like our own.',
  },
  {
    icon: <Shield className="w-7 h-7 text-slate-300" />,
    title: 'Integrity',
    description: 'We do the right thing, always — your trust is our most valuable asset.',
  },
  {
    icon: <Users className="w-7 h-7 text-blue-400" />,
    title: 'Teamwork',
    description: 'Our collaborative spirit ensures the best results for you and your vehicle.',
  },
];

const team: { initials: string; name: string; specialty: string; color: string }[] = [
  { initials: 'KA', name: 'Kwame Asante',  specialty: 'Engine & Diagnostics', color: 'from-blue-500 to-blue-700' },
  { initials: 'AA', name: 'Ama Acheampong', specialty: 'Electrical Systems',   color: 'from-emerald-500 to-emerald-700' },
  { initials: 'EB', name: 'Elikem Boateng', specialty: 'Transmission & Brakes', color: 'from-violet-500 to-violet-700' },
];

export function AboutPage() {
  const { isDark } = useTheme();
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-white'}`}>
      <Header />

      {/* ── Hero ── */}
      <section className="pt-4 sm:pt-8">
        <div className="relative overflow-hidden w-full h-[520px] sm:h-[650px] flex items-center justify-center">
          <img
            src={aboutus1}
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
              Who We Are
            </motion.h1>
          </div>
        </div>
      </section>

      {/* ── Stats row ── */}
      <section className={`border-b transition-colors duration-300 ${isDark ? 'bg-[#10141c] border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
        <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <p className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>{s.value}</p>
              <p className={`mt-1 text-sm font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className={`py-20 px-4 transition-colors duration-300 ${isDark ? '' : 'bg-white'}`}>
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* text */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className={`inline-block text-xs font-semibold tracking-widest uppercase mb-3 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
              Our Story
            </span>
            <h2 className={`text-3xl sm:text-4xl font-extrabold mb-6 leading-snug ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>
              From a Single Bay to a Full Workshop
            </h2>
            <div className={`space-y-4 leading-relaxed ${isDark ? 'text-slate-300/80' : 'text-gray-600'}`}>
              <p>
                Founded in 2016, AutoService Pro began as a single-bay workshop in Osu, Accra with one goal: to give every vehicle owner fair, transparent service they could actually trust.
              </p>
              <p>
                Word spread fast. Within two years we expanded to a full-scale workshop with eight service bays, a dedicated parts store, and a team of 20+ certified technicians covering everything from routine maintenance to complex electrical fault-finding.
              </p>
              <p>
                Today we serve thousands of satisfied customers across Greater Accra — and we still hold the same values we started with on day one.
              </p>
            </div>
          </motion.div>

          {/* AutoService Pro section with aboutus2 image and tags */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative aspect-[4/5] max-h-[420px] md:max-h-[500px] lg:max-h-[580px] rounded-3xl overflow-hidden shadow-xl flex items-center"
          >
            <img
              src={aboutus2}
              alt="AutoService Pro"
              className="absolute inset-0 w-full h-full object-cover object-center z-0"
              style={{ objectFit: 'cover' }}
            />
            {/* Removed blue overlay for AutoService Pro image */}
            <div className="relative z-20 flex flex-col items-center justify-center gap-4 p-8 text-white text-center w-full h-full">
              <p className="text-xl font-bold tracking-tight">AutoService Pro</p>
              <p className="text-blue-100 text-sm max-w-xs">
                Precision care for every vehicle. Osu, Accra — since 2016.
              </p>
              <div className="flex gap-3 mt-2 flex-wrap justify-center">
                {['Engine', 'Brakes', 'Electrics', 'Tyres'].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Core Values ── */}
      <section className={`py-20 px-4 transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-gray-50'}`}>
        <div className="max-w-5xl mx-auto text-center mb-12">
          <span className={`inline-block text-xs font-semibold tracking-widest uppercase mb-3 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>
            What Drives Us
          </span>
          <h2 className={`text-3xl sm:text-4xl font-extrabold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Our Core Values</h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`group relative rounded-2xl border p-8 shadow-sm transition-colors ${isDark ? 'border-slate-800 bg-slate-900/50 hover:border-cyan-500/30' : 'border-gray-200 bg-white hover:border-blue-300'}`}
            >
              <div className={`mb-5 inline-flex items-center justify-center w-14 h-14 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-100 border-gray-200'}`}>
                {v.icon}
              </div>
              <h3 className={`text-lg font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{v.title}</h3>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>{v.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Team section removed as requested ── */}

      <Footer />
    </div>
  );
}
