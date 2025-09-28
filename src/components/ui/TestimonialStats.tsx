import React from 'react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface TestimonialStat {
  value: string;
  label: string;
}

interface TestimonialStatsProps {
  stats: TestimonialStat[];
  className?: string;
}

export const TestimonialStats: React.FC<TestimonialStatsProps> = ({
  stats,
  className = '',
}) => {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-6', className)}>
      {stats.map((stat, index) => (
        <Card key={stat.label} className="p-6 text-center">
          <div className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-2">
            {stat.value}
          </div>
          <div className="text-sm md:text-base text-gray-600 font-medium">
            {stat.label}
          </div>
        </Card>
      ))}
    </div>
  );
};
