'use client';

import React from 'react';
import { Search, MapPin, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DateRangePicker } from '@/components/ui/DateRangePicker';
import { motion } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [dateRange, setDateRange] = React.useState<[Date | null, Date | null]>([null, null]);

  const handleSearch = () => {
    // TODO: Implement search functionality
    console.log('Search:', { searchQuery, dateRange });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-50" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234362FF' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}
      />
      
      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-playfair text-gray-900 mb-6">
              Find Your Perfect
              <span className="block bg-gradient-primary bg-clip-text text-transparent">
                Short-Term Rental
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto">
              Discover amazing properties for your next adventure. Book with confidence and experience the best of every destination.
            </p>
          </motion.div>

          {/* Search Form */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Location Input */}
              <div className="md:col-span-1">
                <Input
                  label="Where"
                  placeholder="Search destinations"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<MapPin size={20} className="text-gray-400" />}
                />
              </div>

              {/* Date Range Picker */}
              <div className="md:col-span-1">
                <DateRangePicker
                  label="When"
                  placeholder="Select dates"
                  value={dateRange}
                  onChange={setDateRange}
                />
              </div>

              {/* Guests Input */}
              <div className="md:col-span-1">
                <Input
                  label="Guests"
                  placeholder="How many?"
                  type="number"
                  min="1"
                  max="20"
                />
              </div>

              {/* Search Button */}
              <div className="md:col-span-1 flex items-end">
                <Button
                  onClick={handleSearch}
                  className="w-full h-12 text-lg"
                  leftIcon={<Search size={20} />}
                >
                  Search
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-3xl mx-auto"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-gray-600">Properties Available</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">50K+</div>
              <div className="text-gray-600">Happy Guests</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">4.9★</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
