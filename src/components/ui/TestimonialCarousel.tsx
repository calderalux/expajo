'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TestimonialCard, Testimonial } from './TestimonialCard';
import { cn } from '@/utils/cn';

interface TestimonialCarouselProps {
  testimonials: Testimonial[];
  className?: string;
}

export const TestimonialCarousel: React.FC<TestimonialCarouselProps> = ({
  testimonials,
  className = '',
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerView = 3; // Show 3 testimonials at once on desktop
  const totalSlides = Math.ceil(testimonials.length / itemsPerView);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  const getVisibleTestimonials = () => {
    const start = currentSlide * itemsPerView;
    const end = start + itemsPerView;
    return testimonials.slice(start, end);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {getVisibleTestimonials().map((testimonial) => (
          <TestimonialCard
            key={testimonial.id}
            testimonial={testimonial}
          />
        ))}
      </div>

      {/* Navigation Controls */}
      <div className="flex flex-col items-center gap-4">
        {/* Arrow Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className="w-10 h-10 rounded-full p-0 border-gray-300 hover:border-gray-400"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={nextSlide}
            disabled={currentSlide === totalSlides - 1}
            className="w-10 h-10 rounded-full p-0 border-gray-300 hover:border-gray-400"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </Button>
        </div>

        {/* Pagination Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === currentSlide
                  ? 'bg-primary w-6'
                  : 'bg-gray-300 hover:bg-gray-400'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
