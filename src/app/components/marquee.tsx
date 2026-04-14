import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface MarqueeItem {
  icon: React.ReactNode;
  label: string;
}

interface MarqueeProps {
  items: MarqueeItem[];
  speed?: number;
}

export function Marquee({ items, speed = 20 }: MarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);

  return (
    <div className="w-full overflow-hidden bg-gradient-to-r from-transparent via-white/5 to-transparent backdrop-blur-sm py-12">
      <div className="relative">
        {/* Fade overlays */}
        <div className="absolute left-0 top-0 w-32 h-full bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
        <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

        <motion.div
          ref={marqueeRef}
          className="flex gap-12 whitespace-nowrap"
          animate={{ x: [0, -1500] }}
          transition={{
            duration: speed,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {/* First set */}
          {items.map((item, i) => (
            <div
              key={`marquee-1-${i}`}
              className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer flex-shrink-0"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium text-white/80">{item.label}</span>
            </div>
          ))}

          {/* Duplicate set for seamless loop */}
          {items.map((item, i) => (
            <div
              key={`marquee-2-${i}`}
              className="flex items-center gap-3 px-8 py-4 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer flex-shrink-0"
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium text-white/80">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
