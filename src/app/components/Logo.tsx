import React from 'react';
import BrandLogo from './BrandLogo';

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
  darkMode?: boolean;
}

const sizeMap = {
  sm: 32,
  md: 48,
  lg: 64,
  xl: 96,
};

export function Logo({ 
  variant = 'full', 
  className = '', 
  size = 'md',
  animate = true,
  darkMode = false 
}: LogoProps) {
  const pxSize = sizeMap[size];

  // Icon only variant - smaller, compact logo
  if (variant === 'icon') {
    return (
      <div className={className}>
        <BrandLogo 
          size={pxSize} 
          animate={animate}
          darkMode={darkMode}
          variant="icon"
        />
      </div>
    );
  }

  // Full variant - includes logo with text (text is embedded in BrandLogo SVG)
  return (
    <div className={className}>
      <BrandLogo 
        size={pxSize} 
        animate={animate}
        darkMode={darkMode}
        variant={variant}
      />
    </div>
  );
}
