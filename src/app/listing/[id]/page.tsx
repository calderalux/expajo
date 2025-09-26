'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { BookingForm } from '@/components/forms/BookingForm';
import { Modal } from '@/components/ui/Modal';
import { 
  Star, 
  MapPin, 
  Wifi, 
  Car, 
  Coffee, 
  Dumbbell, 
  Waves, 
  Mountain, 
  Building,
  Heart,
  Share2,
  Calendar,
  Users
} from 'lucide-react';
import Image from 'next/image';

interface Listing {
  id: string;
  title: string;
  description: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  images: string[];
  amenities: string[];
  host: {
    name: string;
    avatar: string;
    rating: number;
    responseTime: string;
  };
  rules: string[];
  cancellationPolicy: string;
}

const mockListing: Listing = {
  id: '1',
  title: 'Modern Downtown Apartment',
  description: 'Beautiful modern apartment in the heart of downtown with stunning city views. Perfect for business travelers or tourists looking to explore the city. The apartment features a fully equipped kitchen, comfortable living area, and a private balcony overlooking the city skyline.',
  location: 'New York, NY',
  price: 120,
  rating: 4.9,
  reviews: 128,
  images: [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop',
  ],
  amenities: ['Wifi', 'Parking', 'Gym', 'Coffee', 'Workspace'],
  host: {
    name: 'Sarah Johnson',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    rating: 4.9,
    responseTime: 'within an hour',
  },
  rules: [
    'No smoking',
    'No pets',
    'No parties or events',
    'Check-in after 3:00 PM',
    'Check-out before 11:00 AM',
  ],
  cancellationPolicy: 'Free cancellation up to 24 hours before check-in',
};

const amenityIcons: Record<string, React.ReactNode> = {
  Wifi: <Wifi size={20} />,
  Parking: <Car size={20} />,
  Gym: <Dumbbell size={20} />,
  Coffee: <Coffee size={20} />,
  Workspace: <Building size={20} />,
  'Beach Access': <Waves size={20} />,
  Pool: <Waves size={20} />,
  Fireplace: <Waves size={20} />,
  Hiking: <Mountain size={20} />,
  'Scenic Views': <Mountain size={20} />,
  'City Views': <Building size={20} />,
};

export default function ListingDetailPage() {
  const params = useParams();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const listing = mockListing; // In real app, fetch by ID

  const handleBooking = (data: any) => {
    console.log('Booking data:', data);
    // TODO: Implement booking logic
    setShowBookingModal(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Image Gallery */}
      <div className="relative h-96 md:h-[500px]">
        <Image
          src={listing.images[currentImageIndex]}
          alt={listing.title}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFavorited(!isFavorited)}
            className="bg-white/90 backdrop-blur-sm"
          >
            <Heart size={20} className={isFavorited ? 'text-red-500 fill-current' : 'text-gray-600'} />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-white/90 backdrop-blur-sm"
          >
            <Share2 size={20} />
          </Button>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
          {listing.images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index === currentImageIndex ? 'bg-white' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-bold font-playfair text-gray-900 mb-2">
                {listing.title}
              </h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin size={20} className="mr-2" />
                <span>{listing.location}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center">
                  <Star size={20} className="text-yellow-500 fill-current mr-1" />
                  <span className="font-medium">{listing.rating}</span>
                  <span className="text-gray-500 ml-1">({listing.reviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-semibold font-playfair mb-4">About this place</h2>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            {/* Amenities */}
            <div>
              <h2 className="text-2xl font-semibold font-playfair mb-4">What this place offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-3">
                    <div className="text-primary">
                      {amenityIcons[amenity]}
                    </div>
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Host */}
            <div>
              <h2 className="text-2xl font-semibold font-playfair mb-4">Meet your host</h2>
              <Card className="p-6">
                <div className="flex items-center gap-4">
                  <img
                    src={listing.host.avatar}
                    alt={listing.host.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold">{listing.host.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Star size={16} className="text-yellow-500 fill-current" />
                      <span>{listing.host.rating}</span>
                      <span>•</span>
                      <span>Responds {listing.host.responseTime}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* House Rules */}
            <div>
              <h2 className="text-2xl font-semibold font-playfair mb-4">House rules</h2>
              <ul className="space-y-2">
                {listing.rules.map((rule, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-700">
                    <div className="w-1 h-1 bg-gray-400 rounded-full" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Cancellation Policy */}
            <div>
              <h2 className="text-2xl font-semibold font-playfair mb-4">Cancellation policy</h2>
              <p className="text-gray-700">{listing.cancellationPolicy}</p>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-primary mb-2">
                  ${listing.price}
                  <span className="text-lg font-normal text-gray-500">/night</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Star size={16} className="text-yellow-500 fill-current" />
                  <span>{listing.rating}</span>
                  <span>•</span>
                  <span>{listing.reviews} reviews</span>
                </div>
              </div>

              <Button
                className="w-full mb-4"
                onClick={() => setShowBookingModal(true)}
              >
                Reserve
              </Button>

              <div className="text-center text-sm text-gray-600">
                You won't be charged yet
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title="Complete Your Booking"
        size="lg"
      >
        <BookingForm
          listingId={listing.id}
          pricePerNight={listing.price}
          onSubmit={handleBooking}
        />
      </Modal>
    </div>
  );
}
