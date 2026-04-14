/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      animation: {
        blob: 'blob 7s infinite',
        'float-rotate': 'floatRotate 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'float-up': 'floatUp 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s ease-in-out infinite',
        'rotate-scale': 'rotateScale 3s ease-in-out infinite',
        'wave': 'wave 2s ease-in-out infinite',
        'flip-bounce': 'flipBounce 1s ease-in-out infinite',
        'slide-fade': 'slideFade 2s ease-in-out infinite',
        'carousel-slide': 'carouselSlide 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'glow-pulse': 'glowPulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        blob: {
          '0%, 100%': {
            transform: 'translate(0, 0) scale(1)',
          },
          '33%': {
            transform: 'translate(30px, -50px) scale(1.1)',
          },
          '66%': {
            transform: 'translate(-20px, 20px) scale(0.9)',
          },
        },
        floatRotate: {
          '0%, 100%': {
            transform: 'translateY(0px) rotateZ(0deg) scale(1)',
          },
          '25%': {
            transform: 'translateY(-10px) rotateZ(5deg) scale(0.95)',
          },
          '50%': {
            transform: 'translateY(-20px) rotateZ(0deg) scale(1)',
          },
          '75%': {
            transform: 'translateY(-10px) rotateZ(-5deg) scale(0.95)',
          },
        },
        pulseGlow: {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.7)',
          },
          '50%': {
            opacity: '0.8',
            boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)',
          },
        },
        floatUp: {
          '0%, 100%': {
            transform: 'translateY(0px)',
            opacity: '1',
          },
          '50%': {
            transform: 'translateY(-15px)',
          },
        },
        shimmer: {
          '0%': {
            backgroundPosition: '-1000px 0',
          },
          '100%': {
            backgroundPosition: '1000px 0',
          },
        },
        rotateScale: {
          '0%': {
            transform: 'rotate(0deg) scale(1)',
          },
          '50%': {
            transform: 'rotate(180deg) scale(1.1)',
          },
          '100%': {
            transform: 'rotate(360deg) scale(1)',
          },
        },
        wave: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '25%': {
            transform: 'translateY(-5px)',
          },
          '50%': {
            transform: 'translateY(0px)',
          },
          '75%': {
            transform: 'translateY(-3px)',
          },
        },
        flipBounce: {
          '0%, 100%': {
            transform: 'rotateY(0deg) translateY(0px)',
          },
          '50%': {
            transform: 'rotateY(180deg) translateY(-5px)',
          },
        },
        slideFade: {
          '0%': {
            transform: 'translateX(-20px)',
            opacity: '0',
          },
          '50%': {
            opacity: '1',
          },
          '100%': {
            transform: 'translateX(0px)',
            opacity: '0.8',
          },
        },
        carouselSlide: {
          '0%': {
            transform: 'translateX(0) scale(0.8)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateX(0) scale(1)',
            opacity: '1',
          },
        },
        glowPulse: {
          '0%, 100%': {
            filter: 'drop-shadow(0 0 0px rgba(59, 130, 246, 0.5))',
          },
          '50%': {
            filter: 'drop-shadow(0 0 20px rgba(59, 130, 246, 0.8))',
          },
        },
      },
    },
  },
  plugins: [],
};