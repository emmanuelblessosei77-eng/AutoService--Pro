import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Location',
      detail: '123 Auto Street, Tech City, TC 12345',
    },
    {
      icon: Phone,
      title: 'Phone',
      detail: '+1 (555) 123-4567',
    },
    {
      icon: Clock,
      title: 'Hours',
      detail: 'Mon-Fri: 8am-6pm, Sat: 9am-4pm',
    },
    {
      icon: Mail,
      title: 'Email',
      detail: 'support@autoservicepro.com',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <section className="py-24 bg-white border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
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
            📍 CONTACT US
          </motion.span>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          {/* Left: Contact Info + Map */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Info Cards */}
            <div className="grid gap-4">
              {contactInfo.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1, duration: 0.5 }}
                    viewport={{ once: true }}
                    className="flex items-start gap-4 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
                  >
                    <div className="p-3 bg-amber-50 rounded-lg flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                      <Icon className="w-6 h-6 text-amber-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wide">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 mt-1 text-sm">{item.detail}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Map Embed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-xl overflow-hidden shadow-lg h-64 md:h-full min-h-80 border border-gray-200"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.225343514137!2d-74.0060!3d40.7128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDQyJzQ2LjEiTiA3NMKwMDAnMjEuNiJX!5e0!3m2!1sen!2sus!4v1234567890"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </motion.div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 md:p-10 text-white shadow-2xl"
          >
            <h3 className="text-2xl md:text-3xl font-bold mb-2">Send Us a Message</h3>
            <p className="text-gray-400 mb-8">We'll get back to you within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:bg-gray-700 transition-all"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Email <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:bg-gray-700 transition-all"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Message <span className="text-red-400">*</span></label>
                <textarea
                  placeholder="Tell us how we can help…"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:bg-gray-700 transition-all resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={submitted}
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-green-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-6"
              >
                {submitted ? '✓ Message Sent!' : 'Send Message'}
                {!submitted && <ArrowRight className="w-4 h-4" />}
              </motion.button>
            </form>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-700">
              <div>
                <p className="text-2xl font-bold text-amber-400">24h</p>
                <p className="text-sm text-gray-400">Response Time</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-400">7/7</p>
                <p className="text-sm text-gray-400">Days Available</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
