'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AuthGuard, useAuth, usePermission, useRoleLevel } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PackageFormModal } from '@/components/forms/PackageFormModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Star,
  MapPin,
  Clock,
  Users,
  DollarSign,
  CheckSquare
} from 'lucide-react';
import { Package } from '@/lib/services/packages';
import { PackageFilters } from '@/lib/validations/packages';

interface PackageListState {
  packages: Package[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

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

  const [filters, setFilters] = useState<PackageFilters>({
    search: '',
    category: undefined,
    featured: undefined,
    is_published: undefined,
    sort_by: 'created_at',
    sort_order: 'desc',
    limit: 50,
    offset: 0,
  });

  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedPackages, setSelectedPackages] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState<Package | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPackages = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sessionToken = localStorage.getItem('admin_session_token');
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);
      if (filters.featured !== undefined) params.set('featured', filters.featured.toString());
      if (filters.is_published !== undefined) params.set('is_published', filters.is_published.toString());
      params.set('sort_by', filters.sort_by);
      params.set('sort_order', filters.sort_order);
      params.set('limit', filters.limit.toString());
      params.set('offset', filters.offset.toString());

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

  const handleEditPackage = (packageData: Package) => {
    setSelectedPackage(packageData);
    setIsCreating(false);
    setShowFormModal(true);
  };

  const handleDeletePackage = (packageData: Package) => {
    if (!canDelete) {
      alert('You do not have permission to delete packages');
      return;
    }

    setPackageToDelete(packageData);
    setShowDeleteModal(true);
  };

  const confirmDeletePackage = async () => {
    if (!packageToDelete) return;

    setIsDeleting(true);
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/packages/${packageToDelete.id}`, {
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
      
      // Close modal
      setShowDeleteModal(false);
      setPackageToDelete(null);
    } catch (error: any) {
      alert(error.message || 'Failed to delete package');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (packageData: Package, field: 'featured' | 'is_published') => {
    if (!canUpdate) {
      alert('You do not have permission to update packages');
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/packages/${packageData.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          [field]: !packageData[field],
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

  const handleFormSuccess = async (packageData: Package) => {
    setShowFormModal(false);
    await fetchPackages();
  };

  const handleSelectPackage = (packageId: string) => {
    const newSelected = new Set(selectedPackages);
    if (newSelected.has(packageId)) {
      newSelected.delete(packageId);
    } else {
      newSelected.add(packageId);
    }
    setSelectedPackages(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedPackages.size === state.packages.length) {
      setSelectedPackages(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedPackages(new Set(state.packages.map(pkg => pkg.id)));
      setShowBulkActions(true);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
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
          <div className="flex gap-3">
            {/* Create Button */}
            {canCreate && (
              <Button onClick={handleCreatePackage} leftIcon={<Plus size={20} />}>
                Add Package
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">
                {selectedPackages.size} package(s) selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedPackages(new Set());
                  setShowBulkActions(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <Input
              placeholder="Search packages..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <Select
              options={[
                { value: '', label: 'All' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
              ]}
              value={filters.is_published === undefined ? '' : filters.is_published ? 'published' : 'draft'}
              onChange={(value) => setFilters(prev => ({ 
                ...prev, 
                is_published: value === '' ? undefined : value === 'published' 
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured
            </label>
            <Select
              options={[
                { value: '', label: 'All' },
                { value: 'true', label: 'Featured' },
                { value: 'false', label: 'Not Featured' },
              ]}
              value={filters.featured === undefined ? '' : filters.featured.toString()}
              onChange={(value) => setFilters(prev => ({ 
                ...prev, 
                featured: value === '' ? undefined : value === 'true' 
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <Select
              options={sortOptions}
              value={`${filters.sort_by}-${filters.sort_order}`}
              onChange={(value) => {
                const [sortBy, sortOrder] = value.split('-');
                setFilters(prev => ({ ...prev, sort_by: sortBy as any, sort_order: sortOrder as any }));
              }}
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
          {/* Select All Checkbox */}
          {state.packages.length > 0 && (
            <div className="col-span-full mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPackages.size === state.packages.length}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-medium text-gray-700">
                  Select All ({state.packages.length} packages)
                </span>
              </label>
            </div>
          )}
          
          {state.packages.map((packageData) => (
            <Card key={packageData.id} className="p-6 hover:shadow-md transition-shadow relative">
              {/* Selection Checkbox */}
              <div className="absolute top-4 left-4 z-10">
                <input
                  type="checkbox"
                  checked={selectedPackages.has(packageData.id)}
                  onChange={() => handleSelectPackage(packageData.id)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
              </div>

              {/* Content */}
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 pr-8">
                    {packageData.title}
                  </h3>
                  <div className="flex items-center gap-1 ml-2">
                    {packageData.featured && (
                      <Star size={16} className="text-yellow-500 fill-current" />
                    )}
                    <div className={`w-2 h-2 rounded-full ${
                      packageData.is_published ? 'bg-green-500' : 'bg-red-500'
                    }`} />
                  </div>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {packageData.summary || packageData.description || 'No description available'}
                </p>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDuration(packageData.duration_days)}
                  </div>
                  {packageData.group_size_limit && (
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {packageData.group_size_limit}
                    </div>
                  )}
                </div>
              </div>

              {/* Price and Actions */}
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(packageData.base_price, packageData.currency)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(packageData, 'is_published')}
                    title={packageData.is_published ? 'Unpublish' : 'Publish'}
                  >
                    {packageData.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(packageData, 'featured')}
                    title={packageData.featured ? 'Remove from Featured' : 'Add to Featured'}
                  >
                    <Star size={16} className={packageData.featured ? 'text-yellow-500 fill-current' : ''} />
                  </Button>
                  {canUpdate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditPackage(packageData)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Button>
                  )}
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeletePackage(packageData)}
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
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
          packageData={selectedPackage}
          mode={isCreating ? 'create' : 'edit'}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && packageToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setPackageToDelete(null);
          }}
          onConfirm={confirmDeletePackage}
          title="Delete Package"
          message={`Are you sure you want to delete "${packageToDelete.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default function PackagesAdminPage() {
  return (
    <AuthGuard>
      <PackagesAdmin />
    </AuthGuard>
  );
}