import { motion } from 'framer-motion';
import { MapPin, Phone, Clock, Mail, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export function ContactPage() {
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
      detail: 'Mon-Fri: 8am-6pm, Sat: 9am-4pm, Sun: Closed',
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
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <section className="pt-4 sm:pt-8">
        <div className="relative overflow-hidden w-full h-[520px] sm:h-[650px] flex items-center justify-center">
          <img
            src={require('../../images/aboutus1.jpg')}
            alt="Contact Us Hero"
            className="absolute inset-0 w-full h-full object-cover object-center z-0"
            style={{ objectFit: 'cover' }}
          />
          <div className="relative z-20 text-center w-full flex flex-col items-center justify-center h-full">
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="inline-block px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold mb-4"
            >
              📍 CONTACT US
            </motion.span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              Get In Touch With Us
            </h1>
            <p className="text-xl text-white max-w-3xl mx-auto drop-shadow">
              Have questions about our services? Need to schedule an appointment? We're here to help.<br />
              Reach out anytime and our team will respond within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-stretch">
            {/* Left: Contact Info + Map */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Info Cards */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Contact Information</h2>
                <div className="grid gap-4">
                  {contactInfo.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.1, duration: 0.5 }}
                        className="flex items-start gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all group"
                      >
                        <div className="p-4 bg-amber-50 rounded-lg flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                          <Icon className="w-7 h-7 text-amber-700" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-base uppercase tracking-wide mb-1">
                            {item.title}
                          </h3>
                          <p className="text-gray-600 text-sm">{item.detail}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Map Embed */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="rounded-xl overflow-hidden shadow-lg h-96 border border-gray-200"
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
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-10 text-white shadow-2xl"
            >
              <h2 className="text-3xl font-bold mb-2">Send us a Message</h2>
              <p className="text-gray-400 mb-10">We're typically available and will respond within a few hours during business hours.</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Full Name</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="text"
                    placeholder="Full Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:bg-gray-700 transition-all text-base"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Email Address</label>
                  <motion.input
                    whileFocus={{ scale: 1.02 }}
                    type="email"
                    placeholder="Email Address"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:bg-gray-700 transition-all text-base"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Subject</label>
                  <motion.select
                    whileFocus={{ scale: 1.02 }}
                    required
                    defaultValue=""
                    className="w-full px-5 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white focus:outline-none focus:border-amber-500 focus:bg-gray-700 transition-all text-base"
                  >
                    <option value="" disabled>Select a subject...</option>
                    <option value="booking">Service Booking</option>
                    <option value="inquiry">General Inquiry</option>
                    <option value="support">Technical Support</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </motion.select>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-300">Message</label>
                  <motion.textarea
                    whileFocus={{ scale: 1.02 }}
                    placeholder="Tell us about your service needs or questions..."
                    rows={6}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-5 py-3 rounded-lg bg-gray-700/50 border border-gray-600 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:bg-gray-700 transition-all resize-none text-base"
                  ></motion.textarea>
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={submitted}
                  className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:bg-green-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 mt-8 text-base"
                >
                  {submitted ? (
                    <>
                      <span>✓ Message Sent Successfully!</span>
                    </>
                  ) : (
                    <>
                      Send Message
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-8 mt-10 pt-10 border-t border-gray-700">
                <div>
                  <p className="text-3xl font-bold text-amber-400">24h</p>
                  <p className="text-sm text-gray-400 mt-2">Response Time</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-amber-400">7/7</p>
                  <p className="text-sm text-gray-400 mt-2">Days Available</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-24 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Answers to common questions about our services</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { q: 'How long does a typical service take?', a: 'Most services take 2-4 hours. Complex repairs may take longer. We\'ll provide a time estimate when you book.' },
              { q: 'Do you offer emergency services?', a: 'Yes! We offer same-day emergency repairs. Call us immediately for urgent issues.' },
              { q: 'What warranty do you provide?', a: 'All work is backed by a 12-month warranty. If any issues arise, we\'ll fix it for free.' },
              { q: 'Can I book online?', a: 'Yes! You can book appointments 24/7 through our website. We\'ll confirm your booking within 2 hours.' },
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all"
              >
                <h3 className="font-bold text-lg text-gray-900 mb-3">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
