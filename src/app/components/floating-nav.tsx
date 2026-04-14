import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Shop', href: '/shop' },
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <>
      {/* Desktop Floating Nav */}
      <nav 
        className={`hidden md:flex fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
          isScrolling 
            ? 'backdrop-blur-md bg-white/10 border border-white/20 shadow-2xl' 
            : 'backdrop-blur-sm bg-white/5 border border-white/10'
        }`}
        style={{
          borderRadius: '9999px',
          padding: '0.75rem 2rem',
        }}
      >
        <div className="flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`text-sm font-medium transition-all duration-200 relative group ${
                isActive(link.href)
                  ? 'text-white'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {link.label}
              {isActive(link.href) && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"></span>
              )}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Floating Nav */}
      <div className="md:hidden fixed top-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="backdrop-blur-md bg-white/10 border border-white/20 p-3 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg"
        >
          {isOpen ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <Menu className="w-5 h-5 text-white" />
          )}
        </button>

        {isOpen && (
          <div className="absolute top-16 right-0 backdrop-blur-md bg-white/10 border border-white/20 rounded-3xl overflow-hidden shadow-xl">
            <div className="flex flex-col divide-y divide-white/10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`px-6 py-3 text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'text-white bg-white/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
