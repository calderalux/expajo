import React from 'react';
import { cn } from '@/utils/cn';

interface CTAButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  className?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  children,
  onClick,
  href,
  className = '',
  variant = 'primary',
  size = 'lg',
}) => {
  const baseClasses =
    'font-semibold text-white rounded-full transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95 focus:outline-none';

  const variantClasses = {
    primary:
      'bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90',
    secondary:
      'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600',
  };

  const sizeClasses = {
    sm: 'px-6 py-3 text-sm',
    md: 'px-8 py-4 text-base',
    lg: 'px-12 py-5 text-lg',
  };

  const buttonClasses = cn(
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (href) {
    return (
      <a href={href} className={buttonClasses}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={buttonClasses}>
      {children}
    </button>
  );
};
