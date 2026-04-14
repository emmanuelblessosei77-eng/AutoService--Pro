import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Twitter, Instagram, ArrowRight } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useTheme } from '../contexts/ThemeContext';

export function Footer() {
  const year = new Date().getFullYear();
  const { isDark } = useTheme();

  return (
    <footer className={`transition-colors duration-300 ${isDark ? 'bg-[#0b1220] text-white' : 'bg-gray-100 text-gray-800 border-t border-gray-200'}`}>
      {/* Main footer content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-14 pb-8 sm:pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1 text-center sm:text-left">
            <div className="mb-4 flex items-center justify-center sm:justify-start">
              <BrandLogo size={64} darkMode={isDark} className="drop-shadow-[0_0_10px_rgba(0,174,239,0.2)]" />
            </div>
            <p className={`text-sm leading-relaxed mb-5 max-w-xs mx-auto sm:mx-0 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Certified mechanics. Transparent pricing. Real-time tracking.
              Serving Accra and beyond since 2016.
            </p>
            <div className="flex gap-3 justify-center sm:justify-start">
              {[Facebook, Twitter, Instagram].map((Icon, i) => (
                <button
                  key={i}
                  className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isDark ? 'bg-white/8 hover:bg-cyan-600 text-white' : 'bg-gray-300 hover:bg-blue-600 text-gray-700 hover:text-white'}`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { to: '/', label: 'Home' },
                { to: '/services', label: 'Our Services' },
                { to: '/shop', label: 'Parts Shop' },
                { to: '/about', label: 'About Us' },
                { to: '/contact', label: 'Contact' },
              ].map(({ to, label }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className={`flex items-center gap-1.5 text-sm py-0.5 transition-colors group ${isDark ? 'text-slate-400 hover:text-cyan-200' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Our Services</h4>
            <ul className="space-y-2.5">
              {['Oil Change', 'Diagnostic Testing', 'Engine Servicing', 'Battery Service', 'Tire Replacement', 'Brake Service'].map((s) => (
                <li key={s}>
                  <Link
                    to="/services"
                    className={`flex items-center gap-1.5 text-sm py-0.5 transition-colors group ${isDark ? 'text-slate-400 hover:text-cyan-200' : 'text-gray-600 hover:text-blue-600'}`}
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {s}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>Contact Us</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:+233242123456" className={`flex items-start gap-3 text-sm transition-colors ${isDark ? 'text-slate-400 hover:text-cyan-200' : 'text-gray-600 hover:text-blue-600'}`}>
                  <Phone className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-cyan-300' : 'text-blue-500'}`} />
                  +233 242 123 456
                </a>
              </li>
              <li>
                <a href="mailto:support@autoservicepro.gh" className={`flex items-start gap-3 text-sm transition-colors ${isDark ? 'text-slate-400 hover:text-cyan-200' : 'text-gray-600 hover:text-blue-600'}`}>
                  <Mail className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-cyan-300' : 'text-blue-500'}`} />
                  support@autoservicepro.gh
                </a>
              </li>
              <li className={`flex items-start gap-3 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                <MapPin className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-cyan-300' : 'text-blue-500'}`} />
                <span>Osu Oxford Street,<br />Accra, Ghana</span>
              </li>
              <li className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                <span className={`font-semibold ${isDark ? 'text-cyan-300' : 'text-blue-600'}`}>Hours:</span> Mon–Sat 7am–7pm
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`border-t ${isDark ? 'border-slate-800' : 'border-gray-200'}`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-center sm:text-left ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
          <p>&copy; {year} AutoService Pro Ghana. All rights reserved.</p>
          <div className="flex items-center justify-center flex-wrap gap-4">
            <Link to="/contact" className={`transition-colors ${isDark ? 'hover:text-cyan-200' : 'hover:text-blue-600'}`}>Privacy Policy</Link>
            <Link to="/contact" className={`transition-colors ${isDark ? 'hover:text-cyan-200' : 'hover:text-blue-600'}`}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
