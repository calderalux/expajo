'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { X, MapPin, Globe, Calendar, Thermometer, Heart, Share2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/utils/cn';
import { Destination } from '@/lib/services/destinations';

interface DestinationDetailModalProps {
  destination: Destination;
  isOpen: boolean;
  onClose: () => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  isOpen,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleToggleFavorite = () => {
    setIsFavorited(!isFavorited);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: destination.name,
        text: destination.description || '',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleExplore = () => {
    // TODO: Implement explore functionality
    console.log('Explore:', destination.id);
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
                src={destination.image_gallery?.[selectedImageIndex] || destination.image_cover_url || '/placeholder-destination.jpg'}
                alt={destination.name}
                fill
                className="object-cover rounded-t-card"
                sizes="(max-width: 768px) 100vw, 80vw"
              />
              
              {/* Image Navigation */}
              {destination.image_gallery && destination.image_gallery.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                  {destination.image_gallery.map((_: any, index: number) => (
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

              {/* Featured Badge */}
              {destination.featured && (
                <div className="absolute top-4 left-20">
                  <span className="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                    Featured Destination
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <MapPin size={16} className="mr-1" />
                  <span>{destination.region}, {destination.country}</span>
                </div>
                
                <h2 className="text-3xl font-bold font-playfair text-gray-900 mb-4">
                  {destination.name}
                </h2>
              </div>

              {/* Destination Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={20} className="mr-3" />
                    <div>
                      <div className="font-medium">Best Time to Visit</div>
                      <div className="text-sm">{destination.best_time_to_visit}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-gray-600">
                    <Thermometer size={20} className="mr-3" />
                    <div>
                      <div className="font-medium">Climate</div>
                      <div className="text-sm">{destination.climate}</div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600">
                    <Globe size={20} className="mr-3" />
                    <div>
                      <div className="font-medium">Language</div>
                      <div className="text-sm">{destination.language}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Highlights</h3>
                  <div className="space-y-2">
                    {destination.highlights?.map((highlight, index) => (
                      <div key={index} className="flex items-center text-sm text-gray-600">
                        <CheckCircle size={16} className="text-green-500 mr-2 flex-shrink-0" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="mb-8">
                <h3 className="font-semibold text-gray-900 mb-3">About This Destination</h3>
                <p className="text-gray-700 leading-relaxed">
                  {destination.description}
                </p>
              </div>

              {/* Travel Info */}
              <div className="bg-gray-50 rounded-card p-6 mb-8">
                <h3 className="font-semibold text-gray-900 mb-4">Travel Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Currency</div>
                    <div className="text-gray-600">{destination.currency}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Language</div>
                    <div className="text-gray-600">{destination.language}</div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-700 mb-1">Climate</div>
                    <div className="text-gray-600">{destination.climate}</div>
                  </div>
                </div>
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
                  onClick={handleExplore}
                >
                  Explore This Destination
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </AnimatePresence>
  );
};
