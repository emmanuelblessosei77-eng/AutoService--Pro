import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CarouselSlide {
  image: string;
  title: string;
  subtitle?: string;
}

interface HeroCarouselProps {
  slides: CarouselSlide[];
  onBookClick?: () => void;
}


export function HeroCarousel({ slides, onBookClick }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [autoPlay, setAutoPlay] = useState(true);
  const [hoveredDot, setHoveredDot] = useState<number | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const SLIDE_DURATION = 6000;
  const TRANSITION_TIME = 600;

  // Auto-advance
  useEffect(() => {
    if (!autoPlay) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [autoPlay, slides.length]);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev + 1) % slides.length);
    setAutoPlay(false);
    setTimeout(() => setIsTransitioning(false), TRANSITION_TIME);
    setTimeout(() => setAutoPlay(true), 4000);
  }, [isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
    setTimeout(() => setIsTransitioning(false), TRANSITION_TIME);
    setTimeout(() => setAutoPlay(true), 4000);
  }, [isTransitioning]);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setAutoPlay(false);
    setTimeout(() => setIsTransitioning(false), TRANSITION_TIME);
    setTimeout(() => setAutoPlay(true), 5000);
  }, [isTransitioning, currentSlide]);

  if (slides.length === 0) return null;

  const slide = slides[currentSlide];
  const nextSlideIdx = (currentSlide + 1) % slides.length;
  const prevSlideIdx = (currentSlide - 1 + slides.length) % slides.length;

  return (
    <div className="relative w-full h-96 md:h-screen overflow-hidden bg-black pt-16 md:pt-20">
      {/* Main Carousel Container */}
      <div className="relative w-full h-full">
        <AnimatePresence mode="wait">
          {/* Main Image with Zoom Effect */}
          <motion.div
            key={`main-${currentSlide}`}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="absolute inset-0"
            style={{
              backgroundImage: `url("${slide.image}")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            {/* Subtle overlay for button visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
            {/* Text Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 md:px-0 z-10">
              <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-4 bg-black/30 rounded-lg px-4 py-2 inline-block">
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-lg md:text-2xl text-white/90 drop-shadow-md bg-black/20 rounded px-3 py-1 inline-block">
                  {slide.subtitle}
                </p>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows - Side Position */}
        <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between z-30 px-4 md:px-8 pointer-events-none">
          {/* Previous Button */}
          <motion.button
            onClick={prevSlide}
            disabled={isTransitioning}
            whileHover={{ scale: 1.2, x: -4 }}
            whileTap={{ scale: 0.9 }}
            className="pointer-events-auto p-2 md:p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur border border-white/20 hover:border-white/50 transition-all disabled:opacity-50 group"
          >
            <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-125 transition-transform" />
          </motion.button>

          {/* Next Button */}
          <motion.button
            onClick={nextSlide}
            disabled={isTransitioning}
            whileHover={{ scale: 1.2, x: 4 }}
            whileTap={{ scale: 0.9 }}
            className="pointer-events-auto p-2 md:p-3 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur border border-white/20 hover:border-white/50 transition-all disabled:opacity-50 group"
          >
            <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:scale-125 transition-transform" />
          </motion.button>
        </div>

        {/* Bottom Progressive Dots - Enhanced UX */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex gap-2"
        >
          {slides.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => goToSlide(idx)}
              onMouseEnter={() => setHoveredDot(idx)}
              onMouseLeave={() => setHoveredDot(null)}
              whileHover={{ scale: 1.3 }}
              whileTap={{ scale: 0.85 }}
              className="relative group cursor-pointer"
            >
              {/* Background circle */}
              <div
                className={`rounded-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'w-10 h-2 bg-gradient-to-r from-blue-400 to-cyan-400 shadow-lg shadow-blue-500/50'
                    : hoveredDot === idx
                    ? 'w-8 h-2 bg-white/60'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
              />
              {/* Label on hover */}
              {hoveredDot === idx && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur px-2 py-1 rounded text-xs text-white font-medium whitespace-nowrap"
                >
                  Slide {idx + 1}
                </motion.div>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Side Preview Cards (Desktop Only) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="hidden lg:flex absolute bottom-12 md:bottom-16 left-8 gap-4 z-20"
        >
          {/* Previous Slide Preview */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={prevSlide}
            className="cursor-pointer w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 border-white/30 hover:border-white/60 transition-all opacity-60 hover:opacity-100"
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url("${slides[prevSlideIdx].image}")` }}
            />
          </motion.div>

          {/* Next Slide Preview */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={nextSlide}
            className="cursor-pointer w-20 h-20 md:w-24 md:h-24 rounded-lg overflow-hidden border-2 border-white/30 hover:border-white/60 transition-all opacity-60 hover:opacity-100"
          >
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url("${slides[nextSlideIdx].image}")` }}
            />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
