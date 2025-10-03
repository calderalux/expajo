'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AuthGuard, useAuth } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { DestinationFormModal } from '@/components/forms/DestinationFormModal';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  MapPin,
  Globe,
  Calendar,
  Thermometer,
  Heart
} from 'lucide-react';
import { Destination, DestinationService } from '@/lib/services/destinations';
import { cn } from '@/utils/cn';

interface DestinationListState {
  destinations: Destination[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
  totalCount: number;
}

interface DestinationFilters {
  search?: string;
  country?: string;
  region?: string;
  featured?: boolean;
  isPublished?: boolean;
}

const sortOptions = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'rating-desc', label: 'Highest Rated' },
  { value: 'rating-asc', label: 'Lowest Rated' },
  { value: 'created-desc', label: 'Newest First' },
  { value: 'created-asc', label: 'Oldest First' },
];

const countryOptions = [
  'All Countries',
  'Nigeria',
  'Ghana',
  'South Africa',
  'Kenya',
  'Morocco',
  'Egypt',
  'Tanzania',
];

function AdminDestinationsContent() {
  const { user } = useAuth();

  const [state, setState] = useState<DestinationListState>({
    destinations: [],
    isLoading: true,
    error: null,
    hasMore: true,
    currentPage: 1,
    totalCount: 0,
  });

  const [filters, setFilters] = useState<DestinationFilters>({
    search: '',
    country: 'All Countries',
    region: '',
    featured: undefined,
    isPublished: undefined,
  });

  const [sortBy, setSortBy] = useState('name-asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);

  // Fetch destinations
  const fetchDestinations = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sessionToken = localStorage.getItem('admin_session_token');
      const sortOptions = getSortOptions(sortBy);
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.search) {
        params.append('search', filters.search);
      }
      if (filters.country && filters.country !== 'All Countries') {
        params.append('country', filters.country);
      }
      if (filters.region) {
        params.append('region', filters.region);
      }
      if (filters.featured !== undefined) {
        params.append('featured', filters.featured.toString());
      }
      if (filters.isPublished !== undefined) {
        params.append('published', filters.isPublished.toString());
      }
      params.append('limit', '12');
      params.append('offset', ((page - 1) * 12).toString());
      params.append('sortField', sortOptions.field);
      params.append('sortOrder', sortOptions.order);

      const response = await fetch(`/api/admin/destinations?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch destinations');
      }

      const data = result.data || [];

      setState(prev => ({
        ...prev,
        destinations: reset ? data : [...prev.destinations, ...data],
        isLoading: false,
        hasMore: result.pagination?.hasMore || false,
        currentPage: page,
        totalCount: result.pagination?.total || 0,
      }));
    } catch (err: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: err.message || 'Failed to fetch destinations',
      }));
    }
  }, [filters, sortBy]);

  const getSortOptions = (sort: string) => {
    switch (sort) {
      case 'name-asc':
        return { field: 'name', order: 'asc' };
      case 'name-desc':
        return { field: 'name', order: 'desc' };
      case 'rating-desc':
        return { field: 'avg_rating', order: 'desc' };
      case 'rating-asc':
        return { field: 'avg_rating', order: 'asc' };
      case 'created-desc':
        return { field: 'created_at', order: 'desc' };
      case 'created-asc':
        return { field: 'created_at', order: 'asc' };
      default:
        return { field: 'name', order: 'asc' };
    }
  };

  // Load more destinations
  const loadMore = () => {
    if (!state.isLoading && state.hasMore) {
      fetchDestinations(state.currentPage + 1, false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    setShowFilters(false);
    fetchDestinations(1, true);
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      search: '',
      country: 'All Countries',
      region: '',
      featured: undefined,
      isPublished: undefined,
    });
    setSortBy('name-asc');
  };

  // Toggle destination published status
  const togglePublished = async (destination: Destination) => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/destinations/${destination.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_published: !destination.is_published,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update the destination in the list
        setState(prev => ({
          ...prev,
          destinations: prev.destinations.map(dest =>
            dest.id === destination.id
              ? { ...dest, is_published: !dest.is_published }
              : dest
          ),
        }));
      } else {
        console.error('Failed to toggle published status:', result.error);
      }
    } catch (error) {
      console.error('Error toggling published status:', error);
    }
  };

  // Delete destination
  const deleteDestination = async (destination: Destination) => {
    if (!confirm(`Are you sure you want to delete "${destination.name}"?`)) {
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/destinations/${destination.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        // Remove the destination from the list
        setState(prev => ({
          ...prev,
          destinations: prev.destinations.filter(dest => dest.id !== destination.id),
          totalCount: prev.totalCount - 1,
        }));
      } else {
        console.error('Failed to delete destination:', result.error);
      }
    } catch (error) {
      console.error('Error deleting destination:', error);
    }
  };


  // Initial load
  useEffect(() => {
    fetchDestinations(1, true);
  }, [fetchDestinations]);

  // Check permissions - for now, allow all operations for admin users
  const canCreate = user?.is_admin || false;
  const canUpdate = user?.is_admin || false;
  const canDelete = user?.is_admin || false;

  if (state.isLoading && state.destinations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading destinations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Destinations</h1>
              <p className="text-gray-600 mt-2">
                Manage your travel destinations ({state.totalCount} total)
              </p>
            </div>
            {canCreate && (
              <Button
                onClick={() => {
                  setEditingDestination(null);
                  setShowFormModal(true);
                }}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Destination
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <Input
                  placeholder="Search destinations..."
                  value={filters.search || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full"
                />
              </div>
              
              <Select
                value={filters.country || 'All Countries'}
                onChange={(value) => setFilters(prev => ({ ...prev, country: value }))}
                options={countryOptions.map(country => ({ value: country, label: country }))}
                className="min-w-40"
              />

              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>

              <Button
                variant="outline"
                onClick={applyFilters}
                className="flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Search
              </Button>

              <Button
                variant="outline"
                onClick={clearFilters}
                className="text-gray-500"
              >
                Clear
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region
                    </label>
                    <Input
                      placeholder="Enter region..."
                      value={filters.region || ''}
                      onChange={(e) => setFilters(prev => ({ ...prev, region: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <Select
                      value={filters.isPublished === undefined ? 'all' : filters.isPublished.toString()}
                      onChange={(value) => setFilters(prev => ({ 
                        ...prev, 
                        isPublished: value === 'all' ? undefined : value === 'true'
                      }))}
                      options={[
                        { value: 'all', label: 'All Status' },
                        { value: 'true', label: 'Published' },
                        { value: 'false', label: 'Draft' },
                      ]}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sort By
                    </label>
                    <Select
                      value={sortBy}
                      onChange={setSortBy}
                      options={sortOptions}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Error State */}
        {state.error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <div className="p-6">
              <p className="text-red-800">{state.error}</p>
            </div>
          </Card>
        )}

        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.destinations.map((destination) => (
            <Card key={destination.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48">
                <Image
                  src={destination.image_cover_url || '/placeholder-destination.jpg'}
                  alt={destination.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-4 right-4 flex gap-2">
                  {canUpdate && (
                    <button
                      onClick={() => togglePublished(destination)}
                      className={cn(
                        'p-2 rounded-full backdrop-blur-sm transition-colors',
                        destination.is_published
                          ? 'bg-green-500/90 text-white'
                          : 'bg-gray-500/90 text-white'
                      )}
                    >
                      {destination.is_published ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {destination.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {destination.country}
                      {destination.region && `, ${destination.region}`}
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    {destination.avg_rating?.toFixed(1) || '0.0'}
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {destination.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-1" />
                      {destination.review_count || 0}
                    </div>
                    <div className="flex items-center">
                      <Globe className="w-4 h-4 mr-1" />
                      {destination.package_count || 0}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {canUpdate && (
                      <button
                        onClick={() => {
                          setEditingDestination(destination);
                          setShowFormModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => deleteDestination(destination)}
                        className="p-2 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Load More */}
        {state.hasMore && (
          <div className="text-center mt-8">
            <Button
              onClick={loadMore}
              disabled={state.isLoading}
              variant="outline"
              className="min-w-32"
            >
              {state.isLoading ? 'Loading...' : 'Load More'}
            </Button>
          </div>
        )}

        {/* Empty State */}
        {state.destinations.length === 0 && !state.isLoading && (
          <Card className="text-center py-12">
            <div className="text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium mb-2">No destinations found</h3>
              <p className="mb-4">Try adjusting your search criteria or add a new destination.</p>
              {canCreate && (
                <Button
                  onClick={() => {
                    setEditingDestination(null);
                    setShowFormModal(true);
                  }}
                  className="flex items-center gap-2 mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Add Destination
                </Button>
              )}
            </div>
          </Card>
        )}

        {/* Form Modal */}
        {showFormModal && (
          <DestinationFormModal
            isOpen={showFormModal}
            mode={editingDestination ? 'edit' : 'create'}
            destination={editingDestination}
            onClose={() => {
              setShowFormModal(false);
              setEditingDestination(null);
            }}
            onSuccess={(destination) => {
              setShowFormModal(false);
              setEditingDestination(null);
              fetchDestinations(1, true); // Refresh the list
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function AdminDestinationsPage() {
  return (
    <AuthGuard>
      <AdminDestinationsContent />
    </AuthGuard>
  );
}
