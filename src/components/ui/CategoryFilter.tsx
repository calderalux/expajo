import React from 'react';
import { cn } from '@/utils/cn';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
  className = '',
}) => {
  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onCategoryChange(category)}
          className={cn(
            'px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap',
            activeCategory === category
              ? 'bg-gray-900 text-white shadow-sm'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400 hover:shadow-sm'
          )}
        >
          {category}
        </button>
      ))}
    </div>
  );
};
