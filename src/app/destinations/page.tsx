/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Layout } from '@/components/layout/Layout';
import { DestinationCard } from '@/components/ui/DestinationCard';
import { DestinationCardSkeleton } from '@/components/ui/DestinationCardSkeleton';
import { DestinationDetailModal } from '@/components/modals/DestinationDetailModal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CategoryFilter } from '@/components/ui/CategoryFilter';
import {
  Search,
  Filter,
  MapPin,
  Globe,
  Calendar,
  Thermometer,
} from 'lucide-react';
import {
  DestinationService,
  Destination,
  DestinationFilters,
} from '@/lib/services/destinations';
import { motion } from 'framer-motion';

interface DestinationListState {
  destinations: Destination[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
}

const countries = [
  'All destinations',
  'Nigeria',
  'Ghana',
  'South Africa',
  'Kenya',
  'Morocco',
  'Egypt',
  'Tanzania',
];

const sortOptions = [
  { value: 'title-asc', label: 'Name A-Z' },
  { value: 'title-desc', label: 'Name Z-A' },
  { value: 'location-asc', label: 'Location A-Z' },
  { value: 'created-desc', label: 'Newest First' },
];

function DestinationListContent() {
  const searchParams = useSearchParams();
  const [state, setState] = useState<DestinationListState>({
    destinations: [],
    isLoading: true,
    error: null,
    hasMore: true,
    currentPage: 1,
    totalCount: 0,
  });

  const [filters, setFilters] = useState<DestinationFilters>({
    country: searchParams.get('country') || undefined,
    location: searchParams.get('location') || undefined,
    isFeatured: searchParams.get('featured') === 'true' ? true : undefined,
  });

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get('search') || ''
  );
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'title-asc');
  const [selectedCountry, setSelectedCountry] = useState(
    filters.country || 'All destinations'
  );
  const [selectedDestination, setSelectedDestination] =
    useState<Destination | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Parse sort option
  const getSortOptions = (sortValue: string) => {
    const [field, order] = sortValue.split('-');
    return {
      field: field as 'created_at' | 'title' | 'location',
      order: order as 'asc' | 'desc',
    };
  };

  // Fetch destinations
  const fetchDestinations = async (
    page: number = 1,
    reset: boolean = false
  ) => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const sortOptions = getSortOptions(sortBy);
      const { data, error } = await DestinationService.getDestinations(
        filters,
        sortOptions,
        12 // Limit per page
      );

      if (error) {
        throw new Error(error);
      }

      setState((prev) => ({
        ...prev,
        destinations: reset
          ? data || []
          : [...prev.destinations, ...(data || [])],
        isLoading: false,
        hasMore: (data || []).length === 12,
        currentPage: page,
        totalCount: data?.length || 0,
      }));
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch destinations',
      }));
    }
  };

  // Load more destinations
  const loadMore = () => {
    if (!state.isLoading && state.hasMore) {
      fetchDestinations(state.currentPage + 1, false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchTerm.trim()) {
      setFilters((prev) => ({ ...prev, location: searchTerm.trim() }));
    }
    fetchDestinations(1, true);
  };

  // Handle country filter
  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    const newFilters = {
      ...filters,
      country: country === 'All destinations' ? undefined : country,
    };
    setFilters(newFilters);
    fetchDestinations(1, true);
  };

  // Handle sort change
  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    fetchDestinations(1, true);
  };

  // Handle destination click
  const handleDestinationClick = (destination: Destination) => {
    setSelectedDestination(destination);
  };

  // Initial load
  useEffect(() => {
    fetchDestinations(1, true);
  }, []);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.country) params.set('country', filters.country);
    if (filters.location) params.set('location', filters.location);
    if (filters.isFeatured) params.set('featured', 'true');
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
              Explore Destinations
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover amazing places to visit and unique experiences across
              Africa.
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
                  placeholder="Search destinations, countries..."
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

            {/* Country Filter */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <CategoryFilter
                categories={countries}
                activeCategory={selectedCountry}
                onCategoryChange={handleCountryChange}
                className="justify-center flex-wrap"
              />
            </div>

            {/* Results Count and Sort */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-sm text-gray-600 font-medium">
                {state.totalCount} destinations found
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
        {state.isLoading && state.destinations.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, index) => (
              <DestinationCardSkeleton key={index} />
            ))}
          </div>
        ) : state.error ? (
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">{state.error}</div>
            <Button onClick={() => fetchDestinations(1, true)}>
              Try Again
            </Button>
          </div>
        ) : state.destinations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">
              No destinations found
            </div>
            <Button onClick={() => fetchDestinations(1, true)}>
              Reset Filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {state.destinations.map((destination, index) => (
                <motion.div
                  key={destination.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <DestinationCard
                    destination={destination}
                    onViewDetails={() => handleDestinationClick(destination)}
                    onExplore={() => console.log('Explore:', destination.id)}
                    onToggleFavorite={() =>
                      console.log('Toggle favorite:', destination.id)
                    }
                    onShare={() => console.log('Share:', destination.id)}
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
                  {state.isLoading ? 'Loading...' : 'Load More Destinations'}
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Destination Detail Modal */}
      {selectedDestination && (
        <DestinationDetailModal
          destination={selectedDestination}
          isOpen={!!selectedDestination}
          onClose={() => setSelectedDestination(null)}
        />
      )}
    </div>
  );
}

export default function DestinationsPage() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        }
      >
        <DestinationListContent />
      </Suspense>
    </Layout>
  );
}
