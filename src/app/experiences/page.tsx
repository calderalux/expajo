/* eslint-disable react-hooks/exhaustive-deps */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
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
import {
  ExperienceService,
  Experience,
  ExperienceFilters,
} from '@/lib/services/experiences';
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
    minPrice: searchParams.get('minPrice')
      ? parseInt(searchParams.get('minPrice')!)
      : undefined,
    maxPrice: searchParams.get('maxPrice')
      ? parseInt(searchParams.get('maxPrice')!)
      : undefined,
    minRating: searchParams.get('minRating')
      ? parseFloat(searchParams.get('minRating')!)
      : undefined,
  });

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [sortBy, setSortBy] = useState(
    searchParams.get('sort') || 'rating-desc'
  );
  const [selectedCategory, setSelectedCategory] = useState(
    filters.category || 'All experiences'
  );
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Parse sort option
  const getSortOptions = (sortValue: string) => {
    const [field, order] = sortValue.split('-');
    return {
      field: field as 'created_at' | 'rating' | 'price_per_person' | 'title',
      order: order as 'asc' | 'desc',
    };
  };

  // Mock data for fallback
  const mockExperiences = [
    {
      id: '1',
      title: 'Lagos VIP Nightlife Experience',
      description:
        "Exclusive access to Lagos' most prestigious clubs and lounges with personal security and luxury transportation.",
      location: 'Victoria Island, Lagos',
      price_per_person: 1200,
      rating: 4.9,
      reviews_count: 192,
      image_urls: [
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop',
      ],
      features: ['VIP Access', 'Security included', 'Luxury transportation'],
      duration_hours: 8,
      max_capacity: 8,
      category: 'Nightlife',
      is_featured: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      title: 'Abuja Cultural Heritage Journey',
      description:
        "Private guided exploration of Nigeria's capital with visits to cultural centers, art galleries, and traditional villages.",
      location: 'Federal Capital Territory',
      price_per_person: 1200,
      rating: 4.8,
      reviews_count: 156,
      image_urls: [
        'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=400&fit=crop',
      ],
      features: ['VIP Access', 'Security included', 'Private guide'],
      duration_hours: 8,
      max_capacity: 8,
      category: 'Culture',
      is_featured: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      title: 'Calabar Beach Resort Luxury Escape',
      description:
        'Exclusive beachfront accommodations with private chef services, water sports, and spa treatments.',
      location: 'Calabar, Cross River State',
      price_per_person: 1200,
      rating: 4.9,
      reviews_count: 203,
      image_urls: [
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=400&fit=crop',
      ],
      features: ['VIP Access', 'Security included', 'Private chef'],
      duration_hours: 8,
      max_capacity: 8,
      category: 'Beach resort',
      is_featured: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '4',
      title: 'Private Chef Culinary Journey',
      description:
        'Authentic Nigerian cuisine prepared by renowned chefs with cooking classes and wine pairings.',
      location: 'Lagos & Abuja',
      price_per_person: 1200,
      rating: 4.7,
      reviews_count: 134,
      image_urls: [
        'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop',
      ],
      features: ['VIP Access', 'Security included', 'Cooking classes'],
      duration_hours: 8,
      max_capacity: 8,
      category: 'Culinary',
      is_featured: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '5',
      title: 'Luxury Safari Adventure',
      description:
        "Exclusive wildlife experience in Nigeria's premier game reserves with luxury camping and expert guides.",
      location: 'Yankari Game Reserve',
      price_per_person: 1200,
      rating: 4.8,
      reviews_count: 178,
      image_urls: [
        'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=400&fit=crop',
      ],
      features: ['VIP Access', 'Security included', 'Expert guides'],
      duration_hours: 8,
      max_capacity: 8,
      category: 'Adventure',
      is_featured: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '6',
      title: 'Exclusive Art & Fashion Tour',
      description:
        "Behind-the-scenes access to Nigeria's thriving art and fashion scene with private studio visits.",
      location: 'Lagos',
      price_per_person: 1200,
      rating: 4.6,
      reviews_count: 145,
      image_urls: [
        'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=400&fit=crop',
      ],
      features: ['VIP Access', 'Security included', 'Studio visits'],
      duration_hours: 8,
      max_capacity: 8,
      category: 'Art & Fashion',
      is_featured: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '7',
      title: 'Luxury Wellness Retreat',
      description:
        'Premium spa and wellness experience with personalized treatments, meditation sessions, and healthy cuisine.',
      location: 'Abuja',
      price_per_person: 1500,
      rating: 4.8,
      reviews_count: 98,
      image_urls: [
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&h=400&fit=crop',
      ],
      features: ['VIP Access', 'Security included', 'Personalized treatments'],
      duration_hours: 12,
      max_capacity: 6,
      category: 'Wellness',
      is_featured: true,
      is_active: true,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  // Fetch experiences
  const fetchExperiences = async (page: number = 1, reset: boolean = false) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseKey) {
        // Use mock data if Supabase is not configured
        console.log('Supabase not configured, using mock data');
        const filteredData = mockExperiences.filter((exp) => {
          if (filters.category && exp.category !== filters.category)
            return false;
          if (
            filters.location &&
            !exp.location.toLowerCase().includes(filters.location.toLowerCase())
          )
            return false;
          if (filters.minPrice && exp.price_per_person < filters.minPrice)
            return false;
          if (filters.maxPrice && exp.price_per_person > filters.maxPrice)
            return false;
          if (filters.minRating && exp.rating < filters.minRating) return false;
          return true;
        });

        // Apply sorting
        const sortedData = [...filteredData].sort((a, b) => {
          const { field, order } = getSortOptions(sortBy);
          let aVal = a[field as keyof typeof a];
          let bVal = b[field as keyof typeof b];

          if (typeof aVal === 'string') aVal = aVal.toLowerCase();
          if (typeof bVal === 'string') bVal = bVal.toLowerCase();

          if (order === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
          }
        });

        setState((prev) => ({
          ...prev,
          experiences: reset
            ? sortedData
            : [...prev.experiences, ...sortedData],
          isLoading: false,
          hasMore: false, // Mock data is limited
          currentPage: page,
          totalCount: sortedData.length,
        }));
        return;
      }

      const sortOptions = getSortOptions(sortBy);
      const { data, error } = await ExperienceService.getExperiences(
        filters,
        sortOptions,
        12 // Limit per page
      );

      if (error) {
        throw new Error(error);
      }

      setState((prev) => ({
        ...prev,
        experiences: reset
          ? data || []
          : [...prev.experiences, ...(data || [])],
        isLoading: false,
        hasMore: (data || []).length === 12,
        currentPage: page,
        totalCount: data?.length || 0,
      }));
    } catch (err: any) {
      console.error('Error fetching experiences:', err);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch experiences',
      }));
    }
  };

  // Load more experiences
  const loadMore = () => {
    if (!state.isLoading && state.hasMore) {
      fetchExperiences(state.currentPage + 1, false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      setFilters((prev) => ({ ...prev, location: searchTerm.trim() }));
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
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.category) params.set('category', filters.category);
    if (filters.location) params.set('location', filters.location);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.minRating)
      params.set('minRating', filters.minRating.toString());
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
              Explore handpicked adventures, cultural immersions, and luxury
              escapes across Nigeria.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {[...Array(6)].map((_, index) => (
              <ExperienceCardSkeleton key={index} />
            ))}
          </div>
        ) : state.error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{state.error}</div>
            <Button onClick={() => fetchExperiences(1, true)}>Try Again</Button>
          </div>
        ) : state.experiences.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No experiences found
            </div>
            <Button onClick={() => fetchExperiences(1, true)}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
              {state.experiences.map((experience, index) => (
                <motion.div
                  key={experience.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="h-full"
                >
                  <ExperienceCard
                    experience={experience}
                    onViewDetails={() => handleExperienceClick(experience)}
                    onBookNow={() => console.log('Book now:', experience.id)}
                    onToggleFavorite={() =>
                      console.log('Toggle favorite:', experience.id)
                    }
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
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <ExperienceListContent />
      </Suspense>
    </Layout>
  );
}
