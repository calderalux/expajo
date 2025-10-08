'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { AuthGuard, useAuth, usePermission, useRoleLevel } from '@/components/auth/AuthGuard';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { ExperienceFormModal } from '@/components/forms/ExperienceFormModal';
import { ExperienceImportModal } from '@/components/modals/ExperienceImportModal';
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
  Upload,
  Download,
  FileText,
  MoreHorizontal,
  CheckSquare
} from 'lucide-react';
import { Experience, ExperienceService } from '@/lib/services/experiences';
import { cn } from '@/utils/cn';
import { serviceTypeToLabel } from '@/types/database';
interface ExperienceListState {
  experiences: Experience[];
  isLoading: boolean;
  error: string | null;
  totalCount: number;
}

const categories = [
  'All Categories',
  ...Object.values(serviceTypeToLabel),
];

const sortOptions = [
  { value: 'created_at-desc', label: 'Newest First' },
  { value: 'created_at-asc', label: 'Oldest First' },
  { value: 'title-asc', label: 'Name A-Z' },
  { value: 'title-desc', label: 'Name Z-A' },
  { value: 'price_per_person-asc', label: 'Price: Low to High' },
  { value: 'price_per_person-desc', label: 'Price: High to Low' },
  { value: 'rating-desc', label: 'Highest Rated' },
];

