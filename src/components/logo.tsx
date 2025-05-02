import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface LogoProps {
  href?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textColor?: string;
  className?: string;
}

export function Logo({
  href = '/',
  size = 'md',
  showText = true,
  textColor = 'text-gray-800',
  className,
}: LogoProps) {
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

  const logo = (
    <div className={cn("flex items-center", className)}>
      <Image
        src="/images/logo/sks_logo.png"
        alt="SKS Consulting Logo"
        width={width}
        height={height}
        className={cn(sizeClassName, "mr-2")}
        priority
      />
      {showText && (
        <span className={cn("font-bold", textSize, textColor)}>
          SKS Consulting
        </span>
      )}
    </div>
  );

  // If href is provided, wrap in a Link
  if (href) {
    return <Link href={href}>{logo}</Link>;
  }

  // Otherwise just return the logo
  return logo;
} 