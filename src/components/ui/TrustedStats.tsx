import React from 'react';
import { cn } from '@/utils/cn';

interface TrustedStat {
  value: string;
  label: string;
}

interface TrustedStatsProps {
  stats: TrustedStat[];
  className?: string;
}

export const TrustedStats: React.FC<TrustedStatsProps> = ({
  stats,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-col md:flex-row items-center justify-center', className)}>
      {stats.map((stat, index) => (
        <div key={stat.label} className="flex-1 text-center relative">
          <div className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-2">
            {stat.value}
          </div>
          <div className="text-sm md:text-base text-gray-600 font-medium">
            {stat.label}
          </div>
          {index < stats.length - 1 && (
            <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-12 bg-gray-300"></div>
          )}
        </div>
      ))}
    </div>
  );
};
