'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, MapPin, Wifi, Car, Coffee, Dumbbell, Waves, Mountain, Building } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';

const featuredListings = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    location: 'New York, NY',
    price: 120,
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop',
    amenities: ['Wifi', 'Parking', 'Gym', 'Coffee'],
    isNew: true,
  },
  {
    id: '2',
    title: 'Cozy Beach House',
    location: 'Miami, FL',
    price: 200,
    rating: 4.8,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop',
    amenities: ['Wifi', 'Parking', 'Beach Access', 'Pool'],
    isNew: false,
  },
  {
    id: '3',
    title: 'Mountain Cabin Retreat',
    location: 'Aspen, CO',
    price: 180,
    rating: 4.9,
    reviews: 76,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop',
    amenities: ['Wifi', 'Fireplace', 'Hiking', 'Scenic Views'],
    isNew: true,
  },
  {
    id: '4',
    title: 'Urban Loft Space',
    location: 'San Francisco, CA',
    price: 150,
    rating: 4.7,
    reviews: 203,
    image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&h=300&fit=crop',
    amenities: ['Wifi', 'Workspace', 'City Views', 'Coffee'],
    isNew: false,
  },
];

const amenityIcons: Record<string, React.ReactNode> = {
  Wifi: <Wifi size={16} />,
  Parking: <Car size={16} />,
  Gym: <Dumbbell size={16} />,
  Coffee: <Coffee size={16} />,
  'Beach Access': <Waves size={16} />,
  Pool: <Waves size={16} />,
  Fireplace: <Waves size={16} />,
  Hiking: <Mountain size={16} />,
  'Scenic Views': <Mountain size={16} />,
  Workspace: <Waves size={16} />,
  'City Views': <Building size={16} />,
};

export const FeaturedListSection: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-6">
            Featured Properties
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Handpicked accommodations that offer exceptional experiences
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredListings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card hover className="overflow-hidden p-0">
                {/* Image */}
                <div className="relative h-48 w-full">
                  <Image
                    src={listing.image}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                  {listing.isNew && (
                    <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-sm font-medium">
                      New
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                    <Star size={16} className="text-yellow-500 fill-current" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                      {listing.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">
                        ${listing.price}
                        <span className="text-sm font-normal text-gray-500">/night</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin size={16} className="mr-1" />
                    <span className="text-sm">{listing.location}</span>
                  </div>

                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      <Star size={16} className="text-yellow-500 fill-current mr-1" />
                      <span className="text-sm font-medium">{listing.rating}</span>
                      <span className="text-sm text-gray-500 ml-1">
                        ({listing.reviews} reviews)
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {listing.amenities.slice(0, 3).map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                      >
                        {amenityIcons[amenity]}
                        <span className="ml-1">{amenity}</span>
                      </div>
                    ))}
                    {listing.amenities.length > 3 && (
                      <div className="text-xs text-gray-500 px-2 py-1">
                        +{listing.amenities.length - 3} more
                      </div>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      // TODO: Navigate to listing detail
                      console.log('View listing:', listing.id);
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-12"
        >
          <Button size="lg">
            View All Properties
          </Button>
        </motion.div>
      </div>
    </section>
  );
};
