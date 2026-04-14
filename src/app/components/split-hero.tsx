import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { Button } from './ui/button';

interface SplitHeroProps {
  title: ReactNode;
  subtitle?: string;
  description?: string;
  cta?: {
    text: string;
    onClick: () => void;
  };
  mockupContent?: ReactNode;
  backgroundImage?: string;
}

export function SplitHero({
  title,
  subtitle,
  description,
  cta,
  mockupContent,
  backgroundImage,
}: SplitHeroProps) {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-20">
      {/* Background gradient effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full rounded-full bg-gradient-to-bl from-blue-500/20 to-transparent blur-3xl"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full rounded-full bg-gradient-to-tr from-cyan-500/20 to-transparent blur-3xl"></div>
      </div>

      {/* Grid pattern background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-40"></div>

      <div className="relative z-10 container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-80px)]">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            {/* Headline */}
            <div className="space-y-4">
              {typeof title === 'string' ? (
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="text-white">
                    {title.split('\n')[0]}
                  </span>
                  {title.split('\n')[1] && (
                    <>
                      <br />
                      <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                        {title.split('\n')[1]}
                      </span>
                    </>
                  )}
                </h1>
              ) : (
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  {title}
                </div>
              )}

              {subtitle && (
                <p className="text-xl md:text-2xl text-white/80 font-light">
                  {subtitle}
                </p>
              )}
            </div>

            {/* Description */}
            {description && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-base md:text-lg text-white/60 leading-relaxed max-w-xl"
              >
                {description}
              </motion.p>
            )}

            {/* CTA Button */}
            {cta && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Button
                  onClick={cta.onClick}
                  className="px-8 py-3 md:py-4 text-base md:text-lg font-semibold rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:scale-105"
                >
                  {cta.text}
                </Button>
              </motion.div>
            )}

            {/* Stats or metrics */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex gap-8 pt-4"
            >
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">1000+</p>
                <p className="text-white/60 text-sm">Happy Customers</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-bold text-white">500+</p>
                <p className="text-white/60 text-sm">Services Completed</p>
              </div>
            </motion.div>
          </motion.div>

          {/* Right side - Mockup with glassmorphism */}
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:flex items-center justify-center"
          >
            {/* Glassmorphism card */}
            <div className="relative w-full max-w-md">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 to-cyan-500/30 rounded-3xl blur-2xl"></div>

              {/* Card container */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 hover:border-white/40 transition-all duration-500 overflow-hidden shadow-2xl">
                {/* Card content */}
                <div className="p-8 md:p-10">
                  {mockupContent ? (
                    mockupContent
                  ) : (
                    <div className="space-y-6">
                      {/* Dashboard preview mockup */}
                      <div className="space-y-4">
                        <div className="w-24 h-6 bg-gradient-to-r from-blue-400/30 to-cyan-400/30 rounded-lg"></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="aspect-square bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                            <span className="text-blue-400 text-2xl">📊</span>
                          </div>
                          <div className="aspect-square bg-white/5 rounded-lg border border-white/10 flex items-center justify-center">
                            <span className="text-cyan-400 text-2xl">📈</span>
                          </div>
                        </div>
                        <div className="h-24 bg-white/5 rounded-lg border border-white/10 flex flex-col items-center justify-center gap-2">
                          <span className="text-4xl">💼</span>
                          <span className="text-white/50 text-xs">Dashboard Preview</span>
                        </div>
                      </div>

                      {/* Floating elements */}
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -top-4 -right-4 w-20 h-20 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-xl"
                      ></motion.div>
                    </div>
                  )}
                </div>

                {/* Animated border */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent 0%, rgba(96, 165, 250, 0.1) 50%, transparent 100%)',
                    backgroundSize: '200% 200%',
                  }}
                ></motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
