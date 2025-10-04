'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Luggage } from 'lucide-react';
import { TrustIndicator } from '@/components/ui/TrustIndicator';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { Select } from '@/components/ui/Select';

const categories = [
  'All experiences',
  'Nightlife',
  'Culture',
  'Beach resort',
  'Culinary',
  'Art & Fashion',
];

const sortOptions = [
  { value: 'most-popular', label: 'Most popular' },
  { value: 'price-low-high', label: 'Price: Low to High' },
  { value: 'price-high-low', label: 'Price: High to Low' },
  { value: 'rating', label: 'Rating' },
  { value: 'newest', label: 'Newest' },
];

export const HeroSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All experiences');
  const [sortBy, setSortBy] = useState('most-popular');

  return (
    <section className="bg-white py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          {/* Main Heading */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair text-gray-900 mb-6 leading-tight">
              Curated Nigerian
              <span className="block">Experiences</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              From vibrant nightlife to cultural immersion, discover handpicked
              experiences that showcase the best of Nigeria with luxury and
              safety guaranteed.
            </p>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-wrap justify-center items-center gap-6 mb-16"
          >
            <TrustIndicator
              icon={Star}
              value="4.9 from 2,000+ reviews"
              label=""
            />
            <TrustIndicator
              icon={Users}
              value="Trusted by 10,000+ travelers"
              label=""
            />
            <TrustIndicator
              icon={Luggage}
              value="200+ curated experiences"
              label=""
              isLast={true}
            />
          </motion.div>

          {/* Category Filters and Sort */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-gray-50 rounded-2xl p-6"
          >
            {/* Single row layout: Category filters on left, results/sort on right */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Left Side: Category Filters */}
              <div className="flex-1 min-w-0">
                <CategoryFilter
                  categories={categories}
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                  className="justify-start flex-wrap lg:flex-nowrap overflow-x-auto scrollbar-hide"
                />
              </div>

              {/* Right Side: Results count and Sort dropdown */}
              <div className="flex items-center gap-4 flex-shrink-0">
                {/* Results Count */}
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">
                  6 experiences found
                </div>

                {/* Sort Dropdown */}
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={setSortBy}
                  className="w-40"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
