'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { BaseForm, FormFieldConfig, FormAction, createRequiredStringValidation } from '@/components/forms/BaseForm';
import { 
  packageItemOptionCreateSchema, 
  packageItemOptionUpdateSchema,
  type PackageItemOptionCreateData,
  type PackageItemOptionUpdateData 
} from '@/lib/validations/package-item-options';
import { Database } from '@/types/database';

type PackageItemOption = Database['public']['Tables']['package_item_options']['Row'];

interface PackageItemOptionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (option: PackageItemOption) => void;
  option?: PackageItemOption | null;
  mode: 'create' | 'edit';
  packageItemId: string;
}

export function PackageItemOptionFormModal({
  isOpen,
  onClose,
  onSuccess,
  option,
  mode,
  packageItemId
}: PackageItemOptionFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // Key to force form reset

  useEffect(() => {
    if (isOpen) {
      setFormKey(prev => prev + 1);
      setError(null);
    }
  }, [isOpen, mode, option?.id]);

  const fields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Option Name',
      type: 'text',
      placeholder: 'Enter option name',
      required: true,
      gridSpan: 12,
      validation: createRequiredStringValidation('Option name is required'),
    },
    {
      name: 'description',
      label: 'Description (Optional)',
      type: 'textarea',
      placeholder: 'Enter option description',
      gridSpan: 12,
    },
    {
      name: 'price',
      label: 'Price',
      type: 'number',
      placeholder: '0.00',
      required: true,
      gridSpan: 6,
      validation: createRequiredStringValidation('Price is required'),
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'switch',
      gridSpan: 6,
    },
  ];

  const handleClose = () => {
    setError(null);
    setIsLoading(false);
    onClose();
  };

  const actions: FormAction[] = [
    {
      label: 'Cancel',
      type: 'button',
      variant: 'outline',
      onClick: handleClose,
    },
    {
      label: mode === 'create' ? 'Create Option' : 'Update Option',
      type: 'submit',
      variant: 'filled',
      color: 'blue',
      loading: isLoading,
    },
  ];

  const getInitialValues = () => {
    if (option && mode === 'edit') {
      return {
        name: option.name,
        description: option.description || '',
        price: option.price,
        is_active: option.is_active,
      };
    }
    return {
      name: '',
      description: '',
      price: 0,
      is_active: true,
    };
  };

  const handleSubmit = async (values: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = {
        ...values,
        package_item_id: packageItemId,
        description: values.description || null,
        meta: null,
        ...(mode === 'edit' && option?.id ? { id: option.id } : {}),
      };

      const schema = mode === 'create' ? packageItemOptionCreateSchema : packageItemOptionUpdateSchema;
      const validationResult = schema.safeParse(formData);
      
      if (!validationResult.success) {
        const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed: ${errors}`);
      }

      const sessionToken = localStorage.getItem('admin_session_token');
      const url = mode === 'create' 
        ? '/api/admin/package-item-options'
        : `/api/admin/package-item-options/${option?.id}`;
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
        onSuccess(data.data);
        handleClose();
      } else {
        setError(data.error || `Failed to ${mode} package item option`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error(`${mode} package item option error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Create New Option' : 'Edit Option'}
      size="lg"
      maxHeight="90vh"
    >
      <BaseForm
        key={formKey}
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
    </Modal>
  );
}
