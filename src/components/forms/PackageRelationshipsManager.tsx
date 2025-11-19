'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import {
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  GripVertical,
  MapPin,
  Clock,
  DollarSign,
  Star,
  Check,
  X as XIcon,
} from 'lucide-react';
import { Experience } from '@/lib/services/experiences';
import { PackageItemOption } from '@/lib/services/package-item-options';
import { PackageExperienceWithDetails } from '@/lib/services/package-experiences';
import { PackageOptionMappingWithDetails } from '@/lib/services/package-option-mappings';
import { serviceTypeToLabel } from '@/types/database';

interface PackageRelationshipsManagerProps {
  packageId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ExperienceSelection {
  id: string;
  title: string;
  description: string;
  price_per_person: number;
  duration_hours: number;
  location: string;
  category: string;
  image_urls: string[];
  is_optional: boolean;
  is_included_in_price: boolean;
  sort_order: number;
}

interface OptionSelection {
  id: string;
  name: string;
  description: string | null;
  price: number;
  package_item_id: string;
  is_active: boolean | null;
}

export function PackageRelationshipsManager({
  packageId,
  isOpen,
  onClose,
  onSuccess,
}: PackageRelationshipsManagerProps) {
  const [activeTab, setActiveTab] = useState<'experiences' | 'options'>(
    'experiences'
  );

  // Experiences state
  const [experiences, setExperiences] = useState<
    PackageExperienceWithDetails[]
  >([]);
  const [availableExperiences, setAvailableExperiences] = useState<
    Experience[]
  >([]);
  const [experiencesLoading, setExperiencesLoading] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [selectedExperience, setSelectedExperience] =
    useState<Experience | null>(null);
  const [experienceSearch, setExperienceSearch] = useState('');
  const [experienceCategory, setExperienceCategory] =
    useState('All Categories');

  // Options state
  const [optionMappings, setOptionMappings] = useState<
    PackageOptionMappingWithDetails[]
  >([]);
  const [availableOptions, setAvailableOptions] = useState<PackageItemOption[]>(
    []
  );
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [showOptionModal, setShowOptionModal] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<Set<string>>(
    new Set()
  );
  const [optionSearch, setOptionSearch] = useState('');
  const [optionItemType, setOptionItemType] = useState('');

  const categories = ['All Categories', ...Object.values(serviceTypeToLabel)];

  const itemTypes = [
    { value: '', label: 'All Types' },
    ...Object.entries(serviceTypeToLabel).map(([key, label]) => ({
      value: key,
      label: label,
    })),
  ];

  // Load package relationships
  const loadPackageRelationships = useCallback(async () => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');

      // Load experiences
      const experiencesResponse = await fetch(
        `/api/admin/packages/${packageId}/experiences`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (experiencesResponse.ok) {
        const experiencesResult = await experiencesResponse.json();
        setExperiences(experiencesResult.data || []);
      }

      // Load options
      const optionsResponse = await fetch(
        `/api/admin/packages/${packageId}/options`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (optionsResponse.ok) {
        const optionsResult = await optionsResponse.json();
        setOptionMappings(optionsResult.data || []);
      }
    } catch (error) {
      console.error('Error loading package relationships:', error);
    }
  }, [packageId]);

  useEffect(() => {
    if (isOpen && packageId) {
      loadPackageRelationships();
    }
  }, [isOpen, packageId, loadPackageRelationships]);

  const loadAvailableExperiences = async () => {
    setExperiencesLoading(true);
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const params = new URLSearchParams();

      if (experienceSearch) params.set('search', experienceSearch);
      if (experienceCategory !== 'All Categories')
        params.set('category', experienceCategory);
      params.set('limit', '50');
      params.set('is_active', 'true');

      const response = await fetch(
        `/api/admin/experiences?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        // Filter out already selected experiences
        const selectedIds = new Set(
          experiences.map((exp) => exp.experience_id)
        );
        setAvailableExperiences(
          (result.data || []).filter(
            (exp: Experience) => !selectedIds.has(exp.id)
          )
        );
      }
    } catch (error) {
      console.error('Error loading experiences:', error);
    } finally {
      setExperiencesLoading(false);
    }
  };

  const loadAvailableOptions = async () => {
    setOptionsLoading(true);
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const params = new URLSearchParams();

      if (optionSearch) params.set('search', optionSearch);
      if (optionItemType) params.set('item_type', optionItemType);
      params.set('limit', '100');
      params.set('is_active', 'true');

      const response = await fetch(
        `/api/admin/package-item-options?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        // Filter out already selected options
        const selectedIds = new Set(
          optionMappings.map((mapping) => mapping.option_id)
        );
        setAvailableOptions(
          (result.data || []).filter(
            (option: PackageItemOption) => !selectedIds.has(option.id)
          )
        );
      }
    } catch (error) {
      console.error('Error loading options:', error);
    } finally {
      setOptionsLoading(false);
    }
  };

