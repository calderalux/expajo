import React from 'react';
import { cn } from '@/utils/cn';

interface ServiceCategoryButtonProps {
  id: string;
  name: string;
  count: number;
  isSelected: boolean;
  onClick: (id: string) => void;
  className?: string;
}

export const ServiceCategoryButton: React.FC<ServiceCategoryButtonProps> = ({
  id,
  name,
  count,
  isSelected,
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={() => onClick(id)}
      className={cn(
        'px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap',
        isSelected
          ? 'bg-primary text-white shadow-md'
          : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm',
        className
      )}
    >
      {name} ({count})
    </button>
  );
};
