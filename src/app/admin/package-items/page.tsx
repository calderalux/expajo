'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AuthGuard, useAuth, usePermission, useRoleLevel } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { PackageItemFormModal } from '@/components/forms/PackageItemFormModal';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Upload,
  Download,
  FileText,
  CheckSquare
} from 'lucide-react';
import { PackageItem } from '@/lib/services/package-items';
import { PackageItemFilters } from '@/lib/validations/package-items';
import { serviceTypeToLabel, ServiceType } from '@/types/database';

interface PackageItemListState {
  packageItems: PackageItem[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

const itemTypeOptions = [
  { value: '', label: 'All Types' },
  ...Object.entries(serviceTypeToLabel).map(([key, label]) => ({
    value: key,
    label: label
  }))
];

const sortOptions = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
  { value: 'item_type-asc', label: 'Type A-Z' },
  { value: 'item_type-desc', label: 'Type Z-A' },
];

function PackageItemsAdmin() {
  const { user } = useAuth();
  const { hasPermission: canCreate } = usePermission('package_items', 'create');
  const { hasPermission: canUpdate } = usePermission('package_items', 'update');
  const { hasPermission: canDelete } = usePermission('package_items', 'delete');
  const { roleLevel } = useRoleLevel();

  const [state, setState] = useState<PackageItemListState>({
    packageItems: [],
    isLoading: true,
    error: null,
    totalCount: 0,
  });

  const [filters, setFilters] = useState<PackageItemFilters>({
    search: '',
    item_type: undefined,
    sort_by: 'created_at',
    sort_order: 'desc',
    limit: 50,
    offset: 0,
  });

  const [selectedPackageItem, setSelectedPackageItem] = useState<PackageItem | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<PackageItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPackageItems = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sessionToken = localStorage.getItem('admin_session_token');
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.item_type) params.set('item_type', filters.item_type);
      params.set('sort_by', filters.sort_by);
      params.set('sort_order', filters.sort_order);
      params.set('limit', filters.limit.toString());
      params.set('offset', filters.offset.toString());

      const response = await fetch(`/api/admin/package-items?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch package items');
      }

      setState(prev => ({
        ...prev,
        packageItems: result.data || [],
        isLoading: false,
        totalCount: result.pagination?.total || 0,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch package items',
      }));
    }
  }, [filters]);

  useEffect(() => {
    fetchPackageItems();
  }, [fetchPackageItems]);

  const handleCreatePackageItem = () => {
    setSelectedPackageItem(null);
    setIsCreating(true);
    setShowFormModal(true);
  };

  const handleEditPackageItem = (packageItem: PackageItem) => {
    setSelectedPackageItem(packageItem);
    setIsCreating(false);
    setShowFormModal(true);
  };

  const handleDeletePackageItem = (packageItem: PackageItem) => {
    if (!canDelete) {
      alert('You do not have permission to delete package items');
      return;
    }

    setItemToDelete(packageItem);
    setShowDeleteModal(true);
  };

  const confirmDeletePackageItem = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/package-items/${itemToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete package item');
      }

      // Refresh the list
      await fetchPackageItems();
      
      // Close modal
      setShowDeleteModal(false);
      setItemToDelete(null);
    } catch (error: any) {
      alert(error.message || 'Failed to delete package item');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = async (packageItem: PackageItem) => {
    setShowFormModal(false);
    await fetchPackageItems();
  };

  const handleSelectItem = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedItems.size === state.packageItems.length) {
      setSelectedItems(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedItems(new Set(state.packageItems.map(item => item.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action: 'delete') => {
    if (selectedItems.size === 0) return;

    const actionText = action === 'delete' ? 'delete' : 'activate';
    
    if (!confirm(`Are you sure you want to ${actionText} ${selectedItems.size} item(s)?`)) {
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      
      for (const itemId of Array.from(selectedItems)) {
        if (action === 'delete') {
          await fetch(`/api/admin/package-items/${itemId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${sessionToken}`,
              'Content-Type': 'application/json',
            },
          });
        }
      }

      setSelectedItems(new Set());
      setShowBulkActions(false);
      await fetchPackageItems();
    } catch (error: any) {
      alert(`Failed to ${actionText} items: ${error.message}`);
    }
  };

  const handleExportItems = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.item_type) params.set('item_type', filters.item_type);
      params.set('sort_by', filters.sort_by);
      params.set('sort_order', filters.sort_order);
      params.set('limit', '1000'); // Export more records

      const response = await fetch(`/api/admin/package-items/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export package items');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `package_items_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    }
  };

  const downloadSampleFile = (format: 'csv' | 'json') => {
    const sampleUrl = `/samples/package_items_sample.${format}`;
    const a = document.createElement('a');
    a.href = sampleUrl;
    a.download = `package_items_sample.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Package Items</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, edit, and manage package items and services
            </p>
          </div>
          <div className="flex gap-3">
            {/* Export Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleExportItems}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            {/* Sample Downloads */}
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadSampleFile('csv')}
                className="flex items-center gap-1"
                title="Download CSV Sample"
              >
                <FileText className="w-3 h-3" />
                CSV
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => downloadSampleFile('json')}
                className="flex items-center gap-1"
                title="Download JSON Sample"
              >
                <FileText className="w-3 h-3" />
                JSON
              </Button>
            </div>

            {/* Create Button */}
            {canCreate && (
              <Button onClick={handleCreatePackageItem} leftIcon={<Plus size={20} />}>
                Add Item
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
                {selectedItems.size} item(s) selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('delete')}
                className="text-red-700 border-red-300 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedItems(new Set());
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
              placeholder="Search items..."
              value={filters.search || ''}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              leftIcon={<Search size={16} />}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Item Type
            </label>
            <Select
              options={itemTypeOptions}
              value={filters.item_type || ''}
              onChange={(value) => setFilters(prev => ({ ...prev, item_type: value ? value as ServiceType : undefined }))}
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
          <div className="flex items-end">
            <Button onClick={fetchPackageItems} className="w-full">
              Apply Filters
            </Button>
          </div>
        </div>
      </Card>

      {/* Results */}
      {state.isLoading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Card key={index} className="p-6 animate-pulse">
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
          <Button onClick={fetchPackageItems}>Try Again</Button>
        </Card>
      ) : state.packageItems.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-gray-500 text-lg mb-4">No package items found</div>
          {canCreate && (
            <Button onClick={handleCreatePackageItem}>Create First Item</Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedItems.size === state.packageItems.length && state.packageItems.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Select All
                      </span>
                    </label>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {state.packageItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.code || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {serviceTypeToLabel[item.item_type as ServiceType] || item.item_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500 max-w-xs truncate">
                        {item.description || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        {canUpdate && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPackageItem(item)}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePackageItem(item)}
                            title="Delete"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <PackageItemFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
          packageItem={selectedPackageItem}
          mode={isCreating ? 'create' : 'edit'}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setItemToDelete(null);
          }}
          onConfirm={confirmDeletePackageItem}
          title="Delete Package Item"
          message={`Are you sure you want to delete "${itemToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

export default function PackageItemsAdminPage() {
  return (
    <AuthGuard>
      <PackageItemsAdmin />
    </AuthGuard>
  );
}
