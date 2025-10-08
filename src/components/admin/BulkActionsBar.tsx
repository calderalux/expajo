'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckSquare, Eye, EyeOff, Trash2 } from 'lucide-react';

export interface BulkAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  color?: 'green' | 'orange' | 'red' | 'blue';
  onClick: () => void;
}

export interface BulkActionsBarProps {
  isVisible: boolean;
  selectedCount: number;
  actions: BulkAction[];
  onCancel: () => void;
  className?: string;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  isVisible,
  selectedCount,
  actions,
  onCancel,
  className = '',
}) => {
  if (!isVisible) return null;

  const getColorClasses = (color?: string) => {
    switch (color) {
      case 'green':
        return 'text-green-700 border-green-300 hover:bg-green-50';
      case 'orange':
        return 'text-orange-700 border-orange-300 hover:bg-orange-50';
      case 'red':
        return 'text-red-700 border-red-300 hover:bg-red-50';
      case 'blue':
        return 'text-blue-700 border-blue-300 hover:bg-blue-50';
      default:
        return '';
    }
  };

  return (
    <Card className={`p-4 mb-6 bg-blue-50 border-blue-200 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-900">
            {selectedCount} item(s) selected
          </span>
        </div>
        <div className="flex gap-2">
          {actions.map((action) => (
            <Button
              key={action.id}
              variant={action.variant || 'outline'}
              size="sm"
              onClick={action.onClick}
              className={getColorClasses(action.color)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};
