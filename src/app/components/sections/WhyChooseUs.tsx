import { CheckCircle2, Award, Clock, Wrench, Users, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

interface Feature {
  icon: typeof CheckCircle2;
  title: string;
  description: string;
}

export function WhyChooseUs() {
  const features: Feature[] = [
    {
      icon: Award,
      title: 'Licensed Technicians',
      description: 'ASE-certified professionals with 10+ years of experience',
    },
    {
      icon: Clock,
      title: 'Fast Turnaround',
      description: 'Same-day service available for most repairs',
    },
    {
      icon: Shield,
      title: 'Transparent Pricing',
      description: 'No hidden fees. Get quotes before service begins',
    },
    {
      icon: Users,
      title: '24/7 Customer Support',
      description: 'Available via phone, chat, or email anytime',
    },
    {
      icon: Wrench,
      title: 'Genuine Parts',
      description: 'OEM parts with full manufacturer warranty',
    },
    {
      icon: CheckCircle2,
      title: 'Satisfaction Guarantee',
      description: '100% money-back guarantee if not satisfied',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100, damping: 12 },
    },
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white via-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="grid md:grid-cols-2 gap-12 md:gap-16 items-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {/* Left: Text Content */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="inline-block px-4 py-2 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-semibold mb-6"
            >
              ✨ WHY CHOOSE US
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Industry-Leading Service Excellence
            </h2>

            <p className="text-lg text-gray-600 mb-6 leading-relaxed">
              With over 15 years in automotive care, we've built our reputation on reliability, quality, and customer satisfaction. Our team is dedicated to keeping your vehicle in peak condition.
            </p>

            <p className="text-gray-500 mb-8">
              When you choose AutoService Pro, you're choosing a partner committed to your vehicle's health and your peace of mind.
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { number: '5,000+', label: 'Happy Customers' },
                { number: '98%', label: 'Satisfaction Rate' },
                { number: '15+', label: 'Years Experience' },
              ].map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx, duration: 0.5 }}
                  viewport={{ once: true }}
                  className="p-4 rounded-xl bg-white border border-gray-200 text-center hover:border-blue-300 transition-colors"
                >
                  <div className="text-2xl md:text-3xl font-bold text-blue-600">{stat.number}</div>
                  <div className="text-xs md:text-sm text-gray-600 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-3xl blur-2xl opacity-40"></div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-white bg-white">
              <img
                src="https://images.unsplash.com/photo-1600857062241-98e5dba7214214?w=500&h=600&fit=crop"
                alt="Professional auto technician working on a vehicle"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/30 via-transparent to-transparent"></div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {features.map((feature, idx) => {
            const IconComponent = feature.icon;
            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="group relative"
              >
                {/* Hover background */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 to-emerald-400/20 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-300 -z-10"></div>

                <div className="relative h-full p-8 bg-white rounded-2xl border-2 border-gray-100 group-hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                  {/* Icon */}
                  <div className="mb-4 inline-block p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-all">
                    <IconComponent className="w-6 h-6 text-blue-600" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>

                  {/* Accent line */}
                  <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-emerald-500 w-0 group-hover:w-full transition-all duration-500 rounded-full"></div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
