import React from 'react';
import { showSuccess } from '../utils/alertUtils';

const Card = ({ 
  title = 'This is a success message',
  message = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  type = 'success', // 'success', 'error', 'warning', 'info'
  onDismiss = null
}) => {
  
  const handleShowAlert = () => {
    showSuccess(title, message, onDismiss);
  };

  const colorConfig = {
    success: {
      border: 'border-green-600/70',
      bg: 'from-green-200 to-green-50',
      icon: '#16a34a',
      text: 'text-green-700',
      subtext: 'text-green-600',
      ring: 'ring-green-600',
      borderIcon: 'border-green-300'
    },
    error: {
      border: 'border-red-600/70',
      bg: 'from-red-200 to-red-50',
      icon: '#dc2626',
      text: 'text-red-700',
      subtext: 'text-red-600',
      ring: 'ring-red-600',
      borderIcon: 'border-red-300'
    },
    warning: {
      border: 'border-yellow-600/70',
      bg: 'from-yellow-200 to-yellow-50',
      icon: '#f59e0b',
      text: 'text-yellow-700',
      subtext: 'text-yellow-600',
      ring: 'ring-yellow-600',
      borderIcon: 'border-yellow-300'
    },
    info: {
      border: 'border-blue-600/70',
      bg: 'from-blue-200 to-blue-50',
      icon: '#2563eb',
      text: 'text-blue-700',
      subtext: 'text-blue-600',
      ring: 'ring-blue-600',
      borderIcon: 'border-blue-300'
    }
  };

  const icons = {
    success: (
      <svg fill="oklch(62.7% 0.194 149.214)" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <defs />
        <path id="checkmark" className="cls-1" d="M1224,312a12,12,0,1,1,3.32-23.526l-1.08,1.788A10,10,0,1,0,1234,300a9.818,9.818,0,0,0-.59-3.353l1.27-2.108A11.992,11.992,0,0,1,1224,312Zm0.92-8.631a0.925,0.925,0,0,1-.22.355,0.889,0.889,0,0,1-.72.259,0.913,0.913,0,0,1-.94-0.655l-3.82-3.818a0.9,0.9,0,0,1,1.27-1.271l3.25,3.251,7.39-10.974a1,1,0,0,1,1.38-.385,1.051,1.051,0,0,1,.36,1.417Z" transform="translate(-1212 -288)" />
      </svg>
    ),
    error: (
      <svg fill="#dc2626" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    ),
    warning: (
      <svg fill="#f59e0b" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
      </svg>
    ),
    info: (
      <svg fill="#2563eb" width="24px" height="24px" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>
    )
  };

  const config = colorConfig[type] || colorConfig.success;

  return (
    <div className="space-y-4">
      {/* Alert Card */}
      <div 
        onClick={handleShowAlert}
        className={`max-w-md mx-auto p-4 border ${config.border} rounded-lg bg-gradient-to-b ${config.bg} flex items-start space-x-3 shadow-lg cursor-pointer hover:shadow-xl transition-shadow duration-200`}
      >
        <div className="flex-shrink-0">
          <div className={`w-10 h-10 flex items-center justify-center bg-white border ${config.borderIcon} rounded-full ring-1 ${config.ring}`}>
            <span className={config.text}>
              {icons[type]}
            </span>
          </div>
        </div>
        <div className="flex-1">
          <span className={`text-xl mb-1.5 font-semibold ${config.text} tracking-normal block`}>
            {title}
          </span>
          <p className={`${config.subtext} text-xs`}>
            {message}
          </p>
        </div>
      </div>

      {/* Decorative SVG */}
      <div className="flex justify-center">
        <svg 
          version="1.1" 
          id="Layer_1" 
          xmlns="http://www.w3.org/2000/svg" 
          x="0px" 
          y="0px" 
          viewBox="0 0 122.88 109.76" 
          style={{enableBackground: 'new 0 0 122.88 109.76', width: '60px', height: 'auto'}}
          xmlSpace="preserve"
        >
          <style>{`.st0 { fill: ${config.icon}; }`}</style>
          <g>
            <path className="st0" d="M0,52.88l22.68-0.3c8.76,5.05,16.6,11.59,23.35,19.86C63.49,43.49,83.55,19.77,105.6,0h17.28 C92.05,34.25,66.89,70.92,46.77,109.76C36.01,86.69,20.96,67.27,0,52.88L0,52.88z" />
          </g>
        </svg>
      </div>
    </div>
  );
};

export default Card;
