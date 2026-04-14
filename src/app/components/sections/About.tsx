

import aboutUsImg from '../../images/aboutus.jpg';
import { motion } from 'framer-motion';
import { CheckCircle, Users, Award, Wrench } from 'lucide-react';

export function About() {
  const highlights = [
    { icon: Wrench, text: 'Expert technicians' },
    { icon: Users, text: 'Trusted by thousands' },
    { icon: Award, text: 'Quality assured' },
    { icon: CheckCircle, text: 'Fully certified' },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-slate-50 to-blue-50 border-t border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section removed as requested */}
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left: About Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                About AutoService Pro
              </h2>
              <p className="text-gray-600 text-lg leading-relaxed">
                We're dedicated to providing premium automotive services with transparency and excellence. With certified technicians and state-of-the-art equipment, we ensure your vehicle receives the best care possible.
              </p>
            </div>

            <p className="text-gray-600 text-lg leading-relaxed">
              Every service is backed by our quality guarantee and handled with professional attention to detail. From routine maintenance to complex repairs, we're committed to building lasting relationships with our customers.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              {highlights.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl border border-blue-100 shadow hover:shadow-lg transition-all group"
                  >
                    <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 group-hover:bg-blue-500/80 transition-colors shadow-md">
                      <Icon className="w-7 h-7 text-blue-600 group-hover:text-white transition-colors" />
                    </span>
                    <span className="text-base font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{item.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative flex justify-center items-center"
          >
            <div className="absolute -inset-2 bg-gradient-to-br from-blue-200 to-emerald-200 rounded-3xl blur-xl opacity-30"></div>
            <div className="relative w-full max-w-md aspect-[4/5] md:aspect-[5/6] lg:aspect-[4/5] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow border border-blue-100">
              <img
                src={aboutUsImg}
                className="w-full h-full object-cover object-center scale-105 group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-3xl pointer-events-none"></div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
