'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckSquare } from 'lucide-react';

export interface AdminDataGridProps<T> {
  items: T[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  onEmptyAction?: () => void;
  emptyActionText?: string;
  renderItem: (item: T, index: number) => React.ReactNode;
  renderSkeleton: (index: number) => React.ReactNode;
  showBulkSelection?: boolean;
  selectedItems?: Set<string>;
  onSelectItem?: (id: string) => void;
  onSelectAll?: () => void;
  getItemId?: (item: T) => string;
  gridCols?: '1' | '2' | '3' | '4';
  className?: string;
}

export const AdminDataGrid = <T,>({
  items,
  isLoading,
  error,
  onRetry,
  onEmptyAction,
  emptyActionText = 'Create First Item',
  renderItem,
  renderSkeleton,
  showBulkSelection = false,
  selectedItems = new Set(),
  onSelectItem,
  onSelectAll,
  getItemId,
  gridCols = '3',
  className = '',
}: AdminDataGridProps<T>) => {
  const getGridClass = () => {
    switch (gridCols) {
      case '1': return 'grid-cols-1';
      case '2': return 'grid-cols-1 md:grid-cols-2';
      case '3': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
      case '4': return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default: return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    }
  };

  if (isLoading) {
    return (
      <div className={`grid ${getGridClass()} gap-6 ${className}`}>
        {[...Array(6)].map((_, index) => renderSkeleton(index))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <div className="text-red-600 text-lg mb-4">{error}</div>
        {onRetry && <Button onClick={onRetry}>Try Again</Button>}
      </Card>
    );
  }

  if (items.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="text-gray-500 text-lg mb-4">No items found</div>
        {onEmptyAction && (
          <Button onClick={onEmptyAction}>{emptyActionText}</Button>
        )}
      </Card>
    );
  }

  return (
    <div className={`grid ${getGridClass()} gap-6 ${className}`}>
      {/* Select All Checkbox */}
      {showBulkSelection && onSelectAll && getItemId && (
        <div className="col-span-full mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedItems.size === items.length && items.length > 0}
              onChange={onSelectAll}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <span className="text-sm font-medium text-gray-700">
              Select All ({items.length} items)
            </span>
          </label>
        </div>
      )}
      
      {items.map((item, index) => (
        <div key={getItemId ? getItemId(item) : index} className="relative">
          {/* Selection Checkbox */}
          {showBulkSelection && onSelectItem && getItemId && (
            <div className="absolute top-4 left-4 z-10">
              <input
                type="checkbox"
                checked={selectedItems.has(getItemId(item))}
                onChange={() => onSelectItem(getItemId(item))}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>
          )}
          {renderItem(item, index)}
        </div>
      ))}
    </div>
  );
};
