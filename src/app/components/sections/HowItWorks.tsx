import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Zap, Smartphone, Shield, DollarSign, Clock, Award, CheckCircle, Headphones } from 'lucide-react';

type FeatureType = {
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  stat?: string;
  highlight: string;
};

const FEATURES: FeatureType[] = [
  { 
    title: 'Lightning Fast Service', 
    description: 'Most services completed within 2-4 hours. Get your vehicle back on the road quickly without compromising quality.',
    icon: Zap,
    stat: '2-4 hrs',
    highlight: 'from-blue-500 to-cyan-500'
  },
  { 
    title: 'Online Booking', 
    description: 'Book your appointment anytime, anywhere. Choose your preferred date and time with our instant confirmation system.',
    icon: Smartphone,
    stat: '24/7',
    highlight: 'from-purple-500 to-pink-500'
  },
  { 
    title: 'Warranty Guaranteed', 
    description: 'All work backed by 12-month warranty. Complete peace of mind with our quality assurance guarantee.',
    icon: Shield,
    stat: '12 Months',
    highlight: 'from-emerald-500 to-teal-500'
  },
  { 
    title: 'Transparent Pricing', 
    description: 'No hidden fees. Get a detailed quote upfront before we start any work on your vehicle.',
    icon: DollarSign,
    stat: '100%',
    highlight: 'from-amber-500 to-orange-500'
  },
  { 
    title: 'Expert Technicians', 
    description: 'Certified professionals with 10+ years experience. Every technician trained on latest vehicle technology.',
    icon: Award,
    stat: '10+ yrs',
    highlight: 'from-red-500 to-rose-500'
  },
  { 
    title: 'Real-Time Updates', 
    description: 'Track your service progress in real-time. Receive SMS updates at every stage of your service.',
    icon: Headphones,
    stat: 'Live',
    highlight: 'from-indigo-500 to-blue-500'
  },
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const featureCardVariants = {
  hidden: {
    opacity: 0,
    y: 40,
    rotateY: -15,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    transition: {
      type: 'spring',
      stiffness: 80,
      damping: 15,
    },
  },
  hover: {
    y: -12,
    rotateY: 5,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10,
    },
  },
};

const iconVariants = {
  hidden: { scale: 0, rotate: -180 },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 120,
      damping: 12,
      delay: 0.2,
    },
  },
  hover: {
    scale: 1.15,
    rotate: 10,
    transition: { duration: 0.3 },
  },
};

const statBadgeVariants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      delay: 0.3,
    },
  },
};

export function HowItWorks() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Respect user motion preferences
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return (
    <section className="py-24 bg-gradient-to-b from-white via-blue-50 to-white overflow-hidden" ref={containerRef} role="region" aria-labelledby="features-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <motion.div
          className="mb-20 text-center"
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block px-4 py-2 rounded-full bg-blue-100 border border-blue-300 text-blue-600 text-sm font-semibold mb-6"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            ✨ WHY CHOOSE US
          </motion.span>

          <h2 
            id="features-title"
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Service Excellence<br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Built for You
            </span>
          </h2>
          
          <motion.p 
            className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Experience automotive service reimagined. We combine cutting-edge technology with expert craftsmanship to deliver unmatched reliability and transparency.
          </motion.p>

          <motion.div
            className="flex justify-center mt-8 gap-2"
            initial={{ scaleX: 0, opacity: 0 }}
            whileInView={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            style={{ originX: 0.5 }}
          >
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"></div>
            <div className="h-1 w-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"></div>
            <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full"></div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={prefersReducedMotion ? { hidden: {}, visible: {} } : containerVariants}
        >
          {FEATURES.map((feature, idx) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title}
                variants={prefersReducedMotion ? { hidden: {}, visible: {}, hover: {} } : featureCardVariants}
                whileHover="hover"
                className="group relative"
              >
                {/* Background glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 to-cyan-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>

                {/* Card */}
                <div className="relative h-full bg-white rounded-2xl p-8 border-2 border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col">
                  
                  {/* Top accent bar */}
                  <motion.div
                    className={`absolute top-0 left-0 h-1 bg-gradient-to-r ${feature.highlight} w-0 group-hover:w-full rounded-t-2xl`}
                    transition={{ duration: 0.5 }}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`w-16 h-16 rounded-full bg-gradient-to-br ${feature.highlight} flex items-center justify-center mb-6 shadow-lg relative`}
                    variants={prefersReducedMotion ? { hidden: {}, visible: {}, hover: {} } : iconVariants}
                    whileHover="hover"
                  >
                    <Icon className="w-8 h-8 text-white" />
                    
                    {/* Stat badge */}
                    <motion.div
                      className="absolute -top-3 -right-3 bg-white border-2 border-gray-100 rounded-full w-12 h-12 flex items-center justify-center shadow-lg font-bold text-xs"
                      variants={prefersReducedMotion ? { hidden: {}, visible: {} } : statBadgeVariants}
                    >
                      <span className={`bg-gradient-to-br ${feature.highlight} bg-clip-text text-transparent`}>
                        {feature.stat}
                      </span>
                    </motion.div>
                  </motion.div>

                  {/* Title */}
                  <motion.h3
                    className="text-xl font-bold text-gray-900 mb-3 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-cyan-600 transition-all duration-300"
                    animate={{ }}
                  >
                    {feature.title}
                  </motion.h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-6 group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </p>

                  {/* Bottom action */}
                  <motion.div
                    className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all duration-300"
                    whileHover={{ x: 4 }}
                  >
                    <span>Learn more</span>
                    <motion.div
                      animate={{ x: [0, 3, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <CheckCircle className="w-4 h-4" />
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA Section */}
        <motion.div
          className="relative mt-20 pt-16 border-t-2 border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              { number: '500+', label: 'Happy Customers', icon: '😊' },
              { number: '2,500+', label: 'Services Completed', icon: '✅' },
              { number: '99.8%', label: 'Satisfaction Rate', icon: '⭐' },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Bottom CTA Button */}
          <motion.div
            className="text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            viewport={{ once: true }}
          >
            <motion.button
              className="group inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:shadow-2xl transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Book your service now"
            >
              <span>Experience the Difference</span>
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                →
              </motion.div>
            </motion.button>
            <p className="text-gray-600 text-sm mt-4">Join thousands of satisfied customers</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}






