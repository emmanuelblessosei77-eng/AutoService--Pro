import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface TimelineItem {
  icon: ReactNode;
  year?: string;
  title: string;
  description: string;
  accent?: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

export function VerticalTimeline({ items }: TimelineProps) {
  return (
    <div className="w-full py-12">
      {/* Timeline container */}
      <div className="relative">
        {/* Center line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-blue-500 via-cyan-400 to-transparent opacity-30"></div>

        {/* Items */}
        <div className="space-y-12 md:space-y-16">
          {items.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: '-100px' }}
              className={`flex gap-8 md:gap-12 items-start ${
                index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Left content or spacer */}
              <div
                className={`flex-1 ${
                  index % 2 === 0 ? 'text-right pr-0 md:pr-12' : 'text-left pl-0 md:pl-12'
                }`}
              >
                {index % 2 === 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
                    viewport={{ once: true }}
                  >
                    {item.year && (
                      <span className="inline-block text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                        {item.year}
                      </span>
                    )}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Center dot with animation */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1 + 0.2,
                  type: 'spring',
                }}
                viewport={{ once: true }}
                className="relative flex-shrink-0"
              >
                {/* Outer glow */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-lg w-20 h-20 transform -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>

                {/* Icon circle */}
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-white/30 flex items-center justify-center backdrop-blur-sm hover:border-white/50 hover:bg-gradient-to-br hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300">
                  <span className="text-xl">{item.icon}</span>
                </div>

                {/* Pulse animation */}
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.1 }}
                  className="absolute inset-0 rounded-full border-2 border-blue-400/30 w-20 h-20 transform -translate-x-2 -translate-y-2"
                ></motion.div>
              </motion.div>

              {/* Right content or spacer */}
              <div
                className={`flex-1 ${
                  index % 2 === 1 ? 'text-left pl-0 md:pl-12' : 'text-right pr-0 md:pr-12'
                }`}
              >
                {index % 2 === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 + 0.1 }}
                    viewport={{ once: true }}
                  >
                    {item.year && (
                      <span className="inline-block text-sm font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                        {item.year}
                      </span>
                    )}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-white/60 text-sm md:text-base leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
