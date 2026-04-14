import { Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface PricingFeature {
  name: string;
  included: boolean;
}

interface PricingTier {
  name: string;
  description: string;
  price: number;
  period: string;
  cta: string;
  features: PricingFeature[];
  popular?: boolean;
  highlight?: string;
}

export function PricingTiers() {
  const navigate = useNavigate();

  const tiers: PricingTier[] = [
    {
      name: 'Basic',
      description: 'Perfect for routine maintenance',
      price: 49,
      period: 'per service',
      cta: 'Get Started',
      features: [
        { name: 'Oil & Filter Change', included: true },
        { name: 'Tire Rotation', included: true },
        { name: 'Basic Inspection', included: true },
        { name: 'Roadside Assistance', included: false },
        { name: 'Priority Scheduling', included: false },
        { name: 'Free Diagnostics', included: false },
      ],
    },
    {
      name: 'Professional',
      description: 'Most popular choice for comprehensive care',
      price: 149,
      period: 'per service',
      cta: 'Choose Plan',
      popular: true,
      highlight: 'Most Popular',
      features: [
        { name: 'Everything in Basic', included: true },
        { name: 'Advanced Diagnostics', included: true },
        { name: 'Brake Inspection', included: true },
        { name: '24/7 Roadside Assistance', included: true },
        { name: 'Priority Scheduling', included: true },
        { name: 'Free Fluid Top-ups', included: true },
      ],
    },
    {
      name: 'Premium',
      description: 'Complete vehicle protection',
      price: 299,
      period: 'per service',
      cta: 'Unlock Premium',
      features: [
        { name: 'Everything in Professional', included: true },
        { name: 'Full Engine Inspection', included: true },
        { name: 'Transmission Service', included: true },
        { name: '24/7 Roadside Assistance', included: true },
        { name: 'Urgent Same-Day Service', included: true },
        { name: 'Free Warranty Extension', included: true },
      ],
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring' as const, stiffness: 100, damping: 15 },
    },
  };

  const handleSelectPlan = () => {
    navigate('/register');
  };

  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
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
            💰 PRICING PLANS
          </motion.div>

          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Flexible Plans for Every Need
          </h2>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose the perfect service plan for your vehicle. All plans include our satisfaction guarantee.
          </p>
        </motion.div>

        {/* Pricing Cards Grid */}
        <motion.div
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
        >
          {tiers.map((tier, idx) => (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="group relative"
            >
              {/* Highlight Badge for Popular */}
              {tier.popular && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  viewport={{ once: true }}
                  className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-blue-500 text-white text-sm font-bold rounded-full flex items-center gap-2 shadow-lg">
                    <Zap className="w-4 h-4" />
                    {tier.highlight}
                  </div>
                </motion.div>
              )}

              {/* Gradient Glow for Popular */}
              {tier.popular && (
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-3xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-300"></div>
              )}

              {/* Card */}
              <div
                className={`relative h-full p-8 rounded-3xl border-2 transition-all duration-300 flex flex-col backdrop-blur ${
                  tier.popular
                    ? 'bg-gradient-to-b from-white via-blue-50 to-emerald-50 border-emerald-400 shadow-2xl scale-105 md:scale-100 md:relative hover:shadow-emerald-500/30'
                    : 'bg-white border-gray-200 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10'
                }`}
              >
                {/* Title Section */}
                <div className="mb-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    {tier.name}
                  </h3>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </div>

                {/* Price Display */}
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
                      ${tier.price}
                    </span>
                    <span className="text-gray-600 ml-2 text-sm">{tier.period}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-4 mb-8 flex-1">
                  {tier.features.map((feature, featureIdx) => (
                    <div
                      key={featureIdx}
                      className={`flex items-start gap-3 ${
                        feature.included ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      <div
                        className={`p-1 rounded-md flex-shrink-0 mt-0.5 ${
                          feature.included
                            ? 'bg-emerald-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <Check
                          className={`w-4 h-4 ${
                            feature.included
                              ? 'text-emerald-600'
                              : 'text-gray-300'
                          }`}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        feature.included ? 'text-gray-700' : 'text-gray-400'
                      }`}>
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSelectPlan}
                  className={`w-full px-6 py-4 rounded-xl font-bold text-base transition-all duration-300 relative group overflow-hidden ${
                    tier.popular
                      ? 'bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-white shadow-2xl hover:shadow-2xl border-2 border-emerald-400/50'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg border-2 border-blue-400/30'
                  }`}
                >
                  <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                  {tier.cta}
                </motion.button>

                {/* Footer Text */}
                {tier.popular && (
                  <p className="text-center text-xs text-gray-500 mt-4">
                    Recommended by 82% of our customers
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          viewport={{ once: true }}
        >
          <p className="text-gray-600 mb-4">
            All plans include our 100% satisfaction guarantee and 24/7 customer support.
          </p>
          <p className="text-sm text-gray-500">
            Need a custom plan? <span className="text-blue-600 font-semibold cursor-pointer hover:underline">Contact our sales team</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