  const handleAddExperience = async (experience: Experience) => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(
        `/api/admin/packages/${packageId}/experiences`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            experience_id: experience.id,
            is_optional: false,
            is_included_in_price: true,
            sort_order: experiences.length,
          }),
        }
      );

      const result = await response.json();
      if (result.success) {
        await loadPackageRelationships();
        setShowExperienceModal(false);
        setSelectedExperience(null);
        onSuccess?.();
      } else {
        alert(result.error || 'Failed to add experience');
      }
    } catch (error) {
      console.error('Error adding experience:', error);
      alert('Failed to add experience');
    }
  };

  const handleRemoveExperience = async (experienceId: string) => {
    if (
      !confirm(
        'Are you sure you want to remove this experience from the package?'
      )
    ) {
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(
        `/api/admin/packages/${packageId}/experiences?experience_id=${experienceId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        await loadPackageRelationships();
        onSuccess?.();
      } else {
        alert(result.error || 'Failed to remove experience');
      }
    } catch (error) {
      console.error('Error removing experience:', error);
      alert('Failed to remove experience');
    }
  };

  const handleAddOptions = async () => {
    if (selectedOptions.size === 0) return;

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/packages/${packageId}/options`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          option_ids: Array.from(selectedOptions),
        }),
      });

      const result = await response.json();
      if (result.success) {
        await loadPackageRelationships();
        setShowOptionModal(false);
        setSelectedOptions(new Set());
        onSuccess?.();
      } else {
        alert(result.error || 'Failed to add options');
      }
    } catch (error) {
      console.error('Error adding options:', error);
      alert('Failed to add options');
    }
  };

  const handleRemoveOption = async (optionId: string) => {
    if (
      !confirm('Are you sure you want to remove this option from the package?')
    ) {
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(
        `/api/admin/packages/${packageId}/options?option_id=${optionId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        await loadPackageRelationships();
        onSuccess?.();
      } else {
        alert(result.error || 'Failed to remove option');
      }
    } catch (error) {
      console.error('Error removing option:', error);
      alert('Failed to remove option');
    }
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Package Relationships"
      size="xl"
      maxHeight="90vh"
    >
      <div className="space-y-6 p-6">
        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('experiences')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'experiences'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Experiences ({experiences.length})
          </button>
          <button
            onClick={() => setActiveTab('options')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'options'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Package Options ({optionMappings.length})
          </button>
        </div>

        {/* Experiences Tab */}
        {activeTab === 'experiences' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Package Experiences</h3>
              <Button
                onClick={() => {
                  loadAvailableExperiences();
                  setShowExperienceModal(true);
                }}
                leftIcon={<Plus size={16} />}
                size="sm"
              >
                Add Experience
              </Button>
            </div>

            {experiences.length === 0 ? (
              <Card className="p-6 text-center">
                <div className="text-gray-500 mb-4">
                  No experiences added to this package
                </div>
                <Button
                  onClick={() => {
                    loadAvailableExperiences();
                    setShowExperienceModal(true);
                  }}
                  variant="outline"
                >
                  Add First Experience
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {experiences.map((exp, index) => (
                  <Card key={exp.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">
                            {exp.experience.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {exp.is_optional && (
                              <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                                Optional
                              </span>
                            )}
                            {!exp.is_included_in_price && (
                              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                Extra Cost
                              </span>
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                          {exp.experience.description}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <MapPin size={14} />
                            {exp.experience.location}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={14} />
                            {formatDuration(exp.experience.duration_hours)}
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {formatPrice(exp.experience.price_per_person)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleRemoveExperience(exp.experience_id)
                          }
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Options Tab */}
        {activeTab === 'options' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Package Options</h3>
              <Button
                onClick={() => {
                  loadAvailableOptions();
                  setShowOptionModal(true);
                }}
                leftIcon={<Plus size={16} />}
                size="sm"
              >
                Add Options
              </Button>
            </div>

            {optionMappings.length === 0 ? (
              <Card className="p-6 text-center">
                <div className="text-gray-500 mb-4">
                  No options added to this package
                </div>
                <Button
                  onClick={() => {
                    loadAvailableOptions();
                    setShowOptionModal(true);
                  }}
                  variant="outline"
                >
                  Add First Options
                </Button>
              </Card>
            ) : (
              <div className="space-y-3">
                {optionMappings.map((mapping) => (
                  <Card key={mapping.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {mapping.package_item_option.name}
                        </h4>
                        {mapping.package_item_option.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {mapping.package_item_option.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {formatPrice(mapping.package_item_option.price)}
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                mapping.package_item_option.is_active
                                  ? 'bg-green-500'
                                  : 'bg-red-500'
                              }`}
                            />
                            {mapping.package_item_option.is_active
                              ? 'Active'
                              : 'Inactive'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveOption(mapping.option_id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Experience Selection Modal */}
      {showExperienceModal && (
        <Modal
          isOpen={showExperienceModal}
          onClose={() => {
            setShowExperienceModal(false);
            setSelectedExperience(null);
          }}
          title="Select Experience"
          size="lg"
        >
          <div className="space-y-4 p-6">
            <div className="flex gap-4">
              <Input
                placeholder="Search experiences..."
                value={experienceSearch}
                onChange={(e) => setExperienceSearch(e.target.value)}
                leftIcon={<Search size={16} />}
                className="flex-1"
              />
              <Select
                options={categories.map((cat) => ({ value: cat, label: cat }))}
                value={experienceCategory}
                onChange={(value) => setExperienceCategory(value)}
                className="w-48"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {experiencesLoading ? (
                <div className="text-center py-8">Loading experiences...</div>
              ) : availableExperiences.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No experiences found
                </div>
              ) : (
                availableExperiences.map((experience) => (
                  <Card
                    key={experience.id}
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => handleAddExperience(experience)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {experience.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
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
                            <DollarSign size={14} />
                            {formatPrice(experience.price_per_person)}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Add
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Option Selection Modal */}
      {showOptionModal && (
        <Modal
          isOpen={showOptionModal}
          onClose={() => {
            setShowOptionModal(false);
            setSelectedOptions(new Set());
          }}
          title="Select Package Options"
          size="lg"
        >
          <div className="space-y-4 p-6">
            <div className="flex gap-4">
              <Input
                placeholder="Search options..."
                value={optionSearch}
                onChange={(e) => setOptionSearch(e.target.value)}
                leftIcon={<Search size={16} />}
                className="flex-1"
              />
              <Select
                options={itemTypes}
                value={optionItemType}
                onChange={(value) => setOptionItemType(value)}
                className="w-48"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {optionsLoading ? (
                <div className="text-center py-8">Loading options...</div>
              ) : availableOptions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No options found
                </div>
              ) : (
                availableOptions.map((option) => (
                  <Card
                    key={option.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedOptions.has(option.id)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      const newSelected = new Set(selectedOptions);
                      if (newSelected.has(option.id)) {
                        newSelected.delete(option.id);
                      } else {
                        newSelected.add(option.id);
                      }
                      setSelectedOptions(newSelected);
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900">
                            {option.name}
                          </h4>
                          {selectedOptions.has(option.id) && (
                            <Check size={16} className="text-primary" />
                          )}
                        </div>
                        {option.description && (
                          <p className="text-sm text-gray-600 mb-2">
                            {option.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            {formatPrice(option.price)}
                          </div>
                          <div className="flex items-center gap-1">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                option.is_active ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            />
                            {option.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {selectedOptions.size > 0 && (
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-sm text-gray-600">
                  {selectedOptions.size} option(s) selected
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedOptions(new Set())}
                  >
                    Clear Selection
                  </Button>
                  <Button
                    onClick={handleAddOptions}
                    disabled={selectedOptions.size === 0}
                  >
                    Add Selected ({selectedOptions.size})
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </Modal>
  );
}
