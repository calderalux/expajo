import React from 'react';
import Image from 'next/image';
import { Star, MapPin, Calendar, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';

export interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  user: {
    name: string;
    location: string;
    avatar: string;
  };
  experience: string;
  date: string;
  likes: number;
  isVerified: boolean;
}

interface TestimonialCardProps {
  testimonial: Testimonial;
  className?: string;
}

export const TestimonialCard: React.FC<TestimonialCardProps> = ({
  testimonial,
  className = '',
}) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        size={16}
        className={cn(
          'fill-current',
          index < rating ? 'text-yellow-400' : 'text-gray-300'
        )}
      />
    ));
  };

  return (
    <Card className={cn('p-6 h-full flex flex-col', className)}>
      {/* Header with rating, verified tag, and likes */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            {renderStars(testimonial.rating)}
          </div>
          {testimonial.isVerified && (
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
              Verified review
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <Heart size={14} />
          <span>{testimonial.likes}</span>
        </div>
      </div>

      {/* Quote */}
      <blockquote className="text-gray-700 text-base leading-relaxed mb-6 flex-grow">
        &ldquo;{testimonial.comment}&rdquo;
      </blockquote>

      {/* User Profile */}
      <div className="flex items-center gap-3 mb-4">
        <Image
          src={testimonial.user.avatar}
          alt={testimonial.user.name}
          width={48}
          height={48}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-grow">
          <h4 className="font-semibold text-gray-900 text-sm">
            {testimonial.user.name}
          </h4>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin size={12} />
              <span>{testimonial.user.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>{testimonial.date}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Experience */}
      <div className="pt-4 border-t border-gray-100">
        <div className="text-xs">
          <span className="font-semibold text-gray-700">Experience:</span>
          <span className="text-gray-600 ml-1">{testimonial.experience}</span>
        </div>
      </div>
    </Card>
  );
};
