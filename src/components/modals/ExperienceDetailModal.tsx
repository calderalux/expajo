'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, MapPin, Star, Clock, Users, Heart, Share2, Calendar, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import { Experience } from '@/lib/services/experiences';

interface ExperienceDetailModalProps {
  experience: Experience;
  isOpen: boolean;
  onClose: () => void;
}

export const ExperienceDetailModal: React.FC<ExperienceDetailModalProps> = ({
  experience,
  isOpen,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: experience.title,
        text: experience.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleBookNow = () => {
    // TODO: Implement booking functionality
    console.log('Book now:', experience.id);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size="xl"
        >
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors"
            >
              <X size={20} className="text-gray-700" />
            </button>

            {/* Image Gallery */}
            <div className="relative h-80 w-full mb-6">
              <Image
                src={experience.image_urls[selectedImageIndex] || '/placeholder-experience.jpg'}
                alt={experience.title}
                fill
                className="object-cover rounded-t-card"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
              
              {/* Image Navigation */}
              {experience.image_urls.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {experience.image_urls.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-200',
                        index === selectedImageIndex
                          ? 'bg-white'
                          : 'bg-white/50 hover:bg-white/75'
                      )}
                    />
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="absolute top-4 left-4 flex gap-2">
                <button
                  onClick={handleToggleFavorite}
                  className={cn(
                    'p-2 rounded-full transition-colors',
                    isFavorited
                      ? 'bg-red-500 text-white'
                      : 'bg-white/90 backdrop-blur-sm text-gray-700 hover:bg-white'
                  )}
                >
                  <Heart size={18} className={isFavorited ? 'fill-current' : ''} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-white transition-colors"
                >
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin size={16} className="mr-1" />
                  <span>{experience.location}</span>
                </div>
                
                <h2 className="text-3xl font-bold font-playfair text-gray-900 mb-4">
                  {experience.title}
                </h2>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <Star size={20} className="text-yellow-500 fill-current mr-1" />
                    <span className="font-semibold">{experience.rating}</span>
                    <span className="text-gray-500 ml-1">({experience.reviews_count} reviews)</span>
                  </div>
                  <div className="text-2xl font-bold text-primary">
                    {formatPrice(experience.price_per_person)}
                    <span className="text-sm font-normal text-gray-500"> per person</span>
                  </div>
                </div>
              </div>

              {/* Experience Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Clock size={20} className="mr-3" />
                    <div>
                      <div className="font-medium">Duration</div>
                      <div className="text-sm">{experience.duration_hours} hours</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Users size={20} className="mr-3" />
                    <div>
                      <div className="font-medium">Group Size</div>
                      <div className="text-sm">Up to {experience.max_capacity} people</div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Calendar size={20} className="mr-3" />
                    <div>
                      <div className="font-medium">Category</div>
                      <div className="text-sm capitalize">{experience.category}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">What&apos;s Included</h3>
                  <div className="space-y-2">
                    {experience.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">About This Experience</h3>
                <p className="text-gray-700 leading-relaxed">
                  {experience.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={onClose}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  className="flex-1"
                  onClick={handleBookNow}
                >
                  Book This Experience
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
