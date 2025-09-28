import React from 'react';
import { MapPin, Shield, Users, MessageCircle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

interface TrustedFeatureCardProps {
  iconName: 'MapPin' | 'Shield' | 'Users' | 'MessageCircle';
  title: string;
  description: string;
  className?: string;
}

const iconMap = {
  MapPin: MapPin,
  Shield: Shield,
  Users: Users,
  MessageCircle: MessageCircle,
};

export const TrustedFeatureCard: React.FC<TrustedFeatureCardProps> = ({
  iconName,
  title,
  description,
  className = '',
}) => {
  const IconComponent = iconMap[iconName];

  return (
    <Card className={cn('p-8 text-center h-full', className)}>
      <div className="flex flex-col items-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 flex items-center justify-center">
            <IconComponent size={32} className="text-primary" />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 font-lato">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>
    </Card>
  );
};
