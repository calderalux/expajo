'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Package, PackageService } from '@/lib/services/packages';
import { 
  packageCreateSchema, 
  packageUpdateSchema, 
  packageCategories,
  currencies,
  type PackageCreateData,
  type PackageUpdateData 
} from '@/lib/validations/packages';
import { 
  BaseForm, 
  FormFieldConfig, 
  createTextField, 
  createTextareaField, 
  createSelectField, 
  createNumberField, 
  createSwitchField, 
  createArrayField 
} from '@/components/forms/BaseForm';
import { X } from 'lucide-react';

interface PackageFormModalProps {
  package_?: Package | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isCreating: boolean;
}

export const PackageFormModal: React.FC<PackageFormModalProps> = ({
  package_,
  isOpen,
  onClose,
  onSubmit,
  isCreating,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      destination_id: '',
      title: '',
      slug: '',
      summary: '',
      description: '',
      category: 'adventure',
      lead_partner_id: '',
      duration_days: 1,
      group_size_limit: 1,
      inclusions: [] as string[],
      exclusions: [] as string[],
      itinerary: [] as any[],
      base_price: 0,
      currency: 'USD',
      discount_percent: 0,
      featured: false,
      luxury_certified: false,
      availability: null,
      is_published: false,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setError(null);

      try {
        // Validate the form data
        const schema = isCreating ? packageCreateSchema : packageUpdateSchema;
        const validationResult = schema.safeParse(value);
        
        if (!validationResult.success) {
          const errors = validationResult.error.errors.map(err => err.message).join(', ');
          throw new Error(`Validation failed: ${errors}`);
        }

        const sessionToken = localStorage.getItem('admin_session_token');
        const url = isCreating 
          ? '/api/admin/packages'
          : `/api/admin/packages/${package_?.id}`;
        const method = isCreating ? 'POST' : 'PUT';

        const response = await fetch(url, {
          method,
          headers: {
            'Authorization': `Bearer ${sessionToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(validationResult.data),
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || 'Failed to save package');
        }

        onSubmit();
        onClose();
      } catch (error: any) {
        console.error('Error saving package:', error);
        setError(error.message || 'Failed to save package');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Update form values when package changes
  const updateFormValues = useCallback(() => {
    if (package_ && !isCreating) {
      form.setFieldValue('destination_id', package_.destination_id || '');
      form.setFieldValue('title', package_.title || '');
      form.setFieldValue('slug', package_.slug || '');
      form.setFieldValue('summary', package_.summary || '');
      form.setFieldValue('description', package_.description || '');
      form.setFieldValue('category', package_.category || '');
      form.setFieldValue('lead_partner_id', package_.lead_partner_id || '');
      form.setFieldValue('duration_days', package_.duration_days || 1);
      form.setFieldValue('group_size_limit', package_.group_size_limit || 1);
      form.setFieldValue('inclusions', Array.isArray(package_.inclusions) ? package_.inclusions : []);
      form.setFieldValue('exclusions', Array.isArray(package_.exclusions) ? package_.exclusions : []);
      form.setFieldValue('itinerary', Array.isArray(package_.itinerary) ? package_.itinerary : []);
      form.setFieldValue('base_price', package_.base_price || 0);
      form.setFieldValue('currency', package_.currency || 'USD');
      form.setFieldValue('discount_percent', package_.discount_percent || 0);
      form.setFieldValue('featured', package_.featured || false);
      form.setFieldValue('luxury_certified', package_.luxury_certified || false);
      // Skip availability field as it's not in the form
      form.setFieldValue('is_published', package_.is_published || false);
    } else {
      // Reset form for new package
      form.reset();
    }
  }, [package_, isCreating, form]);

  useEffect(() => {
    updateFormValues();
  }, [updateFormValues, isOpen]);

  const fields: FormFieldConfig[] = [
    createTextField('title', 'Title', { required: true, gridSpan: 6 }),
    createTextField('slug', 'Slug', { gridSpan: 6 }),
    createTextField('destination_id', 'Destination ID', { required: true, gridSpan: 6 }),
    createSelectField(
      'category', 
      'Category', 
      packageCategories,
      { gridSpan: 6 }
    ),
    createTextareaField('summary', 'Summary', { gridSpan: 12 }),
    createTextareaField('description', 'Description', { gridSpan: 12 }),
    createNumberField('base_price', 'Base Price', { required: true, gridSpan: 3 }),
    createSelectField(
      'currency', 
      'Currency', 
      currencies,
      { gridSpan: 3 }
    ),
    createNumberField('duration_days', 'Duration (days)', { required: true, gridSpan: 3 }),
    createNumberField('group_size_limit', 'Group Size Limit', { required: true, gridSpan: 3 }),
    createNumberField('discount_percent', 'Discount Percent', { gridSpan: 6 }),
    createTextField('lead_partner_id', 'Lead Partner ID', { gridSpan: 6 }),
    createArrayField(
      'inclusions',
      'Inclusions',
      {
        itemType: 'text',
        placeholder: 'Add inclusion',
        maxItems: 50,
        addButtonText: 'Add Inclusion'
      },
      { gridSpan: 12 }
    ),
    createArrayField(
      'exclusions',
      'Exclusions',
      {
        itemType: 'text',
        placeholder: 'Add exclusion',
        maxItems: 50,
        addButtonText: 'Add Exclusion'
      },
      { gridSpan: 12 }
    ),
    createSwitchField('featured', 'Featured Package', { gridSpan: 4 }),
    createSwitchField('luxury_certified', 'Luxury Certified', { gridSpan: 4 }),
    createSwitchField('is_published', 'Published', { gridSpan: 4 }),
  ];

  const actions = [
    {
      label: 'Cancel',
      type: 'button' as const,
      variant: 'outline' as const,
      onClick: onClose,
    },
    {
      label: isCreating ? 'Create Package' : 'Update Package',
      type: 'submit' as const,
      variant: 'filled' as const,
      color: 'primary',
      loading: isSubmitting,
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {isCreating ? 'Create New Package' : 'Edit Package'}
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <BaseForm
            title=""
            fields={fields}
            actions={actions}
            onSubmit={form.handleSubmit}
            initialValues={form.state.values}
            isLoading={isSubmitting}
            error={error}
            className="border-0 shadow-none p-0"
          />
        </form>
      </div>
    </Modal>
  );
};