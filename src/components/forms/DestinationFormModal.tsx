'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { 
  Modal, 
  Stack, 
  Group, 
  Text, 
  Button, 
  Alert,
  Image,
  TextInput,
  Textarea,
  ActionIcon,
  TagsInput
} from '@mantine/core';
import { IconUpload, IconX, IconAlertCircle } from '@tabler/icons-react';
import { 
  destinationSchema, 
  createDestinationSchema, 
  updateDestinationSchema,
  DestinationFormData,
  CreateDestinationData,
  UpdateDestinationData,
  generateSlug
} from '@/lib/validations/destinations';
import { DestinationService } from '@/lib/services/destinations';
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
  const [imageGallery, setImageGallery] = useState<string[]>([]);
  const [highlights, setHighlights] = useState<string[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  const form = useForm({
    defaultValues: {
      name: '',
      description: '',
      country: '',
      country_code: '',
      region: '',
      image_cover_url: '',
      best_time_to_visit: '',
      climate: '',
      language: '',
      currency: 'USD' as 'USD' | 'EUR' | 'GBP' | 'NGN',
      featured: false,
      is_published: false,
    },
    onSubmit: async ({ value }) => {
      setIsLoading(true);
      setError(null);

      try {
        // Prepare form data with required fields
        const formData = {
          ...value,
          slug: generateSlug(value.name), // Auto-generate slug
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
          body: JSON.stringify({
            ...validationResult.data,
            image_gallery: imageGallery,
            highlights: highlights,
          }),
        });

        const data = await response.json();
        
        if (data.success) {
          onSuccess(data.data);
          onClose();
        } else {
          setError(data.error || `Failed to ${mode} destination`);
        }
      } catch (err: any) {
        setError(err.message || 'An unexpected error occurred');
        console.error(`${mode} destination error:`, err);
      } finally {
        setIsLoading(false);
      }
    },
  });

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (destination && mode === 'edit') {
        form.setFieldValue('name', destination.name);
        form.setFieldValue('description', destination.description || '');
        form.setFieldValue('country', destination.country);
        form.setFieldValue('country_code', destination.country_code || '');
        form.setFieldValue('region', destination.region || '');
        form.setFieldValue('image_cover_url', destination.image_cover_url || '');
        form.setFieldValue('best_time_to_visit', destination.best_time_to_visit || '');
        form.setFieldValue('climate', destination.climate || '');
        form.setFieldValue('language', destination.language || '');
        form.setFieldValue('currency', (destination.currency as 'USD' | 'EUR' | 'GBP' | 'NGN') || 'USD');
        form.setFieldValue('featured', destination.featured || false);
        form.setFieldValue('is_published', destination.is_published || false);
        
        setImageGallery(destination.image_gallery || []);
        setHighlights(destination.highlights || []);
        setPreviewImages(destination.image_gallery || []);
      } else {
        form.reset();
        setImageGallery([]);
        setHighlights([]);
        setPreviewImages([]);
      }
    }
  }, [isOpen, destination, mode, form]);

  const handleImageUrlAdd = (url: string) => {
    if (url && !imageGallery.includes(url)) {
      setImageGallery([...imageGallery, url]);
      setPreviewImages([...previewImages, url]);
    }
  };

  const handleImageRemove = (index: number) => {
    const newGallery = imageGallery.filter((_, i) => i !== index);
    const newPreview = previewImages.filter((_, i) => i !== index);
    setImageGallery(newGallery);
    setPreviewImages(newPreview);
  };

  const handleHighlightAdd = (highlight: string) => {
    if (highlight && !highlights.includes(highlight)) {
      setHighlights([...highlights, highlight]);
    }
  };

  const handleHighlightRemove = (index: number) => {
    setHighlights(highlights.filter((_, i) => i !== index));
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Create New Destination' : 'Edit Destination'}
      size="xl"
      centered
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}>
        <Stack gap="lg">
          {/* Error Display */}
          {error && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              title="Error"
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          {/* Basic Information */}
          <div>
            <Text size="sm" fw={500} mb="xs">Basic Information</Text>
            <Group grow>
              <form.Field
                name="name"
              >
                {(field) => (
                  <TextInput
                    label="Destination Name"
                    placeholder="Enter destination name"
                    description="The name of the destination"
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                  />
                )}
              </form.Field>
            </Group>
            
            <form.Field
              name="description"
            >
              {(field) => (
                <Textarea
                  label="Description"
                  placeholder="Describe the destination..."
                  description="Detailed description of the destination"
                  required
                  rows={3}
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                />
              )}
            </form.Field>
          </div>

          {/* Location Information */}
          <div>
            <Text size="sm" fw={500} mb="xs">Location Information</Text>
            <Group grow>
              <form.Field
                name="country"
              >
                {(field) => (
                  <TextInput
                    label="Country"
                    placeholder="Enter country name"
                    description="The country where this destination is located"
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                  />
                )}
              </form.Field>
              
              <form.Field
                name="country_code"
              >
                {(field) => (
                  <TextInput
                    label="Country Code"
                    placeholder="e.g., NG, US, GB"
                    description="ISO country code"
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                  />
                )}
              </form.Field>
            </Group>
            
            <form.Field
              name="region"
            >
              {(field) => (
                <TextInput
                  label="Region/State"
                  placeholder="Enter region or state"
                  description="Region, state, or province"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                />
              )}
            </form.Field>
          </div>

          {/* Visual & Media */}
          <div>
            <Text size="sm" fw={500} mb="xs">Visual & Media</Text>
            <form.Field
              name="image_cover_url"
            >
              {(field) => (
                <TextInput
                  label="Cover Image URL"
                  placeholder="https://example.com/image.jpg"
                  description="Main image for the destination"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                />
              )}
            </form.Field>
          </div>

          {/* Travel Information */}
          <div>
            <Text size="sm" fw={500} mb="xs">Travel Information</Text>
            <Group grow>
              <form.Field
                name="best_time_to_visit"
              >
                {(field) => (
                  <TextInput
                    label="Best Time to Visit"
                    placeholder="e.g., December to March"
                    description="When is the best time to visit this destination?"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                  />
                )}
              </form.Field>
              
              <form.Field
                name="climate"
              >
                {(field) => (
                  <TextInput
                    label="Climate"
                    placeholder="e.g., Tropical, Mediterranean"
                    description="Climate description"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                  />
                )}
              </form.Field>
            </Group>
            
            <Group grow>
              <form.Field
                name="language"
              >
                {(field) => (
                  <TextInput
                    label="Language"
                    placeholder="e.g., English, French"
                    description="Primary language(s) spoken"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                  />
                )}
              </form.Field>
              
              <form.Field
                name="currency"
              >
                {(field) => (
                  <TextInput
                    label="Currency"
                    placeholder="e.g., USD, EUR, NGN"
                    description="Primary currency used"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value as 'USD' | 'EUR' | 'GBP' | 'NGN')}
                    error={field.state.meta.errors.length > 0 ? field.state.meta.errors[0] : undefined}
                  />
                )}
              </form.Field>
            </Group>
          </div>

          {/* Image Gallery Section */}
          <div>
            <Text size="sm" fw={500} mb="xs">Image Gallery</Text>
            <Text size="xs" c="dimmed" mb="md">
              Add multiple images to showcase the destination
            </Text>
            
            {/* Add Image URL */}
            <Group mb="md">
              <TextInput
                placeholder="Enter image URL"
                style={{ flex: 1 }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const input = e.target as HTMLInputElement;
                    handleImageUrlAdd(input.value);
                    input.value = '';
                  }
                }}
              />
              <Button
                variant="outline"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter image URL"]') as HTMLInputElement;
                  if (input?.value) {
                    handleImageUrlAdd(input.value);
                    input.value = '';
                  }
                }}
              >
                Add Image
              </Button>
            </Group>

            {/* Image Previews */}
            {previewImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={url}
                      alt={`Gallery image ${index + 1}`}
                      height={120}
                      className="rounded-lg object-cover"
                      fallbackSrc="/placeholder-image.jpg"
                    />
                    <ActionIcon
                      color="red"
                      variant="filled"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleImageRemove(index)}
                    >
                      <IconX size={12} />
                    </ActionIcon>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Highlights Section */}
          <div>
            <Text size="sm" fw={500} mb="xs">Highlights</Text>
            <Text size="xs" c="dimmed" mb="md">
              Key features and attractions of this destination
            </Text>
            
            <TagsInput
              placeholder="Add highlights (press Enter to add)"
              value={highlights}
              onChange={setHighlights}
              maxTags={10}
              splitChars={[',', ' ']}
            />
          </div>

          {/* Settings */}
          <div>
            <Text size="sm" fw={500} mb="xs">Settings</Text>
            <Group grow>
              <form.Field
                name="featured"
              >
                {(field) => (
                  <div>
                    <Text size="sm" fw={500} mb="xs">Featured Destination</Text>
                    <Text size="xs" c="dimmed" mb="md">
                      Featured destinations appear prominently on the homepage
                    </Text>
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="mr-2"
                    />
                    <Text size="sm" component="span">
                      {field.state.value ? 'Yes' : 'No'}
                    </Text>
                    {field.state.meta.errors.length > 0 && (
                      <Text size="xs" c="red" mt="xs">
                        {field.state.meta.errors[0]}
                      </Text>
                    )}
                  </div>
                )}
              </form.Field>
              
              <form.Field
                name="is_published"
              >
                {(field) => (
                  <div>
                    <Text size="sm" fw={500} mb="xs">Published</Text>
                    <Text size="xs" c="dimmed" mb="md">
                      Published destinations are visible to the public
                    </Text>
                    <input
                      type="checkbox"
                      checked={field.state.value}
                      onChange={(e) => field.handleChange(e.target.checked)}
                      className="mr-2"
                    />
                    <Text size="sm" component="span">
                      {field.state.value ? 'Yes' : 'No'}
                    </Text>
                    {field.state.meta.errors.length > 0 && (
                      <Text size="xs" c="red" mt="xs">
                        {field.state.meta.errors[0]}
                      </Text>
                    )}
                  </div>
                )}
              </form.Field>
            </Group>
          </div>

          {/* Action Buttons */}
          <Group justify="flex-end" gap="sm" className="pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="filled"
              color="blue"
              loading={isLoading}
              style={{
                backgroundColor: '#4362FF',
                color: 'white',
                border: 'none',
              }}
            >
              {mode === 'create' ? 'Create Destination' : 'Update Destination'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
