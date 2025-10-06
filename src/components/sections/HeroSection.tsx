'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Users, Luggage } from 'lucide-react';
import { TrustIndicator } from '@/components/ui/TrustIndicator';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { Select } from '@/components/ui/Select';
import { serviceTypeToLabel } from '@/types/database';

const categories = [
  'All experiences',
  ...Object.values(serviceTypeToLabel),
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
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);

  // Fetch total experiences count
  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        setIsLoadingCount(true);
        const response = await fetch('/api/experiences/public?limit=1');
        const result = await response.json();

        if (result.success) {
          setTotalCount(result.pagination?.total || 0);
        }
      } catch (error) {
        console.error('Failed to fetch experiences count:', error);
        setTotalCount(0);
      } finally {
        setIsLoadingCount(false);
      }
    };

    fetchTotalCount();
  }, []);

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
            {/* Two row layout: Category filters on top, count/sort below */}
            <div className="flex flex-col lg:flex-row justify-between gap-4">
              {/* Top Row: Category Filters */}
              <div className="lg:w-2/3">
                <div className="overflow-x-auto scrollbar-hide">
                  <CategoryFilter
                    categories={categories}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                    className="justify-center gap-1 flex-wrap min-w-max"
                  />
                </div>
              </div>

              {/* Bottom Row: Results count and Sort dropdown */}
              <div className="flex items-center justify-center lg:justify-end gap-4">
                {/* Results Count */}
                <div className="text-sm text-gray-600 font-medium whitespace-nowrap">
                  {isLoadingCount ? (
                    <span className="animate-pulse">Loading...</span>
                  ) : (
                    `${totalCount} experiences found`
                  )}
                </div>

                <div>
                  {/* Sort Dropdown */}
                  <Select
                    options={sortOptions}
                    value={sortBy}
                    onChange={setSortBy}
                    className="w-40 rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
