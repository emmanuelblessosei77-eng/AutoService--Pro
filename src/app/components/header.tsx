import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn, UserPlus, Sun, Moon } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';
import { useTheme } from '../contexts/ThemeContext';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/services', label: 'Services' },
    { path: '/shop', label: 'Shop' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ];

  return (
    <header className={`fixed top-0 w-full z-50 backdrop-blur-md shadow-sm transition-colors duration-300 ${isDark ? 'bg-[#0b1220]/92 border-b border-slate-800/90' : 'bg-white/95 border-b border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between">

        {/* Brand Logo */}
        <Link to="/" className="flex h-full items-center py-2 pr-2 sm:pr-4 hover:opacity-90 transition-opacity flex-shrink-0">
          <BrandLogo size={58} darkMode={isDark} className="drop-shadow-[0_0_10px_rgba(0,174,239,0.2)]" />
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                isActive(link.path)
                  ? (isDark ? 'text-cyan-200 bg-cyan-500/15' : 'text-blue-600 bg-blue-50')
                  : (isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100')
              }`}
            >
              {link.label}
              {isActive(link.path) && (
                <motion.span
                  layoutId="nav-indicator"
                  className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${isDark ? 'bg-cyan-300' : 'bg-blue-600'}`}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`p-2 rounded-lg transition-colors ${isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800/70' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link
            to="/login"
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-lg transition-all ${isDark ? 'text-slate-300 hover:text-cyan-200 hover:bg-slate-800/70' : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'}`}
          >
            <LogIn className="w-4 h-4" /> Login
          </Link>
          <Link
            to="/register"
            className="flex items-center gap-1.5 px-4 py-2 text-slate-950 text-sm font-semibold rounded-lg transition-all shadow-sm bg-cyan-500 hover:bg-cyan-400 shadow-cyan-900/40"
          >
            <UserPlus className="w-4 h-4" /> Get Started
          </Link>
        </div>

        {/* Mobile: Theme toggle + Burger */}
        <div className="flex md:hidden items-center gap-1.5">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800/80 text-slate-300' : 'hover:bg-gray-100 text-gray-500'}`}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-slate-800/80' : 'hover:bg-gray-100'}`}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-gray-700'}`} /> : <Menu className={`w-5 h-5 ${isDark ? 'text-slate-200' : 'text-gray-700'}`} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`md:hidden overflow-hidden shadow-lg ${isDark ? 'bg-[#0b1220] border-t border-slate-800' : 'bg-white border-t border-gray-200'}`}
          >
            <div className="px-4 py-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive(link.path)
                      ? (isDark ? 'bg-cyan-500/15 text-cyan-200' : 'bg-blue-50 text-blue-600')
                      : (isDark ? 'text-slate-200 hover:bg-slate-800/70' : 'text-gray-700 hover:bg-gray-50')
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center px-4 py-3 rounded-xl text-sm font-semibold transition-all text-slate-950 bg-cyan-500 hover:bg-cyan-400"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login / Signup
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
