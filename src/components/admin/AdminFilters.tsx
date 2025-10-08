'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Search } from 'lucide-react';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterConfig {
  id: string;
  label: string;
  type: 'search' | 'select';
  placeholder?: string;
  options?: FilterOption[];
  value: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

export interface AdminFiltersProps {
  filters: FilterConfig[];
  className?: string;
}

export const AdminFilters: React.FC<AdminFiltersProps> = ({
  filters,
  className = '',
}) => {
  const getGridCols = () => {
    const count = filters.length;
    if (count <= 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 3) return 'grid-cols-1 md:grid-cols-3';
    if (count <= 4) return 'grid-cols-1 md:grid-cols-4';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4';
  };

  return (
    <Card className={`mb-6 ${className}`}>
      <div className="p-6">
        <div className={`grid ${getGridCols()} gap-4`}>
          {filters.map((filter) => (
            <div key={filter.id}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {filter.label}
              </label>
              {filter.type === 'search' ? (
                <Input
                  placeholder={filter.placeholder || `Search ${filter.label.toLowerCase()}...`}
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                  leftIcon={filter.icon || <Search size={16} />}
                />
              ) : (
                <Select
                  options={filter.options || []}
                  value={filter.value}
                  onChange={filter.onChange}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