function ExperiencesAdmin() {
  const { user } = useAuth();
  const { hasPermission: canCreate } = usePermission('experiences', 'create');
  const { hasPermission: canUpdate } = usePermission('experiences', 'update');
  const { hasPermission: canDelete } = usePermission('experiences', 'delete');
  const { roleLevel } = useRoleLevel();

  const [state, setState] = useState<ExperienceListState>({
    experiences: [],
    isLoading: true,
    error: null,
    totalCount: 0,
  });

  const [filters, setFilters] = useState({
    search: '',
    category: 'All Categories',
    status: 'all',
    sort: 'created_at-desc',
  });

  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedExperiences, setSelectedExperiences] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  const fetchExperiences = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const sessionToken = localStorage.getItem('admin_session_token');
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.category !== 'All Categories') params.set('category', filters.category);
      if (filters.status !== 'all') params.set('is_active', filters.status === 'active' ? 'true' : 'false');
      
      const [sortBy, sortOrder] = filters.sort.split('-');
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);
      params.set('limit', '50');

      const response = await fetch(`/api/admin/experiences?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch experiences');
      }

      setState(prev => ({
        ...prev,
        experiences: result.data || [],
        isLoading: false,
        totalCount: result.pagination?.total || 0,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error.message || 'Failed to fetch experiences',
      }));
    }
  }, [filters]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  const handleCreateExperience = () => {
    setSelectedExperience(null);
    setIsCreating(true);
    setShowFormModal(true);
  };

  const handleEditExperience = (experience: Experience) => {
    setSelectedExperience(experience);
    setIsCreating(false);
    setShowFormModal(true);
  };

  const handleDeleteExperience = async (experience: Experience) => {
    if (!canDelete) {
      alert('You do not have permission to delete experiences');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${experience.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/experiences/${experience.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete experience');
      }

      // Refresh the list
      await fetchExperiences();
    } catch (error: any) {
      alert(error.message || 'Failed to delete experience');
    }
  };

  const handleToggleStatus = async (experience: Experience) => {
    if (!canUpdate) {
      alert('You do not have permission to update experiences');
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/experiences/${experience.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !experience.is_active,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update experience');
      }

      // Refresh the list
      await fetchExperiences();
    } catch (error: any) {
      alert(error.message || 'Failed to update experience');
    }
  };

  const handleFormSuccess = async (experience: Experience) => {
    setShowFormModal(false);
    await fetchExperiences();
  };

  const handleSelectExperience = (experienceId: string) => {
    const newSelected = new Set(selectedExperiences);
    if (newSelected.has(experienceId)) {
      newSelected.delete(experienceId);
    } else {
      newSelected.add(experienceId);
    }
    setSelectedExperiences(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const handleSelectAll = () => {
    if (selectedExperiences.size === state.experiences.length) {
      setSelectedExperiences(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedExperiences(new Set(state.experiences.map(exp => exp.id)));
      setShowBulkActions(true);
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'delete') => {
    if (selectedExperiences.size === 0) return;

    const actionText = action === 'delete' ? 'delete' : 
                     action === 'activate' ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${actionText} ${selectedExperiences.size} experience(s)?`)) {
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      
      for (const experienceId of Array.from(selectedExperiences)) {
        if (action === 'delete') {
          await fetch(`/api/admin/experiences/${experienceId}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${sessionToken}`,
              'Content-Type': 'application/json',
            },
          });
        } else {
          await fetch(`/api/admin/experiences/${experienceId}`, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${sessionToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              is_active: action === 'activate',
            }),
          });
        }
      }

      setSelectedExperiences(new Set());
      setShowBulkActions(false);
      await fetchExperiences();
    } catch (error: any) {
      alert(`Failed to ${actionText} experiences: ${error.message}`);
    }
  };

  const handleExportExperiences = async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const params = new URLSearchParams();
      
      if (filters.search) params.set('search', filters.search);
      if (filters.category !== 'All Categories') params.set('category', filters.category);
      if (filters.status !== 'all') params.set('is_active', filters.status === 'active' ? 'true' : 'false');
      
      const [sortBy, sortOrder] = filters.sort.split('-');
      params.set('sort_by', sortBy);
      params.set('sort_order', sortOrder);
      params.set('limit', '1000'); // Export more records

      const response = await fetch(`/api/admin/experiences/export?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to export experiences');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `experiences_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    }
  };

  const downloadSampleFile = (format: 'csv' | 'json') => {
    const sampleUrl = `/samples/experiences_sample.${format}`;
    const a = document.createElement('a');
    a.href = sampleUrl;
    a.download = `experiences_sample.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDuration = (hours: number) => {
    if (hours < 24) {
      return `${hours}h`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Manage Experiences</h1>
            <p className="mt-1 text-sm text-gray-500">
              Create, edit, and manage travel experiences
            </p>
          </div>
          <div className="flex gap-3">
            {/* Import & Export Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2"
                disabled={!canCreate}
              >
                <Upload className="w-4 h-4" />
                Import
              </Button>
              <Button
                variant="outline"
                onClick={handleExportExperiences}
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
              <Button onClick={handleCreateExperience} leftIcon={<Plus size={20} />}>
                Add Experience
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
                  {selectedExperiences.size} experience(s) selected
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  className="text-green-700 border-green-300 hover:bg-green-50"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                  className="text-orange-700 border-orange-300 hover:bg-orange-50"
                >
                  <EyeOff className="w-4 h-4 mr-1" />
                  Deactivate
                </Button>
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
                    setSelectedExperiences(new Set());
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
                placeholder="Search experiences..."
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
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' },
                ]}
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
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
            <Button onClick={fetchExperiences}>Try Again</Button>
          </Card>
        ) : state.experiences.length === 0 ? (
          <Card className="p-6 text-center">
            <div className="text-gray-500 text-lg mb-4">No experiences found</div>
            {canCreate && (
              <Button onClick={handleCreateExperience}>Create First Experience</Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Select All Checkbox */}
            {state.experiences.length > 0 && (
              <div className="col-span-full mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedExperiences.size === state.experiences.length}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({state.experiences.length} experiences)
                  </span>
                </label>
              </div>
            )}
            
            {state.experiences.map((experience) => (
              <Card key={experience.id} className="p-6 hover:shadow-md transition-shadow relative">
                {/* Selection Checkbox */}
                <div className="absolute top-4 left-4 z-10">
                  <input
                    type="checkbox"
                    checked={selectedExperiences.has(experience.id)}
                    onChange={() => handleSelectExperience(experience.id)}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                </div>
                {/* Image */}
                <div className="h-48 bg-gray-200 rounded-lg mb-4 overflow-hidden">
                  {experience.image_urls && experience.image_urls.length > 0 ? (
                    <Image
                      src={experience.image_urls[0]}
                      alt={experience.title}
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
                      {experience.title}
                    </h3>
                    <div className="flex items-center gap-1 ml-2">
                      {experience.is_featured && (
                        <Star size={16} className="text-yellow-500 fill-current" />
                      )}
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        experience.is_active ? 'bg-green-500' : 'bg-red-500'
                      )} />
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {experience.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      {experience.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      {formatDuration(experience.duration_hours)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      {experience.max_capacity}
                    </div>
                  </div>
                </div>

                {/* Price and Actions */}
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold text-primary">
                    {formatPrice(experience.price_per_person)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(experience)}
                      title={experience.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {experience.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                    </Button>
                    {canUpdate && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditExperience(experience)}
                        title="Edit"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteExperience(experience)}
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
          <ExperienceFormModal
            isOpen={showFormModal}
            onClose={() => setShowFormModal(false)}
            onSuccess={handleFormSuccess}
            experience={selectedExperience}
            mode={isCreating ? 'create' : 'edit'}
          />
        )}

        {/* Import Modal */}
        {showImportModal && (
          <ExperienceImportModal
            isOpen={showImportModal}
            onClose={() => setShowImportModal(false)}
            onSuccess={(result) => {
              setShowImportModal(false);
              fetchExperiences(); // Refresh the list
            }}
          />
        )}
    </div>
  );
}

export default function ExperiencesAdminPage() {
  return (
    <AuthGuard>
      <ExperiencesAdmin />
    </AuthGuard>
  );
}
