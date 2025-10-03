'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AuthGuard, useAuth, usePermission, useRoleLevel } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PackageFormModal } from '@/components/admin/PackageFormModal';
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
  Clock,
  Users,
  DollarSign,
  Crown
} from 'lucide-react';
import { Package, PackageService } from '@/lib/services/packages';
import { PackageCategory, CurrencyEnum } from '@/lib/supabase';
import { cn } from '@/utils/cn';

interface PackageListState {
  packages: Package[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

const categories = [
  'All Categories',
  'adventure',
  'cultural',
  'luxury',
  'beach',
  'city',
  'nature',
];

const currencies = [
  { value: 'USD', label: 'USD' },
  { value: 'NGN', label: 'NGN' },
  { value: 'EUR', label: 'EUR' },
  { value: 'GBP', label: 'GBP' },
];

const sortOptions = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc', label: 'Oldest First' },
  { value: 'title-asc', label: 'Name A-Z' },
  { value: 'title-desc', label: 'Name Z-A' },
  { value: 'base_price-asc', label: 'Price: Low to High' },
  { value: 'base_price-desc', label: 'Price: High to Low' },
  { value: 'avg_rating-desc', label: 'Highest Rated' },
];

function PackagesAdmin() {
  const { user } = useAuth();
  const { hasPermission: canCreate } = usePermission('packages', 'create');
  const { hasPermission: canUpdate } = usePermission('packages', 'update');
  const { hasPermission: canDelete } = usePermission('packages', 'delete');
  const { roleLevel } = useRoleLevel();

  const [state, setState] = useState<PackageListState>({
    packages: [],
    isLoading: true,
    error: null,
    totalCount: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
    status: 'all',
    currency: 'all',
    sort: 'created_at-desc',
  });

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchPackages = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sessionToken = localStorage.getItem('admin_session_token');
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.category !== 'All Categories') params.set('category', filters.category);
      if (filters.status !== 'all') params.set('is_published', filters.status === 'published' ? 'true' : 'false');
      if (filters.currency !== 'all') params.set('currency', filters.currency);
      
      const [sortBy, sortOrder] = filters.sort.split('-');
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);
      params.set('limit', '50');

      const response = await fetch(`/api/admin/packages?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch packages');
      }

      setState(prev => ({
        ...prev,
        packages: result.data || [],
        isLoading: false,
        totalCount: result.pagination?.total || 0,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch packages',
      }));
    }
  }, [filters]);

  useEffect(() => {
    fetchPackages();
  }, [fetchPackages]);

  const handleCreatePackage = () => {
    setSelectedPackage(null);
    setIsCreating(true);
    setShowFormModal(true);
  };

  const handleEditPackage = (package_: Package) => {
    setSelectedPackage(package_);
    setIsCreating(false);
    setShowFormModal(true);
  };

  const handleDeletePackage = async (package_: Package) => {
    if (!canDelete) {
      alert('You do not have permission to delete packages');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${package_.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/packages/${package_.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete package');
      }

      // Refresh the list
      await fetchPackages();
    } catch (error: any) {
      alert(error.message || 'Failed to delete package');
    }
  };

  const handleToggleStatus = async (package_: Package) => {
    if (!canUpdate) {
      alert('You do not have permission to update packages');
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/packages/${package_.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_published: !package_.is_published,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update package');
      }

      // Refresh the list
      await fetchPackages();
    } catch (error: any) {
      alert(error.message || 'Failed to update package');
    }
  };

  const handleFormSubmit = async () => {
    setShowFormModal(false);
    await fetchPackages();
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDuration = (days: number | null) => {
    if (!days) return 'N/A';
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Packages</h1>
              <p className="mt-1 text-sm text-gray-500">
                Create, edit, and manage travel packages
              </p>
            </div>
            {canCreate && (
              <Button onClick={handleCreatePackage} leftIcon={<Plus size={20} />}>
                Add Package
              </Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <Input
                placeholder="Search packages..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                leftIcon={<Search size={16} />}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <Select
                options={categories.map(cat => ({ value: cat, label: cat }))}
                value={filters.category}
                onChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <Select
                options={[
                  { value: 'all', label: 'All' },
                  { value: 'published', label: 'Published' },
                  { value: 'unpublished', label: 'Unpublished' },
                ]}
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <Select
                options={[
                  { value: 'all', label: 'All' },
                  ...currencies,
                ]}
                value={filters.currency}
                onChange={(value) => setFilters(prev => ({ ...prev, currency: value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <Select
                options={sortOptions}
                value={filters.sort}
                onChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}
              />
            </div>
          </div>
        </Card>

        {/* Results */}
        {state.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="p-6 animate-pulse">
                <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4 w-3/4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </Card>
            ))}
          </div>
        ) : state.error ? (
          <Card className="p-6 text-center">
            <div className="text-red-600 text-lg mb-4">{state.error}</div>
            <Button onClick={fetchPackages}>Try Again</Button>
          </Card>
        ) : state.packages.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="text-gray-500 text-lg mb-4">No packages found</div>
            {canCreate && (
              <Button onClick={handleCreatePackage}>Create First Package</Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {state.packages.map((package_) => (
              <Card key={package_.id} className="p-6 hover:shadow-md transition-shadow">
                {/* Image */}
                <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {(package_ as any).destinations?.image_cover_url ? (
                    <Image
                      src={(package_ as any).destinations.image_cover_url}
                      alt={package_.title}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <MapPin size={48} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {package_.title}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      {package_.featured && (
                        <Star size={16} className="text-yellow-500 fill-current" />
                      )}
                      {package_.luxury_certified && (
                        <Crown size={16} className="text-purple-500" />
                      )}
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        package_.is_published ? 'bg-green-500' : 'bg-red-500'
                      )} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {package_.summary || package_.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {(package_ as any).destinations?.name || 'Unknown'}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(package_.duration_days)}
                    </div>
                    {package_.group_size_limit && (
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        {package_.group_size_limit}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(package_.base_price, package_.currency)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(package_)}
                      title={package_.is_published ? 'Unpublish' : 'Publish'}
                    >
                      {package_.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                    </Button>
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditPackage(package_)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePackage(package_)}
                        title="Delete"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Form Modal */}
        {showFormModal && (
          <PackageFormModal
            package_={selectedPackage}
            isOpen={showFormModal}
            onClose={() => setShowFormModal(false)}
            onSubmit={handleFormSubmit}
            isCreating={isCreating}
          />
        )}
    </div>
  );
}

export default function PackagesAdminPage() {
  return <PackagesAdmin />;
}
