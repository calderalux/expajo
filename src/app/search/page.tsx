'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { Search, MapPin, Calendar, Users, Filter, Star } from 'lucide-react';
import Image from 'next/image';

interface SearchFilters {
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  guests: number;
  priceMin: number;
  priceMax: number;
}

interface Listing {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
}

const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Modern Downtown Apartment',
    location: 'New York, NY',
    price: 120,
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500&h=300&fit=crop',
    amenities: ['Wifi', 'Parking', 'Gym'],
  },
  {
    id: '2',
    title: 'Cozy Beach House',
    location: 'Miami, FL',
    price: 200,
    rating: 4.8,
    reviews: 95,
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=300&fit=crop',
    amenities: ['Wifi', 'Beach Access', 'Pool'],
  },
  {
    id: '3',
    title: 'Mountain Cabin Retreat',
    location: 'Aspen, CO',
    price: 180,
    rating: 4.9,
    reviews: 76,
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=500&h=300&fit=crop',
    amenities: ['Wifi', 'Fireplace', 'Hiking'],
  },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<SearchFilters>({
    location: searchParams.get('location') || '',
    startDate: null,
    endDate: null,
    guests: 1,
    priceMin: 0,
    priceMax: 1000,
  });
  const [listings, setListings] = useState<Listing[]>(mockListings);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    // TODO: Implement actual search with Supabase
    console.log('Searching with filters:', filters);
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <Input
                label="Where"
                placeholder="Search destinations"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                leftIcon={<MapPin size={20} className="text-gray-400" />}
              />
            </div>
            <div className="md:col-span-1">
              <DateRangePicker
                label="When"
                placeholder="Select dates"
                value={[filters.startDate, filters.endDate]}
                onChange={([start, end]) => {
                  handleFilterChange('startDate', start);
                  handleFilterChange('endDate', end);
                }}
              />
            </div>
            <div className="md:col-span-1">
              <Input
                label="Guests"
                placeholder="How many?"
                type="number"
                value={filters.guests}
                onChange={(e) => handleFilterChange('guests', parseInt(e.target.value))}
                leftIcon={<Users size={20} className="text-gray-400" />}
              />
            </div>
            <div className="md:col-span-1 flex items-end gap-2">
              <Button onClick={handleSearch} className="flex-1" leftIcon={<Search size={20} />}>
                Search
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                leftIcon={<Filter size={20} />}
              >
                Filters
              </Button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Price Range</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Min price"
                      type="number"
                      value={filters.priceMin}
                      onChange={(e) => handleFilterChange('priceMin', parseInt(e.target.value))}
                    />
                    <Input
                      placeholder="Max price"
                      type="number"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold font-playfair">
            {listings.length} properties found
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select className="border border-gray-300 rounded-lg px-3 py-2">
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Rating</option>
              <option>Newest</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Card key={listing.id} hover className="overflow-hidden">
              <div className="relative h-48 w-full">
                <Image
                  src={listing.image}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2">
                  <Star size={16} className="text-yellow-500 fill-current" />
                </div>
              </div>
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
                      className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
                    >
                      {amenity}
                    </div>
                  ))}
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
          ))}
        </div>
      </div>
    </div>
  );
}
