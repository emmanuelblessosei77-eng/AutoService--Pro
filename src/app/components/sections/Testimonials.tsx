import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

export function Testimonials() {
  const testimonials = [
    {
      name: 'Michael Johnson',
      role: 'BMW Owner',
      text: 'Excellent service! The technicians were professional and knowledgeable. My car was ready in 2 hours and runs perfectly.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      name: 'Sarah Martinez',
      role: 'Honda Civic Owner',
      text: 'The transparency in pricing was refreshing. No hidden costs, just honest work and great communication throughout.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      name: 'David Chen',
      role: 'Toyota Camry Owner',
      text: 'Best auto service in town! I trust them with all my maintenance needs. Highly recommended to anyone.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 15 },
    },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
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
            className="inline-block px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold mb-4"
          >
            ⭐ TRUSTED BY CUSTOMERS
          </motion.span>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust us with their vehicle maintenance.
          </p>
        </motion.div>

        {/* Testimonials Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {testimonials.map((testimonial, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="group relative"
            >
              {/* Hover Glow */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-amber-100 to-amber-50 rounded-2xl opacity-0 group-hover:opacity-100 blur transition duration-300 -z-10"></div>

              {/* Card */}
              <div className="relative bg-white rounded-2xl p-8 border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all h-full flex flex-col shadow-lg">
                {/* Stars */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 + i * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                    </motion.div>
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-gray-700 text-base leading-relaxed mb-6 flex-1 italic">
                  "{testimonial.text}"
                </p>

                {/* Customer Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <motion.img
                    whileHover={{ scale: 1.1 }}
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-amber-200"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-gray-200"
        >
          {[
            { stat: '5,000+', label: 'Happy Customers' },
            { stat: '98%', label: 'Satisfaction Rate' },
            { stat: '2,500+', label: 'Services Completed' },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + idx * 0.1 }}
              viewport={{ once: true }}
              className="text-center p-6 bg-gradient-to-br from-amber-50 to-amber-100/50 rounded-xl border border-amber-200"
            >
              <p className="text-4xl font-bold text-amber-700 mb-2">{item.stat}</p>
              <p className="text-gray-700 font-medium">{item.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}




