import React from 'react';
import Image from 'next/image';
import { Star, Heart, Share2, Clock, Users } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/utils/cn';

export interface Experience {
  id: string;
  title: string;
  description: string;
  location: string;
  price_per_person: number;
  rating: number;
  reviews_count: number;
  image_urls: string[];
  features: string[];
  duration_hours: number;
  max_capacity: number;
  category: string;
}

interface ExperienceCardProps {
  experience: Experience;
  className?: string;
  onViewDetails?: (id: string) => void;
  onBookNow?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  onShare?: (id: string) => void;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  experience,
  className = '',
  onViewDetails,
  onBookNow,
  onToggleFavorite,
  onShare,
}) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full',
        className
      )}
    >
      {/* Image Section */}
      <div className="relative h-64 w-full flex-shrink-0">
        <Image
          src={experience.image_urls[0] || '/placeholder-experience.jpg'}
          alt={experience.title}
          fill
          className="object-cover"
        />

        {/* Price Overlay */}
        <div className="absolute bottom-0 right-0 bg-black/80 text-white px-3 py-2 rounded-tl-2xl">
          <span className="text-sm font-medium">
            {formatPrice(experience.price_per_person)} per person
          </span>
        </div>

        {/* Action Icons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => onToggleFavorite?.(experience.id)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            aria-label="Add to favorites"
          >
            <Heart size={16} className="text-gray-700" />
          </button>
          <button
            onClick={() => onShare?.(experience.id)}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            aria-label="Share experience"
          >
            <Share2 size={16} className="text-gray-700" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Top Content */}
        <div className="space-y-4 flex-grow">
          {/* Location */}
          <p className="text-sm text-gray-500">{experience.location}</p>

          {/* Title */}
          <h3 className="text-xl font-bold font-playfair text-gray-900 line-clamp-2">
            {experience.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <Star size={16} className="text-yellow-500 fill-current" />
            <span className="text-sm font-medium text-gray-900">
              {experience.rating}
            </span>
            <span className="text-sm text-gray-500">
              ({experience.reviews_count})
            </span>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
            {experience.description}
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-2">
            {experience.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full border border-gray-200"
              >
                {feature}
              </span>
            ))}
            {experience.features.length > 3 && (
              <span className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full border border-gray-200">
                +{experience.features.length - 3} more
              </span>
            )}
          </div>

          {/* Duration & Capacity */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{experience.duration_hours} hours</span>
            </div>
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>Up to {experience.max_capacity}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons - Always at bottom */}
        <div className="flex gap-3 pt-4 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onViewDetails?.(experience.id)}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={() => onBookNow?.(experience.id)}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
};
