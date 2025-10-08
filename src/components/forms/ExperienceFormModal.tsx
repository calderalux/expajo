'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { BaseForm, FormFieldConfig, FormAction, createRequiredStringValidation, createNumberValidation } from '@/components/forms/BaseForm';
import { 
  experienceCreateSchema, 
  experienceUpdateSchema, 
  experienceCategories,
  type ExperienceCreateData,
  type ExperienceUpdateData 
} from '@/lib/validations/experiences';
import { Database } from '@/types/database';

type Experience = Database['public']['Tables']['experiences']['Row'];

interface ExperienceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (experience: Experience) => void;
  experience?: Experience | null;
  mode: 'create' | 'edit';
}

export function ExperienceFormModal({
  isOpen,
  onClose,
  onSuccess,
  experience,
  mode
}: ExperienceFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // Key to force form reset

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormKey(prev => prev + 1); // Force form reset
      setError(null); // Clear any previous errors
    }
  }, [isOpen, mode, experience?.id]);

  // Form field configuration
  const fields: FormFieldConfig[] = [
    {
      name: 'title',
      label: 'Experience Title',
      type: 'text',
      placeholder: 'Enter experience title',
      description: 'The title of the experience',
      required: true,
      gridSpan: 6,
      validation: createRequiredStringValidation('Experience title is required'),
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      placeholder: 'Select category',
      description: 'The category of the experience',
      required: true,
      options: experienceCategories.map(cat => ({ value: cat, label: cat })),
      gridSpan: 6,
      validation: createRequiredStringValidation('Category is required'),
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe the experience...',
      description: 'Detailed description of the experience',
      required: true,
      gridSpan: 12,
      validation: createRequiredStringValidation('Description is required'),
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      placeholder: 'Enter location',
      description: 'Where this experience takes place',
      required: true,
      gridSpan: 12,
      validation: createRequiredStringValidation('Location is required'),
    },
    {
      name: 'price_per_person',
      label: 'Price per Person (USD)',
      type: 'number',
      placeholder: 'Enter price',
      description: 'Price per person in US Dollars',
      required: true,
      gridSpan: 4,
      validation: createNumberValidation(0, 'Price must be greater than 0'),
    },
    {
      name: 'duration_hours',
      label: 'Duration (hours)',
      type: 'number',
      placeholder: 'Enter duration',
      description: 'Duration of the experience in hours',
      required: true,
      gridSpan: 4,
      validation: createNumberValidation(1, 'Duration must be at least 1 hour'),
    },
    {
      name: 'max_capacity',
      label: 'Max Capacity',
      type: 'number',
      placeholder: 'Enter capacity',
      description: 'Maximum number of participants',
      required: true,
      gridSpan: 4,
      validation: createNumberValidation(1, 'Capacity must be at least 1'),
    },
    {
      name: 'image_urls',
      label: 'Image URLs',
      type: 'array',
      description: 'Add multiple images to showcase the experience',
      arrayConfig: {
        itemType: 'url',
        placeholder: 'Enter image URL',
        maxItems: 10,
        addButtonText: 'Add Image',
      },
      gridSpan: 12,
    },
    {
      name: 'features',
      label: 'Features',
      type: 'array',
      description: 'Key features and highlights of this experience',
      arrayConfig: {
        itemType: 'text',
        placeholder: 'Enter feature',
        maxItems: 20,
        addButtonText: 'Add Feature',
      },
      gridSpan: 12,
    },
    {
      name: 'is_featured',
      label: 'Featured Experience',
      type: 'switch',
      description: 'Featured experiences appear prominently on the homepage',
      gridSpan: 6,
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'switch',
      description: 'Active experiences are visible to the public',
      gridSpan: 6,
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
      label: mode === 'create' ? 'Create Experience' : 'Update Experience',
      type: 'submit',
      variant: 'filled',
      color: 'blue',
      loading: isLoading,
    },
  ];

  // Initial values
  const getInitialValues = () => {
    if (experience && mode === 'edit') {
      return {
        title: experience.title,
        description: experience.description,
        location: experience.location,
        price_per_person: experience.price_per_person,
        duration_hours: experience.duration_hours,
        max_capacity: experience.max_capacity,
        category: experience.category,
        image_urls: experience.image_urls || [],
        features: experience.features || [],
        is_featured: experience.is_featured || false,
        is_active: experience.is_active !== undefined ? experience.is_active : true,
      };
    }
    return {
      title: '',
      description: '',
      location: '',
      price_per_person: 0,
      duration_hours: 1,
      max_capacity: 1,
      category: '',
      image_urls: [],
      features: [],
      is_featured: false,
      is_active: true,
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
        ...(mode === 'edit' && experience?.id ? { id: experience.id } : {}), // Add ID for updates
      };

      console.log('Form data being validated:', formData);
      console.log('Mode:', mode);
      console.log('Schema being used:', mode === 'create' ? 'experienceCreateSchema' : 'experienceUpdateSchema');

      // Validate the form data
      const schema = mode === 'create' ? experienceCreateSchema : experienceUpdateSchema;
      const validationResult = schema.safeParse(formData);
      
      if (!validationResult.success) {
        console.log('Validation errors:', validationResult.error.errors);
        const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed: ${errors}`);
      }

      const sessionToken = localStorage.getItem('admin_session_token');
      const url = mode === 'create' 
        ? '/api/admin/experiences'
        : `/api/admin/experiences/${experience?.id}`;
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
        setError(data.error || `Failed to ${mode} experience`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error(`${mode} experience error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Create New Experience' : 'Edit Experience'}
      size="xl"
      maxHeight="90vh"
    >
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
    </Modal>
  );
}