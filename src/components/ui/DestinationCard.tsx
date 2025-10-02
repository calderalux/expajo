import React from 'react';
import Image from 'next/image';
import { MapPin, Globe, Calendar, Thermometer, Heart, Share2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/cn';
import { Destination } from '@/lib/services/destinations';

interface DestinationCardProps {
  destination: Destination;
  onViewDetails: () => void;
  onExplore: () => void;
  onToggleFavorite: () => void;
  onShare: () => void;
  className?: string;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onViewDetails,
  onExplore,
  onToggleFavorite,
  onShare,
  className = '',
}) => {
  return (
    <div className={cn('bg-white rounded-card shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300', className)}>
      {/* Image Section */}
      <div className="relative h-64 w-full">
        <Image
          src={destination.image_gallery?.[0] || destination.image_cover_url || '/placeholder-destination.jpg'}
          alt={destination.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={onToggleFavorite}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Heart size={18} className="text-gray-700" />
          </button>
          <button
            onClick={onShare}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
          >
            <Share2 size={18} className="text-gray-700" />
          </button>
        </div>

        {/* Featured Badge */}
        {destination.featured && (
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin size={16} className="mr-1" />
          <span>{destination.region}, {destination.country}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold font-playfair text-gray-900 mb-3 line-clamp-2">
          {destination.name}
        </h3>

        {/* Description */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3 flex-grow">
          {destination.description}
        </p>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2 mb-4">
          {destination.highlights?.slice(0, 3).map((highlight, index) => (
            <span
              key={index}
              className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full border border-gray-200"
            >
              {highlight}
            </span>
          ))}
          {destination.highlights && destination.highlights.length > 3 && (
            <span className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded-full border border-gray-200">
              +{destination.highlights.length - 3} more
            </span>
          )}
        </div>

        {/* Destination Info */}
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar size={16} className="mr-2" />
            <span>{destination.best_time_to_visit}</span>
          </div>
          <div className="flex items-center">
            <Thermometer size={16} className="mr-2" />
            <span>{destination.climate}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-auto">
          <Button
            variant="outline"
            className="flex-1"
            size="sm"
            onClick={onViewDetails}
          >
            View Details
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            size="sm"
            onClick={onExplore}
          >
            Explore
            <ArrowRight size={16} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
