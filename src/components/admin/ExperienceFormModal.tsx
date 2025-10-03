'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Experience, ExperienceService } from '@/lib/services/experiences';
import { 
  experienceCreateSchema, 
  experienceUpdateSchema, 
  experienceCategories,
  type ExperienceCreateData,
  type ExperienceUpdateData 
} from '@/lib/validations/experiences';
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

interface ExperienceFormModalProps {
  experience?: Experience | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isCreating: boolean;
}

export const ExperienceFormModal: React.FC<ExperienceFormModalProps> = ({
  experience,
  isOpen,
  onClose,
  onSubmit,
  isCreating,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      title: '',
      description: '',
      location: '',
      price_per_person: 0,
      duration_hours: 1,
      max_capacity: 1,
      category: '',
      image_urls: [] as string[],
      features: [] as string[],
      is_featured: false,
      is_active: true,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      setError(null);

      try {
        // Validate the form data
        const schema = isCreating ? experienceCreateSchema : experienceUpdateSchema;
        const validationResult = schema.safeParse(value);
        
        if (!validationResult.success) {
          const errors = validationResult.error.errors.map(err => err.message).join(', ');
          throw new Error(`Validation failed: ${errors}`);
        }

        const sessionToken = localStorage.getItem('admin_session_token');
        const url = isCreating 
          ? '/api/admin/experiences'
          : `/api/admin/experiences/${experience?.id}`;
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
          throw new Error(result.error || 'Failed to save experience');
        }

        onSubmit();
        onClose();
      } catch (error: any) {
        console.error('Error saving experience:', error);
        setError(error.message || 'Failed to save experience');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  // Update form values when experience changes
  const updateFormValues = useCallback(() => {
    if (experience && !isCreating) {
      form.setFieldValue('title', experience.title || '');
      form.setFieldValue('description', experience.description || '');
      form.setFieldValue('location', experience.location || '');
      form.setFieldValue('price_per_person', experience.price_per_person || 0);
      form.setFieldValue('duration_hours', experience.duration_hours || 1);
      form.setFieldValue('max_capacity', experience.max_capacity || 1);
      form.setFieldValue('category', experience.category || '');
      form.setFieldValue('image_urls', experience.image_urls || []);
      form.setFieldValue('features', experience.features || []);
      form.setFieldValue('is_featured', experience.is_featured || false);
      form.setFieldValue('is_active', experience.is_active !== undefined ? experience.is_active : true);
    } else {
      // Reset form for new experience
      form.reset();
    }
  }, [experience, isCreating, form]);

  useEffect(() => {
    updateFormValues();
  }, [updateFormValues, isOpen]);

  const fields: FormFieldConfig[] = [
    createTextField('title', 'Title', { required: true, gridSpan: 6 }),
    createSelectField(
      'category', 
      'Category', 
      experienceCategories.map(cat => ({ value: cat, label: cat })),
      { required: true, gridSpan: 6 }
    ),
    createTextareaField('description', 'Description', { required: true, gridSpan: 12 }),
    createTextField('location', 'Location', { required: true, gridSpan: 12 }),
    createNumberField('price_per_person', 'Price per Person (NGN)', { required: true, gridSpan: 4 }),
    createNumberField('duration_hours', 'Duration (hours)', { required: true, gridSpan: 4 }),
    createNumberField('max_capacity', 'Max Capacity', { required: true, gridSpan: 4 }),
    createArrayField(
      'image_urls',
      'Image URLs',
      {
        itemType: 'url',
        placeholder: 'Add image URL',
        maxItems: 10,
        addButtonText: 'Add Image URL'
      },
      { gridSpan: 12 }
    ),
    createArrayField(
      'features',
      'Features',
      {
        itemType: 'text',
        placeholder: 'Add feature',
        maxItems: 20,
        addButtonText: 'Add Feature'
      },
      { gridSpan: 12 }
    ),
    createSwitchField('is_featured', 'Featured Experience', { gridSpan: 6 }),
    createSwitchField('is_active', 'Active', { gridSpan: 6 }),
  ];

  const actions = [
    {
      label: 'Cancel',
      type: 'button' as const,
      variant: 'outline' as const,
      onClick: onClose,
    },
    {
      label: isCreating ? 'Create Experience' : 'Update Experience',
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
            {isCreating ? 'Create New Experience' : 'Edit Experience'}
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