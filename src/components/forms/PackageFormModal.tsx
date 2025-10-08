'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Modal } from '@/components/ui/Modal';
import {
  BaseForm,
  FormFieldConfig,
  FormAction,
  createRequiredStringValidation,
  createNumberValidation,
} from '@/components/forms/BaseForm';
import { PackageRelationshipsManager } from '@/components/forms/PackageRelationshipsManager';
import {
  packageCreateSchema,
  packageUpdateSchema,
} from '@/lib/validations/packages';
import { PackageCategory } from '@/lib/supabase';
import { Database } from '@/types/database';
import { Destination } from '@/lib/services/destinations';
import { Button } from '@/components/ui/Button';
import { Settings, Link } from 'lucide-react';

type Package = Database['public']['Tables']['packages']['Row'];

interface PackageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (packageData: Package) => void;
  packageData?: Package | null;
  mode: 'create' | 'edit';
}

export function PackageFormModal({
  isOpen,
  onClose,
  onSuccess,
  packageData,
  mode,
}: PackageFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0); // Key to force form reset
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(false);
  const [showRelationshipsManager, setShowRelationshipsManager] =
    useState(false);

  // Fetch destinations when modal opens
  const fetchDestinations = useCallback(async () => {
    if (destinations.length > 0) return; // Already fetched

    setDestinationsLoading(true);
    try {
      const sessionToken = localStorage.getItem('admin_session_token');
      const response = await fetch('/api/admin/destinations?limit=1000', {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      if (result.success) {
        setDestinations(result.data || []);
      } else {
        console.error('Failed to fetch destinations:', result.error);
      }
    } catch (error) {
      console.error('Error fetching destinations:', error);
    } finally {
      setDestinationsLoading(false);
    }
  }, [destinations.length]);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (isOpen) {
      setFormKey((prev) => prev + 1); // Force form reset
      setError(null); // Clear any previous errors
      fetchDestinations(); // Fetch destinations when modal opens
    }
  }, [isOpen, mode, packageData?.id, fetchDestinations]);

  // Form field configuration
  const fields: FormFieldConfig[] = [
    {
      name: 'title',
      label: 'Package Title',
      type: 'text',
      placeholder: 'Enter package title',
      description: 'The name of the travel package',
      required: true,
      gridSpan: 12,
      validation: createRequiredStringValidation('Package title is required'),
    },
    {
      name: 'destination_id',
      label: 'Destination',
      type: 'select',
      placeholder: destinationsLoading
        ? 'Loading destinations...'
        : 'Select destination',
      description: 'The destination for this package',
      required: true,
      gridSpan: 6,
      validation: createRequiredStringValidation('Destination is required'),
      options: [
        { value: '', label: 'Select destination...' },
        ...destinations.map((dest) => ({
          value: dest.id,
          label: `${dest.name}${dest.country ? ` (${dest.country})` : ''}`,
        })),
      ],
    },
    {
      name: 'category',
      label: 'Category',
      type: 'select',
      placeholder: 'Select category (optional)',
      description: 'Package category or type',
      gridSpan: 6,
      options: [
        { value: '', label: 'Select category...' },
        { value: PackageCategory.ADVENTURE, label: 'Adventure' },
        { value: PackageCategory.CULTURAL, label: 'Cultural' },
        { value: PackageCategory.LUXURY, label: 'Luxury' },
        { value: PackageCategory.BEACH, label: 'Beach' },
        { value: PackageCategory.CITY, label: 'City' },
        { value: PackageCategory.NATURE, label: 'Nature' },
      ],
    },
    {
      name: 'summary',
      label: 'Summary',
      type: 'textarea',
      placeholder: 'Brief package summary...',
      description: 'Short description of the package',
      gridSpan: 12,
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      placeholder: 'Detailed package description...',
      description: 'Full description of the package',
      gridSpan: 12,
    },
    {
      name: 'base_price',
      label: 'Base Price',
      type: 'number',
      placeholder: '0.00',
      description: 'Starting price for the package',
      required: true,
      gridSpan: 4,
      validation: createNumberValidation(
        0,
        'Base price must be greater than 0'
      ),
    },
    {
      name: 'currency',
      label: 'Currency',
      type: 'select',
      placeholder: 'Select currency',
      description: 'Package currency',
      required: true,
      gridSpan: 4,
      options: [{ value: 'USD', label: 'USD (US Dollar)' }],
      validation: createRequiredStringValidation('Currency is required'),
    },
    {
      name: 'duration_days',
      label: 'Duration (Days)',
      type: 'number',
      placeholder: '0',
      description: 'Package duration in days',
      gridSpan: 4,
      validation: createNumberValidation(1, 'Duration must be at least 1 day'),
    },
    {
      name: 'group_size_limit',
      label: 'Group Size Limit',
      type: 'number',
      placeholder: '0',
      description: 'Maximum group size',
      gridSpan: 6,
      validation: createNumberValidation(1, 'Group size must be at least 1'),
    },
    {
      name: 'discount_percent',
      label: 'Discount (%)',
      type: 'number',
      placeholder: '0',
      description: 'Discount percentage (0-100)',
      gridSpan: 6,
      validation: createNumberValidation(0, 'Discount must be 0 or greater'),
    },
    {
      name: 'featured',
      label: 'Featured Package',
      type: 'switch',
      description: 'Mark as featured package',
      gridSpan: 4,
    },
    {
      name: 'luxury_certified',
      label: 'Luxury Certified',
      type: 'switch',
      description: 'Mark as luxury certified',
      gridSpan: 4,
    },
    {
      name: 'is_published',
      label: 'Published',
      type: 'switch',
      description: 'Make package visible to users',
      gridSpan: 4,
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
    ...(mode === 'edit' && packageData?.id
      ? [
          {
            label: 'Manage Relationships',
            type: 'button' as const,
            variant: 'outline' as const,
            onClick: () => setShowRelationshipsManager(true),
          },
        ]
      : []),
    {
      label: mode === 'create' ? 'Create Package' : 'Update Package',
      type: 'submit',
      variant: 'filled',
      color: 'primary',
      loading: isLoading,
    },
  ];

  // Initial values
  const getInitialValues = () => {
    if (packageData && mode === 'edit') {
      return {
        title: packageData.title,
        destination_id: packageData.destination_id,
        category: packageData.category || '',
        summary: packageData.summary || '',
        description: packageData.description || '',
        base_price: packageData.base_price,
        currency: packageData.currency,
        duration_days: packageData.duration_days || '',
        group_size_limit: packageData.group_size_limit || '',
        discount_percent: packageData.discount_percent || '',
        featured: packageData.featured || false,
        luxury_certified: packageData.luxury_certified || false,
        is_published: packageData.is_published || false,
      };
    }
    return {
      title: '',
      destination_id: '',
      category: '',
      summary: '',
      description: '',
      base_price: '',
      currency: 'USD',
      duration_days: '',
      group_size_limit: '',
      discount_percent: '',
      featured: false,
      luxury_certified: false,
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
        slug: null, // Auto-generated or handled separately
        lead_partner_id: null, // To be handled separately
        inclusions: null, // To be handled separately
        exclusions: null, // To be handled separately
        itinerary: null, // To be handled separately
        avg_rating: null, // Auto-calculated
        review_count: null, // Auto-calculated
        availability: null, // To be handled separately
        ...(mode === 'edit' && packageData?.id ? { id: packageData.id } : {}), // Add ID for updates
      };

      // Validate the form data
      const schema =
        mode === 'create' ? packageCreateSchema : packageUpdateSchema;
      const validationResult = schema.safeParse(formData);

      if (!validationResult.success) {
        const errors = validationResult.error.errors
          .map((err) => `${err.path.join('.')}: ${err.message}`)
          .join(', ');
        throw new Error(`Validation failed: ${errors}`);
      }

      const sessionToken = localStorage.getItem('admin_session_token');
      const url =
        mode === 'create'
          ? '/api/admin/packages'
          : `/api/admin/packages/${packageData?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(validationResult.data),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess(data.data);
        handleClose();
      } else {
        setError(data.error || `Failed to ${mode} package`);
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
      console.error(`${mode} package error:`, err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title={mode === 'create' ? 'Create New Package' : 'Edit Package'}
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

      {/* Relationships Manager Modal */}
      {mode === 'edit' && packageData?.id && (
        <PackageRelationshipsManager
          packageId={packageData.id}
          isOpen={showRelationshipsManager}
          onClose={() => setShowRelationshipsManager(false)}
          onSuccess={() => {
            // Optionally refresh package data or show success message
            console.log('Relationships updated successfully');
          }}
        />
      )}
    </>
  );
}
