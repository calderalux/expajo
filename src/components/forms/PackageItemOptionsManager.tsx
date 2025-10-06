'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { PackageItemOptionFormModal } from '@/components/forms/PackageItemOptionFormModal';
import { PackageItemOption } from '@/lib/services/package-item-options';
import { 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface PackageItemOptionsManagerProps {
  packageItemId: string;
  options: PackageItemOption[];
  onOptionsChange: (options: PackageItemOption[]) => void;
  canManage: boolean;
}

export function PackageItemOptionsManager({
  packageItemId,
  options,
  onOptionsChange,
  canManage
}: PackageItemOptionsManagerProps) {
  const [localOptions, setLocalOptions] = useState<PackageItemOption[]>(options);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedOption, setSelectedOption] = useState<PackageItemOption | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [optionToDelete, setOptionToDelete] = useState<PackageItemOption | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setLocalOptions(options);
  }, [options]);

  const handleCreateOption = () => {
    setSelectedOption(null);
    setIsCreating(true);
    setShowFormModal(true);
  };

  const handleEditOption = (option: PackageItemOption) => {
    setSelectedOption(option);
    setIsCreating(false);
    setShowFormModal(true);
  };

  const handleDeleteOption = (option: PackageItemOption) => {
    if (!canManage) {
      alert('You do not have permission to delete options');
      return;
    }

    setOptionToDelete(option);
    setShowDeleteModal(true);
  };

  const confirmDeleteOption = async () => {
    if (!optionToDelete) return;

    setIsDeleting(true);
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/package-item-options/${optionToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to delete option');
      }

      // Update local state
      const updatedOptions = localOptions.filter(opt => opt.id !== optionToDelete.id);
      setLocalOptions(updatedOptions);
      onOptionsChange(updatedOptions);
      
      // Close modal
      setShowDeleteModal(false);
      setOptionToDelete(null);
    } catch (error: any) {
      alert(error.message || 'Failed to delete option');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleStatus = async (option: PackageItemOption) => {
    if (!canManage) {
      alert('You do not have permission to update options');
      return;
    }

    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/package-item-options/${option.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: !option.is_active,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update option');
      }

      // Update local state
      const updatedOptions = localOptions.map(opt => 
        opt.id === option.id ? { ...opt, is_active: !option.is_active } : opt
      );
      setLocalOptions(updatedOptions);
      onOptionsChange(updatedOptions);
    } catch (error: any) {
      alert(error.message || 'Failed to update option');
    }
  };

  const handleFormSuccess = (option: PackageItemOption) => {
    setShowFormModal(false);
    
    if (isCreating) {
      // Add new option
      const updatedOptions = [...localOptions, option];
      setLocalOptions(updatedOptions);
      onOptionsChange(updatedOptions);
    } else {
      // Update existing option
      const updatedOptions = localOptions.map(opt => 
        opt.id === option.id ? option : opt
      );
      setLocalOptions(updatedOptions);
      onOptionsChange(updatedOptions);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Options</h3>
        {canManage && (
          <Button
            onClick={handleCreateOption}
            size="sm"
            leftIcon={<Plus size={16} />}
          >
            Add Option
          </Button>
        )}
      </div>

      {localOptions.length === 0 ? (
        <Card className="p-6 text-center">
          <div className="text-gray-500 text-sm mb-4">No options available</div>
          {canManage && (
            <Button onClick={handleCreateOption} size="sm">
              Create First Option
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {localOptions.map((option) => (
            <Card key={option.id} className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">{option.name}</h4>
                    <div className="flex items-center gap-1">
                      {option.is_active ? (
                        <ToggleRight size={16} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={16} className="text-gray-400" />
                      )}
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        option.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {option.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  {option.description && (
                    <p className="text-sm text-gray-600 mb-2">{option.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <DollarSign size={14} />
                      {formatPrice(option.price)}
                    </div>
                  </div>
                </div>
                
                {canManage && (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(option)}
                      title={option.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {option.is_active ? (
                        <ToggleRight size={16} className="text-green-600" />
                      ) : (
                        <ToggleLeft size={16} className="text-gray-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditOption(option)}
                      title="Edit"
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteOption(option)}
                      title="Delete"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <PackageItemOptionFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSuccess={handleFormSuccess}
          option={selectedOption}
          mode={isCreating ? 'create' : 'edit'}
          packageItemId={packageItemId}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && optionToDelete && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setOptionToDelete(null);
          }}
          onConfirm={confirmDeleteOption}
          title="Delete Option"
          message={`Are you sure you want to delete "${optionToDelete.name}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}
