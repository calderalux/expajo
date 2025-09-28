import React from 'react';
import { LucideIcon } from 'lucide-react';

interface TrustIndicatorProps {
  icon: LucideIcon;
  value: string;
  label: string;
  className?: string;
  isLast?: boolean;
}

export const TrustIndicator: React.FC<TrustIndicatorProps> = ({
  icon: Icon,
  value,
  label,
  className = '',
  isLast = false,
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Icon size={16} className="text-primary" />
      <span className="text-sm text-gray-600">{value}</span>
      {!isLast && <span className="text-sm text-gray-400">•</span>}
    </div>
  );
};
