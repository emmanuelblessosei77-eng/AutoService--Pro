import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export interface BentoBoxProps {
  icon?: ReactNode;
  title: string;
  description: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
  onClick?: () => void;
  gradient?: string;
}

export function BentoBox({
  icon,
  title,
  description,
  size = 'small',
  className = '',
  onClick,
  gradient = 'from-blue-500/20 to-cyan-500/20',
}: BentoBoxProps) {
  const sizeClasses = {
    small: 'col-span-1 row-span-1',
    medium: 'col-span-2 row-span-1',
    large: 'col-span-2 row-span-2',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`
        ${sizeClasses[size]} 
        ${className}
        group relative overflow-hidden rounded-[2.5rem] 
        bg-gradient-to-br ${gradient}
        border border-white/10 hover:border-white/30
        p-6 md:p-8
        cursor-pointer
        transition-all duration-300
        backdrop-blur-sm
      `}
      onClick={onClick}
    >
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {icon && (
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-4 group-hover:bg-white/20 transition-all duration-300">
            <span className="text-2xl md:text-3xl">{icon}</span>
          </div>
        )}

        <h3 className="text-lg md:text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-400 group-hover:to-cyan-400 transition-all duration-300">
          {title}
        </h3>

        <p className="text-white/60 text-sm md:text-base leading-relaxed group-hover:text-white/80 transition-colors duration-300 flex-grow">
          {description}
        </p>
      </div>

      {/* Hover shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/10 to-transparent transform group-hover:translate-x-full transition-transform duration-700"></div>
      </div>
    </motion.div>
  );
}

interface BentoGridProps {
  items: BentoBoxProps[];
  columns?: number;
}

export function BentoGrid({ items, columns = 4 }: BentoGridProps) {
  return (
    <div
      className={`grid gap-6 md:gap-8 w-full`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(250px, 1fr))`,
        gridAutoRows: `250px`,
      }}
    >
      {items.map((item, index) => (
        <BentoBox key={index} {...item} />
      ))}
    </div>
  );
}
