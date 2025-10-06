'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { BaseForm, FormFieldConfig, FormAction, createRequiredStringValidation } from '@/components/forms/BaseForm';
import { PackageItemOptionsManager } from '@/components/forms/PackageItemOptionsManager';
import { 
  packageItemCreateSchema, 
  packageItemUpdateSchema,
  serviceTypeOptions
} from '@/lib/validations/package-items';
import { Database } from '@/types/database';
import { PackageItemOption } from '@/lib/services/package-item-options';
import { usePermission } from '@/components/auth/AuthGuard';

type PackageItem = Database['public']['Tables']['package_items']['Row'];

interface PackageItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (packageItem: PackageItem) => void;
  packageItem?: PackageItem | null;
  mode: 'create' | 'edit';
}

export function PackageItemFormModal({
  isOpen,
  onClose,
  onSuccess,
  packageItem,
  mode
}: PackageItemFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // Key to force form reset
  const [options, setOptions] = useState<PackageItemOption[]>([]);
  const [currentPackageItemId, setCurrentPackageItemId] = useState<string>('');
  const { hasPermission: canManageOptions } = usePermission('package_items', 'update');

  // Fetch options when package item is available
  const fetchOptions = async (packageItemId: string) => {
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch(`/api/admin/package-item-options?package_item_id=${packageItemId}`, {
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setOptions(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching options:', error);
      setOptions([]);
    }
  };

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormKey(prev => prev + 1); // Force form reset
      setError(null); // Clear any previous errors
      
      if (packageItem?.id && mode === 'edit') {
        setCurrentPackageItemId(packageItem.id);
        fetchOptions(packageItem.id);
      } else {
        setOptions([]);
        setCurrentPackageItemId('');
      }
    }
  }, [isOpen, mode, packageItem?.id]);

  // Form field configuration
  const fields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Item Name',
      type: 'text',
      placeholder: 'Enter item name',
      description: 'The name of the package item',
      required: true,
      gridSpan: 12,
      validation: createRequiredStringValidation('Item name is required'),
    },
    {
      name: 'code',
      label: 'Item Code',
      type: 'text',
      placeholder: 'Enter item code (optional)',
      description: 'Optional unique code for the item',
      gridSpan: 6,
    },
    {
      name: 'item_type',
      label: 'Item Type',
      type: 'select',
      placeholder: 'Select item type',
      description: 'The type/category of this item',
      required: true,
      options: serviceTypeOptions,
      gridSpan: 6,
      validation: createRequiredStringValidation('Item type is required'),
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe the item...',
      description: 'Detailed description of the package item',
      gridSpan: 12,
    },
  ];

  // Handle modal close with cleanup
  const handleClose = () => {
    setError(null); // Clear errors
    setIsLoading(false); // Reset loading state
    onClose();
  };

  // Form actions
  const actions: FormAction[] = [
    {
      label: 'Cancel',
      type: 'button',
      variant: 'outline',
      onClick: handleClose,
    },
    {
      label: mode === 'create' ? 'Create Item' : 'Update Item',
      type: 'submit',
      variant: 'filled',
      color: 'blue',
      loading: isLoading,
    },
  ];

  // Initial values
  const getInitialValues = () => {
    if (packageItem && mode === 'edit') {
      return {
        name: packageItem.name,
        code: packageItem.code || '',
        item_type: packageItem.item_type,
        description: packageItem.description || '',
      };
    }
    return {
      name: '',
      code: '',
      item_type: '',
      description: '',
    };
  };

  // Handle form submission
  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    setError(null);

    try {
      // Prepare form data with required fields
      const formData = {
        ...values,
        code: values.code || null, // Convert empty string to null
        description: values.description || null, // Convert empty string to null
        ...(mode === 'edit' && packageItem?.id ? { id: packageItem.id } : {}), // Add ID for updates
      };

      console.log('Form data being validated:', formData);
      console.log('Mode:', mode);
      console.log('Schema being used:', mode === 'create' ? 'packageItemCreateSchema' : 'packageItemUpdateSchema');

      // Validate the form data
      const schema = mode === 'create' ? packageItemCreateSchema : packageItemUpdateSchema;
      const validationResult = schema.safeParse(formData);
      
      if (!validationResult.success) {
        console.log('Validation errors:', validationResult.error.errors);
        const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed: ${errors}`);
      }

      const sessionToken = localStorage.getItem('admin_session_token');
      const url = mode === 'create' 
        ? '/api/admin/package-items'
        : `/api/admin/package-items/${packageItem?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      const data = await response.json();
      
      if (data.success) {
        // If creating a new package item, set the ID for options management
        if (mode === 'create') {
          setCurrentPackageItemId(data.data.id);
        }
        onSuccess(data.data);
        handleClose();
      } else {
        setError(data.error || `Failed to ${mode} package item`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error(`${mode} package item error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Create New Package Item' : 'Edit Package Item'}
      size="xl"
      maxHeight="90vh"
    >
      <div className="space-y-6">
        <BaseForm
          key={formKey} // Force form reset when key changes
          title=""
          description=""
          fields={fields}
          actions={actions}
          onSubmit={handleSubmit}
          initialValues={getInitialValues()}
          isLoading={isLoading}
          error={error}
          className="border-0 shadow-none"
        />
        
        {/* Options Management - Only show for edit mode or after creation */}
        {(mode === 'edit' || currentPackageItemId) && canManageOptions && (
          <div className="border-t pt-6 px-6 pb-6">
            <PackageItemOptionsManager
              packageItemId={currentPackageItemId || packageItem?.id || ''}
              options={options}
              onOptionsChange={setOptions}
              canManage={canManageOptions}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}
