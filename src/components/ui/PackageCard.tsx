import React from 'react';
import Image from 'next/image';
import { MapPin, Star, Clock, Users, Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export interface PackageInclusion {
  id: string;
  name: string;
}

export interface Package {
  id: string;
  title: string;
  location: string;
  description: string;
  imageUrl: string;
  originalPrice: number;
  currentPrice: number;
  currency: string;
  rating: number;
  reviewCount: number;
  duration: string;
  maxGuests: number;
  inclusions: PackageInclusion[];
  savings: number;
}

interface PackageCardProps {
  package: Package;
  className?: string;
  onBook?: (packageId: string) => void;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  package: pkg,
  className = '',
  onBook,
}) => {
  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleBook = () => {
    if (onBook) {
      onBook(pkg.id);
    }
  };

  return (
    <div className={cn('bg-white rounded-card shadow-md border border-gray-100 overflow-hidden h-full flex flex-col', className)}>
      {/* Image Section */}
      <div className="relative h-64 w-full">
        <Image
          src={pkg.imageUrl}
          alt={pkg.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Price Overlay */}
        <div className="absolute top-4 right-4 bg-black bg-opacity-80 text-white px-3 py-2 rounded-card">
          <div className="text-right">
            <div className="text-sm line-through opacity-75">
              {formatPrice(pkg.originalPrice, pkg.currency)}
            </div>
            <div className="text-lg font-bold">
              {formatPrice(pkg.currentPrice, pkg.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin size={16} className="mr-1" />
          <span>{pkg.location}</span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold font-playfair text-gray-900 mb-3 line-clamp-2">
          {pkg.title}
        </h3>

        {/* Rating */}
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <Star size={16} className="text-yellow-500 fill-current mr-1" />
          <span className="font-medium">{pkg.rating}</span>
          <span className="text-gray-400 ml-1">({pkg.reviewCount})</span>
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {pkg.description}
        </p>

        {/* Duration & Guests */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <Clock size={16} className="mr-2" />
            <span>{pkg.duration}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users size={16} className="mr-2" />
            <span>Up to {pkg.maxGuests}</span>
          </div>
        </div>

        {/* Inclusions */}
        <div className="mb-6">
          <div className="space-y-2">
            {pkg.inclusions.slice(0, 4).map((inclusion) => (
              <div key={inclusion.id} className="flex items-center text-sm text-gray-600">
                <Check size={16} className="text-green-500 mr-2 flex-shrink-0" />
                <span>{inclusion.name}</span>
              </div>
            ))}
            {pkg.inclusions.length > 4 && (
              <div className="text-sm text-gray-500 ml-6">
                + {pkg.inclusions.length - 4} more inclusions
              </div>
            )}
          </div>
        </div>

        {/* Price & Action */}
        <div className="mt-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {formatPrice(pkg.currentPrice, pkg.currency)}
              </div>
              <div className="text-sm text-gray-500">Per person</div>
            </div>
            <div className="text-right">
              <div className="text-green-600 font-semibold text-sm">
                Save {formatPrice(pkg.savings, pkg.currency)}
              </div>
              <div className="text-xs text-gray-500">
                {pkg.reviewCount} Reviews
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleBook}
            className="w-full rounded-full"
          >
            Book This Package
          </Button>
        </div>
      </div>
    </div>
  );
};
