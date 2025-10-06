'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { BaseForm, FormFieldConfig, FormAction, createRequiredStringValidation, createOptionalStringValidation } from '@/components/forms/BaseForm';
import { 
  createDestinationSchema, 
  updateDestinationSchema,
  generateSlug
} from '@/lib/validations/destinations';
import { Database } from '@/types/database';

type Destination = Database['public']['Tables']['destinations']['Row'];

interface DestinationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (destination: Destination) => void;
  destination?: Destination | null;
  mode: 'create' | 'edit';
}

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'NGN', label: 'NGN - Nigerian Naira' },
];

const COUNTRY_CODE_OPTIONS = [
  { value: 'NG', label: 'NG - Nigeria' },
  { value: 'US', label: 'US - United States' },
  { value: 'GB', label: 'GB - United Kingdom' },
  { value: 'FR', label: 'FR - France' },
  { value: 'DE', label: 'DE - Germany' },
  { value: 'IT', label: 'IT - Italy' },
  { value: 'ES', label: 'ES - Spain' },
  { value: 'ZA', label: 'ZA - South Africa' },
  { value: 'KE', label: 'KE - Kenya' },
  { value: 'GH', label: 'GH - Ghana' },
];

export function DestinationFormModal({
  isOpen,
  onClose,
  onSuccess,
  destination,
  mode
}: DestinationFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // Key to force form reset

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormKey(prev => prev + 1); // Force form reset
      setError(null); // Clear any previous errors
    }
  }, [isOpen, mode, destination?.id]);

  // Form field configuration
  const fields: FormFieldConfig[] = [
    {
      name: 'name',
      label: 'Destination Name',
      type: 'text',
      placeholder: 'Enter destination name',
      description: 'The name of the destination',
      required: true,
      gridSpan: 12,
      validation: createRequiredStringValidation('Destination name is required'),
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Describe the destination...',
      description: 'Detailed description of the destination',
      required: true,
      gridSpan: 12,
      validation: createRequiredStringValidation('Description is required'),
    },
    {
      name: 'country',
      label: 'Country',
      type: 'select',
      placeholder: 'Select country',
      description: 'The country where this destination is located',
      required: true,
      options: [
        { value: 'Nigeria', label: 'Nigeria' },
        { value: 'United States', label: 'United States' },
        { value: 'United Kingdom', label: 'United Kingdom' },
        { value: 'France', label: 'France' },
        { value: 'Germany', label: 'Germany' },
        { value: 'Italy', label: 'Italy' },
        { value: 'Spain', label: 'Spain' },
        { value: 'South Africa', label: 'South Africa' },
        { value: 'Kenya', label: 'Kenya' },
        { value: 'Ghana', label: 'Ghana' },
      ],
      gridSpan: 6,
      validation: createRequiredStringValidation('Country is required'),
    },
    {
      name: 'country_code',
      label: 'Country Code',
      type: 'select',
      placeholder: 'Select country code',
      description: 'ISO country code',
      required: true,
      options: COUNTRY_CODE_OPTIONS,
      gridSpan: 6,
      validation: createRequiredStringValidation('Country code is required'),
    },
    {
      name: 'region',
      label: 'Region/State',
      type: 'text',
      placeholder: 'Enter region or state',
      description: 'Region, state, or province',
      gridSpan: 12,
    },
    {
      name: 'image_cover_url',
      label: 'Cover Image URL',
      type: 'url',
      placeholder: 'https://example.com/image.jpg',
      description: 'Main image for the destination',
      gridSpan: 12,
    },
    {
      name: 'best_time_to_visit',
      label: 'Best Time to Visit',
      type: 'text',
      placeholder: 'e.g., December to March',
      description: 'When is the best time to visit this destination?',
      gridSpan: 6,
    },
    {
      name: 'climate',
      label: 'Climate',
      type: 'text',
      placeholder: 'e.g., Tropical, Mediterranean',
      description: 'Climate description',
      gridSpan: 6,
    },
    {
      name: 'language',
      label: 'Language',
      type: 'text',
      placeholder: 'e.g., English, French',
      description: 'Primary language(s) spoken',
      gridSpan: 6,
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      placeholder: 'Select currency',
      description: 'Primary currency used',
      options: CURRENCY_OPTIONS,
      gridSpan: 6,
    },
    {
      name: 'image_gallery',
      label: 'Image Gallery',
      type: 'array',
      description: 'Add multiple images to showcase the destination',
      arrayConfig: {
        itemType: 'url',
        placeholder: 'Enter image URL',
        maxItems: 10,
        addButtonText: 'Add Image',
      },
      gridSpan: 12,
    },
    {
      name: 'highlights',
      label: 'Highlights',
      type: 'array',
      description: 'Key features and attractions of this destination',
      arrayConfig: {
        itemType: 'text',
        placeholder: 'Enter highlight',
        maxItems: 10,
        addButtonText: 'Add Highlight',
      },
      gridSpan: 12,
    },
    {
      name: 'featured',
      label: 'Featured Destination',
      type: 'switch',
      description: 'Featured destinations appear prominently on the homepage',
      gridSpan: 6,
    },
    {
      name: 'is_published',
      label: 'Published',
      type: 'switch',
      description: 'Published destinations are visible to the public',
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
      label: mode === 'create' ? 'Create Destination' : 'Update Destination',
      type: 'submit',
      variant: 'filled',
      color: 'blue',
      loading: isLoading,
    },
  ];

  // Initial values
  const getInitialValues = () => {
    if (destination && mode === 'edit') {
      return {
        name: destination.name,
        description: destination.description || '',
        country: destination.country,
        country_code: destination.country_code || '',
        region: destination.region || '',
        image_cover_url: destination.image_cover_url || '',
        best_time_to_visit: destination.best_time_to_visit || '',
        climate: destination.climate || '',
        language: destination.language || '',
        currency: destination.currency || 'USD',
        image_gallery: destination.image_gallery || [],
        highlights: destination.highlights || [],
        featured: destination.featured || false,
        is_published: destination.is_published || false,
      };
    }
    return {
      name: '',
      description: '',
      country: '',
      country_code: '',
      region: '',
      image_cover_url: '',
      best_time_to_visit: '',
      climate: '',
      language: '',
      currency: 'USD',
      image_gallery: [],
      highlights: [],
      featured: false,
      is_published: false,
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
        slug: generateSlug(values.name), // Auto-generate slug
        ...(mode === 'edit' && destination?.id ? { id: destination.id } : {}), // Add ID for updates
      };

      console.log('Form data being validated:', formData);
      console.log('Mode:', mode);
      console.log('Schema being used:', mode === 'create' ? 'createDestinationSchema' : 'updateDestinationSchema');

      // Validate the form data
      const schema = mode === 'create' ? createDestinationSchema : updateDestinationSchema;
      const validationResult = schema.safeParse(formData);
      
      if (!validationResult.success) {
        console.log('Validation errors:', validationResult.error.errors);
        const errors = validationResult.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
        throw new Error(`Validation failed: ${errors}`);
      }

      const sessionToken = localStorage.getItem('admin_session_token');
      const url = mode === 'create' 
        ? '/api/admin/destinations'
        : `/api/admin/destinations/${destination?.id}`;
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
        setError(data.error || `Failed to ${mode} destination`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error(`${mode} destination error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={mode === 'create' ? 'Create New Destination' : 'Edit Destination'}
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
