import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export interface LogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: string;
  className?: string;
  animated?: boolean;
}

export function Logo({
  href = '/',
  size = 'md',
  showText = true,
  textColor = 'text-gray-800',
  className,
  animated = false,
}: LogoProps) {
  const [isHovered, setIsHovered] = useState(false);

  // Calculate logo size based on the size prop
  const logoSizes = {
    sm: { width: 30, height: 30, className: 'h-7 w-auto' },
    md: { width: 40, height: 40, className: 'h-9 w-auto' },
    lg: { width: 50, height: 50, className: 'h-12 w-auto' },
  };

  // Calculate text class based on the size prop
  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  };

  const { width, height, className: sizeClassName } = logoSizes[size];
  const textSize = textSizes[size];

  const logoComponent = (
    <div 
      className={cn("flex items-center", className)}
      onMouseEnter={animated ? () => setIsHovered(true) : undefined}
      onMouseLeave={animated ? () => setIsHovered(false) : undefined}
    >
      <Image
        src="/images/logo/sks_logo.png"
        alt="SKS Consulting Logo"
        width={width}
        height={height}
        style={{ width: 'auto', height: 'auto', maxHeight: `${height}px` }}
        className={cn("mr-2")}
        priority
      />
      {showText && (
        <span 
          className={cn(
            "font-bold transition-all duration-300", 
            textSize, 
            animated && isHovered 
              ? "bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500" 
              : textColor
          )}
        >
          SKS Consulting
        </span>
      )}
    </div>
  );

  // Never render a Link here - Link component should be used at parent level
  return logoComponent;
} 