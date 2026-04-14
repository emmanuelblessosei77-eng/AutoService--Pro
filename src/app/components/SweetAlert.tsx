import React, { useState, useEffect } from 'react';

interface SweetAlertProps {
  message: string;
  subText?: string;
  type?: 'success' | 'error' | 'warning';
  duration?: number;
  onClose?: () => void;
}

const SweetAlert: React.FC<SweetAlertProps> = ({ message, subText, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Color schemes based on type
  const colors = {
    success: {
      bg: 'bg-white',
      icon: 'text-green-600',
      iconBg: 'bg-green-100',
      text: 'text-green-700',
      wave: 'bg-green-100',
    },
    error: {
      bg: 'bg-white',
      icon: 'text-red-600',
      iconBg: 'bg-red-100',
      text: 'text-red-700',
      wave: 'bg-red-100',
    },
    warning: {
      bg: 'bg-white',
      icon: 'text-amber-600',
      iconBg: 'bg-amber-100',
      text: 'text-amber-700',
      wave: 'bg-amber-100',
    },
  };

  const color = colors[type];

  return (
    <div className="fixed top-5 right-5 left-5 sm:left-auto z-50 animate-in slide-in-from-right duration-300">
      <div className={`${color.bg} w-full sm:w-96 rounded-lg shadow-2xl p-6 flex items-center gap-4 relative overflow-hidden`}>
        {/* Wave background */}
        <div className={`absolute top-0 left-0 w-32 h-full ${color.wave} opacity-20 transform -skew-x-12`}></div>
        
        {/* Icon Container */}
        <div className={`flex-shrink-0 w-14 h-14 rounded-full ${color.iconBg} flex items-center justify-center relative z-10`}>
          {type === 'success' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={`w-6 h-6 ${color.icon}`}>
              <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM369 209c9.4-9.4 9.4-24.6 0-33.9s-24.6-9.4-33.9 0l-111 111-47-47c-9.4-9.4-24.6-9.4-33.9 0s-9.4 24.6 0 33.9l64 64c9.4 9.4 24.6 9.4 33.9 0L369 209z" />
            </svg>
          )}
          {type === 'error' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={`w-6 h-6 ${color.icon}`}>
              <path d="M256 48a208 208 0 1 1 0 416 208 208 0 1 1 0-416zm0 464A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-338c13.3 0 24 10.7 24 24v112c0 13.3-10.7 24-24 24s-24-10.7-24-24V198c0-13.3 10.7-24 24-24zm32 224c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z" />
            </svg>
          )}
          {type === 'warning' && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" className={`w-6 h-6 ${color.icon}`}>
              <path d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 432c7.3 14.6 7.3 29.2 0 43.8C507.3 504.5 494.2 512 480 512H32c-14.2 0-27.3-7.5-34.5-19.8l-216-432C-7.3 45.4-7.3 30.8 0 16.2C4.7 6.5 17.8 0 32 0h448zM256 224c-13.3 0-24 10.7-24 24v64c0 13.3 10.7 24 24 24s24-10.7 24-24v-64c0-13.3-10.7-24-24-24zm32 128c0 17.7-14.3 32-32 32s-32-14.3-32-32 14.3-32 32-32 32 14.3 32 32z" />
            </svg>
          )}
        </div>

        {/* Text Content */}
        <div className="flex-grow min-w-0 relative z-10">
          <p className={`font-bold text-lg ${color.text}`}>{message}</p>
          {subText && <p className="text-sm text-gray-600 mt-1">{subText}</p>}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 relative z-10"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15 15" fill="currentColor" className="w-5 h-5">
            <path fillRule="evenodd" d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default SweetAlert;
