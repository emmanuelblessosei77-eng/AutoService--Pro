import { Star, ShoppingCart, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

import { parts } from '../../data/data';
import { useNavigate } from 'react-router-dom';

export function FeaturedShopItems() {
  // Get 3 top-rated parts
  const featuredParts = parts.slice(0, 3);
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 12 },
    },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-sm font-semibold mb-6"
          >
            🛒 SHOP
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Featured Auto Parts
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Premium quality parts and accessories for your vehicle maintenance
          </p>
        </motion.div>

        {/* Parts Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {featuredParts.map((part, idx) => (
            <motion.div
              key={part.id}
              variants={itemVariants}
              className="group relative"
            >
              {/* Hover Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-300 -z-10"></div>

              {/* Card */}
              <div className="relative bg-white rounded-2xl overflow-hidden border-2 border-gray-100 hover:border-emerald-300 transition-all duration-300 h-full shadow-lg hover:shadow-2xl flex flex-col">
                {/* Image Section */}
                <div className="relative h-64 overflow-hidden bg-gray-200">
                  <img
                    src={part.image}
                    alt={part.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Popular
                  </div>
                  {/* Discount Badge */}
                  {part.originalPrice && part.price < part.originalPrice && (
                    <div className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                      {Math.round(((part.originalPrice - part.price) / part.originalPrice) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col">
                  {/* Category */}
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-2">
                    {part.category}
                  </p>

                  {/* Title */}
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 leading-tight">
                    {part.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 flex-1">
                    {part.description}
                  </p>



                  {/* Price & Button */}
                  <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                        GH₵{part.price}
                      </div>
                      {part.originalPrice && (
                        <div className="text-sm text-gray-500 line-through">
                          GH₵{part.originalPrice}
                        </div>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.15, rotate: 12 }}
                      whileTap={{ scale: 0.85 }}
                      className="p-3 rounded-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all border border-blue-400/50"
                    >
                      <ShoppingCart className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA - View All */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-white border-2 border-emerald-600 text-emerald-600 font-bold rounded-xl hover:bg-emerald-50 transition-all shadow-lg"
            onClick={() => navigate('/parts')}
          >
            View All Parts & Accessories
          </motion.button>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-20 grid md:grid-cols-3 gap-8 text-center"
        >
          {[
            { icon: '✓', title: 'Genuine Parts', desc: 'OEM and certified aftermarket' },
            { icon: '🚚', title: 'Fast Shipping', desc: 'Next-day delivery available' },
            { icon: '💯', title: '100% Warranty', desc: 'Full satisfaction guarantee' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + idx * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl border border-blue-100"
            >
              <div className="text-3xl mb-3">{item.icon}</div>
              <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
