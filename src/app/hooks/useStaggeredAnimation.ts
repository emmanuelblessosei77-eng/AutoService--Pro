import { useEffect, useRef, useState } from 'react';

export interface StaggerConfig {
  staggerChildren?: number;
  delayChildren?: number;
  direction?: 'forwards' | 'backwards';
}

export const useStaggeredAnimation = (config: StaggerConfig = {}) => {
  const { staggerChildren = 0.1, delayChildren = 0, direction = 'forwards' } = config;
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren,
        delayChildren,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: direction === 'forwards' ? 20 : -20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return {
    ref,
    isVisible,
    containerVariants,
    itemVariants,
  };
};
