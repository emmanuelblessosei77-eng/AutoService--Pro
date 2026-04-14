import { motion } from 'framer-motion';
import { Wrench, Zap, Shield, Droplet, Gauge, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { services } from '../../data/data';

export function ServiceFinder() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'blue' },
    { id: 'diagnostics', label: 'Diagnostics', icon: Zap, color: 'amber' },
    { id: 'safety', label: 'Safety', icon: Shield, color: 'emerald' },
    { id: 'fluids', label: 'Fluids', icon: Droplet, color: 'cyan' },
    { id: 'performance', label: 'Performance', icon: Gauge, color: 'orange' },
  ];

  const categoryServices = {
    maintenance: services.slice(0, 2),
    diagnostics: [services[1]],
    safety: [services[4]],
    fluids: [services[0]],
    performance: [services[2]],
  };

  return (
    <section className="py-24 bg-gradient-to-br from-white via-blue-50 to-blue-100 border-t border-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-3xl shadow-2xl p-8 md:p-12 border border-blue-100">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-semibold mb-4"
          >
            🔍 FIND YOUR SERVICE
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What service do you need?
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Click on a category to explore our services and find exactly what your vehicle needs.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex justify-center flex-wrap gap-4 mb-10">
          {categories.map((category, idx) => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.id;
            const colorMap = {
              blue: 'from-blue-500 to-blue-600',
              amber: 'from-amber-500 to-amber-600',
              emerald: 'from-emerald-500 to-emerald-600',
              cyan: 'from-cyan-500 to-cyan-600',
              orange: 'from-orange-500 to-orange-600',
            };

            return (
              <motion.button
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 border-2 ${
                  isSelected
                    ? `bg-gradient-to-r ${colorMap[category.color as keyof typeof colorMap]} text-white border-transparent shadow-lg`
                    : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                <Icon className="w-5 h-5" />
                {category.label}
              </motion.button>
            );
          })}
        </div>

        {/* Services Display */}
        <motion.div
          layout
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {selectedCategory && categoryServices[selectedCategory as keyof typeof categoryServices]?.map((service, idx) => (
            <motion.div
              key={service.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15 }}
              className="group relative"
            >
              {/* Hover Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-30 blur transition duration-300 -z-10" />
              
              <div className="relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-blue-400 hover:shadow-xl transition-all h-full flex flex-col">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{service.title}</h3>
                <p className="text-gray-600 text-sm mb-4 flex-1">{service.description}</p>
                
                {/* Rating and Price */}
                <div className="flex items-center justify-between mb-4 pb-4 border-t border-gray-200 pt-4">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={i < 4 ? 'text-yellow-400' : 'text-gray-300'}>★</div>
                    ))}
                    <span className="text-xs text-gray-600 ml-1">4.0</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">${service.price}</span>
                </div>
                
                <motion.button
                  whileHover={{ x: 4, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 text-slate-950 font-semibold text-sm bg-cyan-500 hover:bg-cyan-400 px-4 py-2 rounded-lg transition-all shadow-md"
                >
                  Book Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State */}
        {!selectedCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <p className="text-gray-600 text-lg">Select a category to view services</p>
          </motion.div>
        )}
        </div>
      </div>
    </section>
  );
}
