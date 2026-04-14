import { useState } from 'react';
import { Phone, Mail, MapPin, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from './header';
import { Footer } from './footer';
import { useTheme } from '../contexts/ThemeContext';

// ── types ────────────────────────────────────────────────────────────────────

interface ContactForm {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

// ── static data ───────────────────────────────────────────────────────────────

const infoCards: {
  icon: React.ReactNode;
  title: string;
  lines: string[];
  accent: string;
}[] = [
  {
    icon: <Phone className="w-6 h-6" />,
    title: 'Phone',
    lines: ['+233 242 123 456', '+233 302 987 654'],
    accent: 'text-blue-600 bg-blue-50',
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: 'Email',
    lines: ['support@autoservice.com', 'bookings@autoservice.com'],
    accent: 'text-emerald-600 bg-emerald-50',
  },
  {
    icon: <MapPin className="w-6 h-6" />,
    title: 'Location',
    lines: ['Osu, Accra', 'Greater Accra Region, Ghana'],
    accent: 'text-violet-600 bg-violet-50',
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: 'Hours',
    lines: ['Mon – Fri: 7 am – 7 pm', 'Sat – Sun: 8 am – 4 pm'],
    accent: 'text-amber-600 bg-amber-50',
  },
];

const subjectOptions = [
  { value: '', label: 'Select a subject' },
  { value: 'service',  label: 'Service Inquiry' },
  { value: 'parts',    label: 'Parts Question' },
  { value: 'pricing',  label: 'Pricing Information' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'other',    label: 'Other' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
};

// ── component ─────────────────────────────────────────────────────────────────

export function ContactPage() {
  const { isDark } = useTheme();
  const emptyForm: ContactForm = { name: '', email: '', phone: '', subject: '', message: '' };

  const [form, setForm]           = useState<ContactForm>(emptyForm);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // simulate async send
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 900);
  };

  const handleReset = () => {
    setForm(emptyForm);
    setSubmitted(false);
  };

  // shared input className
  const inputCls = isDark
    ? 'w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition'
    : 'w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#10141c]' : 'bg-white'}`}>
      <Header />

      {/* ── Hero ── */}
      <section>
        <div
          className="relative overflow-hidden py-36 md:py-48 w-full text-center"
          style={{
            backgroundImage: `url('/src/app/images/contactus.jpg')`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'left',
            backgroundColor: '#0f172a', // fallback dark bg
          }}
        >
          <div className="absolute inset-0 bg-[#0a1324]/65" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b1220]/90 via-[#0b1220]/68 to-[#0b1220]/45" />
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0) 35%, rgba(5,10,20,0.7) 100%)' }}
          />

          <motion.p
            className="text-white tracking-widest text-xs font-semibold uppercase mb-3"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Get in Touch
          </motion.p>
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Contact Us
          </motion.h1>
          <motion.p
            className="mt-4 max-w-lg mx-auto text-white text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            Have a question or need a quote? We're here to help — reach out any way that suits you.
          </motion.p>
        </div>
      </section>

      {/* ── Info cards ── */}
      <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {infoCards.map((card, i) => (
            <motion.div
              key={card.title}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className={`rounded-2xl border p-6 flex flex-col gap-3 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-gray-200 shadow-sm'}`}
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl border ${isDark ? 'bg-slate-800 border-slate-700 text-cyan-300' : `${card.accent} border-transparent`}`}>
                {card.icon}
              </div>
              <p className={`font-bold text-sm ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>{card.title}</p>
              {card.lines.map((line) => (
                <p key={line} className={`text-xs leading-relaxed -mt-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                  {line}
                </p>
              ))}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Form + Map ── */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Form card */}
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`rounded-3xl border p-8 ${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-gray-50 border-gray-200'}`}
          >
            <h2 className={`text-2xl font-extrabold mb-1 ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Send Us a Message</h2>
            <p className={`text-sm mb-7 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>We'll get back to you within 24 hours.</p>

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center gap-4 py-16 text-center"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-emerald-400" />
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-gray-900'}`}>Message Sent!</h3>
                  <p className={`text-sm max-w-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Thank you for reaching out. One of our team members will be in touch shortly.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Full Name */}
                  <div>
                    <label htmlFor="name" className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Kwame Mensah"
                      className={inputCls}
                    />
                  </div>

                  {/* Email + Phone side by side */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        Email <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="you@example.com"
                        className={inputCls}
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        Phone
                      </label>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+233 XXX XXX XXX"
                        className={inputCls}
                      />
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Subject <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      required
                      className={inputCls}
                    >
                      {subjectOptions.map((opt) => (
                        <option key={opt.value} value={opt.value} disabled={opt.value === ''}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                      Message <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={5}
                      required
                      placeholder="Tell us how we can help…"
                      className={`${inputCls} resize-none`}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md bg-cyan-500 hover:bg-cyan-400 disabled:bg-cyan-700 text-slate-950"
                  >
                    {loading ? 'Sending…' : 'Send Message'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Map */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className={`rounded-3xl overflow-hidden border min-h-[420px] lg:min-h-0 ${isDark ? 'border-slate-800' : 'border-gray-200'}`}
          >
            <iframe
              title="AutoService Pro Location – Osu, Accra, Ghana"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.9024194246537!2d-0.18538092414695!3d5.555029633975747!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf9084b2d34a6f%3A0x49e2c78db55fc1e!2sOsu%2C%20Accra%2C%20Ghana!5e0!3m2!1sen!2sgh!4v1710000000000"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '420px' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
