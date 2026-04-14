import { motion } from 'framer-motion';
import { Zap, Cpu, Gauge, Shield, Smartphone, BarChart3 } from 'lucide-react';

export function TechShowcase() {
  const technologies = [
    {
      icon: Cpu,
      title: 'Advanced Diagnostics',
      description: 'AI-powered diagnostic systems that pinpoint issues with 99.9% accuracy in minutes.',
      gradient: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Zap,
      title: 'Fast Service',
      description: 'Optimized workflows and modern equipment ensure most services are completed in 2-4 hours.',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: Shield,
      title: 'Safety First',
      description: 'Real-time safety monitoring and quality checks at every stage of service.',
      gradient: 'from-emerald-500 to-green-600',
    },
    {
      icon: Smartphone,
      title: 'Live Tracking',
      description: 'Real-time updates via SMS and app. Know exactly where your service stands.',
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      icon: Gauge,
      title: 'Performance Testing',
      description: 'Comprehensive performance benchmarks before and after every major service.',
      gradient: 'from-red-500 to-rose-600',
    },
    {
      icon: BarChart3,
      title: 'Data Analytics',
      description: 'Predictive maintenance recommendations based on your vehicle\'s history and patterns.',
      gradient: 'from-indigo-500 to-blue-600',
    },
  ];

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

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-sm font-semibold mb-4"
          >
            ⚙️ MODERN TECHNOLOGY
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Powered by Technology
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We leverage cutting-edge technology to deliver faster, more accurate, and more transparent automotive services.
          </p>
        </motion.div>

        {/* Tech Grid */}
        <motion.div
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {technologies.map((tech, idx) => {
            const Icon = tech.icon;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="group relative"
              >
                {/* Hover Glow */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r ${tech.gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur transition duration-300 -z-10`}></div>

                {/* Card */}
                <div className="relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all h-full flex flex-col">
                  {/* Icon Container */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    className={`w-16 h-16 rounded-xl bg-gradient-to-br ${tech.gradient} flex items-center justify-center mb-6 shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{tech.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed flex-1">{tech.description}</p>

                  {/* Bottom accent */}
                  <div className={`h-1 bg-gradient-to-r ${tech.gradient} rounded-full w-0 group-hover:w-full transition-all duration-500 mt-6`}></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mt-16 pt-8 border-t border-gray-200"
        >
          <p className="text-gray-600 text-lg">
            Experience the AutoService Pro difference with our technology-driven approach to vehicle maintenance.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
