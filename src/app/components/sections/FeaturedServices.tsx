import { Link } from 'react-router-dom';
import { ArrowRight, Wrench, Droplet, Zap, Gauge, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { services } from '../../data/data';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    rotateX: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -8,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10,
    },
  },
};

export function FeaturedServices() {
  const featuredServices = services.slice(0, 3);

  const serviceIcons = {
    'oilchange': Droplet,
    'diagnostics': Zap,
    'engineservicing': Wrench,
    'generalrepair': Gauge,
    'tirereplacement': Wrench,
  };

  const colors = [
    { 
      bg: 'bg-gradient-to-br from-blue-500 to-blue-600', 
      border: 'border-blue-300', 
      text: 'text-blue-600',
      light: 'bg-blue-50',
      badge: 'bg-blue-100 text-blue-600',
    },
    { 
      bg: 'bg-gradient-to-br from-amber-500 to-amber-600', 
      border: 'border-amber-300', 
      text: 'text-amber-600',
      light: 'bg-amber-50',
      badge: 'bg-amber-100 text-amber-600',
    },
    { 
      bg: 'bg-gradient-to-br from-emerald-500 to-emerald-600', 
      border: 'border-emerald-300', 
      text: 'text-emerald-600',
      light: 'bg-emerald-50',
      badge: 'bg-emerald-100 text-emerald-600',
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with advanced typography */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <motion.span
            className="inline-block px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold mb-4"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            ⚡ TOP SERVICES
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Featured Services</h2>
          <p className="text-lg text-gray-600">Quick access to our most popular and trusted services</p>
          
          <motion.div
            className="flex justify-center mt-6"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            style={{ originX: 0.5 }}
          >
            <div className="h-1 w-20 bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 rounded-full shadow-lg"></div>
          </motion.div>
        </motion.div>

        {/* Cards Grid with enhanced composition */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          variants={containerVariants}
        >
          {featuredServices.map((service, idx) => {
            const color = colors[idx];

            return (
              <motion.div
                key={service.id}
                variants={cardVariants}
                whileHover="hover"
                className="group relative backdrop-blur-sm"
              >
                {/* Layered Shadow Effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400 to-emerald-400 rounded-2xl opacity-0 group-hover:opacity-20 blur transition duration-500 -z-10"></div>

                <div className="relative bg-white rounded-2xl overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all duration-300 flex flex-col h-full shadow-lg hover:shadow-2xl">
                  
                  {/* Image/Link Area with overlay */}
                  <Link
                    to="/services"
                    className="relative h-56 overflow-hidden flex items-center justify-center group-hover:opacity-90 transition-opacity duration-300 flex-shrink-0"
                    aria-label={`View details for ${service.title}`}
                  >
                    {service.image ? (
                      <>
                        <img
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.style.background = color.bg;
                          }}
                        />
                        {/* Gradient overlay on hover */}
                        <motion.div
                          className={`absolute inset-0 ${color.bg} mix-blend-multiply opacity-0 group-hover:opacity-20`}
                          initial={{ opacity: 0 }}
                          whileHover={{ opacity: 0.2 }}
                          transition={{ duration: 0.3 }}
                        />
                      </>
                    ) : (
                      <div className={`${color.bg} w-full h-full flex items-center justify-center`}>
                        <motion.div
                          className="text-center"
                          initial={{ scale: 0.8 }}
                          whileHover={{ scale: 1.1 }}
                        >
                          <div className="text-white/90 text-sm font-medium mb-2">Explore</div>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                          >
                            <ArrowRight className="w-8 h-8 text-white mx-auto" />
                          </motion.div>
                        </motion.div>
                      </div>
                    )}
                  </Link>

                  {/* Content Section */}
                  <div className="flex-1 p-6 flex flex-col">
                    {/* Service Badge */}
                    <motion.div
                      className={`inline-block w-fit px-4 py-1.5 rounded-full text-xs font-bold mb-4 ${color.badge} border ${color.border} shadow-md`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 + 0.2 }}
                      viewport={{ once: true }}
                      whileHover={{ scale: 1.1 }}
                    >
                      ⭐ Popular Service
                    </motion.div>

                    {/* Title with underline animation */}
                    <div className="relative inline-block mb-3 self-start">
                      <h3 className={`text-xl font-bold text-gray-900 group-hover:${color.text} transition-colors duration-300`}>
                        {service.title}
                      </h3>
                      <motion.div
                        className={`absolute bottom-0 left-0 h-0.5 ${color.bg} w-0 group-hover:w-full transition-all duration-500`}
                      />
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                      {service.description}
                    </p>



                    {/* Learn More Link */}
                    <Link
                      to="/services"
                      className={`flex items-center gap-2 ${color.text} font-semibold text-sm group-hover:translate-x-1 transition-all duration-300`}
                    >
                      Learn More
                      <motion.div
                        animate={{ x: [0, 3, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="w-4 h-4" />
                      </motion.div>
                    </Link>
                  </div>

                  {/* Bottom border accent with animation */}
                  <motion.div
                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${color.bg} w-0 group-hover:w-full transition-all duration-700`}
                  />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* View All button - Enhanced */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link
              to="/services"
              className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-10 rounded-lg transition-all duration-300 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View All Services
              <motion.div
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            </Link>
          </motion.div>
          <p className="text-sm text-gray-600 mt-4">Explore our complete service catalog</p>
        </motion.div>
      </div>
    </section>
  );
}
