'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { ExperienceCard } from '@/components/ui/ExperienceCard';
import { ExperienceCardSkeleton } from '@/components/ui/ExperienceCardSkeleton';
import { ExperienceDetailModal } from '@/components/modals/ExperienceDetailModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import { Search, Filter, MapPin, Star, Clock, Users } from 'lucide-react';
import { ExperienceService, Experience, ExperienceFilters } from '@/lib/services/experiences';
import { motion } from 'framer-motion';

interface ExperienceListState {
  experiences: Experience[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
}

const categories = [
  'All experiences',
  'Nightlife',
  'Culture',
  'Beach resort',
  'Culinary',
  'Art & Fashion',
  'Adventure',
  'Wellness',
];

const sortOptions = [
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'created-desc', label: 'Newest First' },
  { value: 'title-asc', label: 'Name A-Z' },
];

function ExperienceListContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<ExperienceListState>({
    experiences: [],
    isLoading: true,
    error: null,
    hasMore: true,
    currentPage: 1,
    totalCount: 0,
  });

  const [filters, setFilters] = useState<ExperienceFilters>({
    category: searchParams.get('category') || undefined,
    location: searchParams.get('location') || undefined,
    minPrice: searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined,
    maxPrice: searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
  });

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'rating-desc');
  const [selectedCategory, setSelectedCategory] = useState(filters.category || 'All experiences');
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Parse sort option
  const getSortOptions = (sortValue: string) => {
    const [field, order] = sortValue.split('-');
    return {
      field: field as 'created_at' | 'rating' | 'price_per_person' | 'title',
      order: order as 'asc' | 'desc',
    };
  };

  // Fetch experiences
  const fetchExperiences = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sortOptions = getSortOptions(sortBy);
      const { data, error } = await ExperienceService.getExperiences(
        filters,
        sortOptions,
        12 // Limit per page
      );

      if (error) {
        throw new Error(error);
      }

      setState(prev => ({
        ...prev,
        experiences: reset ? data || [] : [...prev.experiences, ...(data || [])],
        isLoading: false,
        hasMore: (data || []).length === 12,
        currentPage: page,
        totalCount: data?.length || 0,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch experiences',
      }));
    }
  }, [filters, sortBy]);

  // Load more experiences
  const loadMore = () => {
    if (!state.isLoading && state.hasMore) {
      fetchExperiences(state.currentPage + 1, false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      setFilters(prev => ({ ...prev, location: searchTerm.trim() }));
    }
    fetchExperiences(1, true);
  };

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newFilters = {
      ...filters,
      category: category === 'All experiences' ? undefined : category,
    };
    setFilters(newFilters);
    fetchExperiences(1, true);
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    fetchExperiences(1, true);
  };

  // Handle experience click
  const handleExperienceClick = (experience: Experience) => {
    setSelectedExperience(experience);
  };

  // Initial load
  useEffect(() => {
    fetchExperiences(1, true);
  }, [fetchExperiences]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.location) params.set('location', filters.location);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating) params.set('minRating', filters.minRating.toString());
    if (searchTerm) params.set('search', searchTerm);
    if (sortBy) params.set('sort', sortBy);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [filters, searchTerm, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-4">
              Discover Experiences
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Explore handpicked adventures, cultural immersions, and luxury escapes across Nigeria.
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search experiences, locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  leftIcon={<Search size={20} className="text-gray-400" />}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} className="px-8">
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

            {/* Category Filter */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <CategoryFilter
                categories={categories}
                activeCategory={selectedCategory}
                onCategoryChange={handleCategoryChange}
                className="justify-center flex-wrap"
              />
            </div>

            {/* Results Count and Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                {state.totalCount} experiences found
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Sort by:</span>
                <Select
                  options={sortOptions}
                  value={sortBy}
                  onChange={handleSortChange}
                  className="w-44"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-8">
        {state.isLoading && state.experiences.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <ExperienceCardSkeleton key={index} />
            ))}
          </div>
        ) : state.error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{state.error}</div>
            <Button onClick={() => fetchExperiences(1, true)}>
              Try Again
            </Button>
          </div>
        ) : state.experiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No experiences found</div>
            <Button onClick={() => fetchExperiences(1, true)}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {state.experiences.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <ExperienceCard
                    experience={experience}
                    onViewDetails={() => handleExperienceClick(experience)}
                    onBookNow={() => console.log('Book now:', experience.id)}
                    onToggleFavorite={() => console.log('Toggle favorite:', experience.id)}
                    onShare={() => console.log('Share:', experience.id)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Load More Button */}
            {state.hasMore && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-center mt-12"
              >
                <Button
                  variant="outline"
                  size="lg"
                  onClick={loadMore}
                  disabled={state.isLoading}
                  className="px-8 py-4"
                >
                  {state.isLoading ? 'Loading...' : 'Load More Experiences'}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Experience Detail Modal */}
      {selectedExperience && (
        <ExperienceDetailModal
          experience={selectedExperience}
          isOpen={!!selectedExperience}
          onClose={() => setSelectedExperience(null)}
        />
      )}
    </div>
  );
}

export default function ExperiencesPage() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      }>
        <ExperienceListContent />
      </Suspense>
    </Layout>
  );
}
