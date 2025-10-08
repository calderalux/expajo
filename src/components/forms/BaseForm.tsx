'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { z } from 'zod';
import { 
  Button, 
  Group, 
  Stack, 
  Grid, 
  Card,
  Title,
  Text,
  Alert,
  LoadingOverlay,
  Box,
  NumberInput,
  ActionIcon,
  Switch,
  TextInput,
  Textarea,
  Select
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAlertCircle, IconCheck, IconX, IconPlus, IconTrash } from '@tabler/icons-react';
import { cn } from '@/utils/cn';

// Types
export interface FormFieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'switch' | 'url' | 'multiselect' | 'number' | 'array' | 'dynamicArray';
  placeholder?: string;
  required?: boolean;
  description?: string;
  options?: Array<{ value: string; label: string }>;
  gridSpan?: number;
  validation?: z.ZodSchema<any>;
  arrayConfig?: {
    itemType: 'text' | 'url';
    placeholder?: string;
    maxItems?: number;
    addButtonText?: string;
  };
}

export interface FormAction {
  label: string;
  type: 'submit' | 'button' | 'reset';
  variant?: 'filled' | 'outline' | 'subtle' | 'light';
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export interface BaseFormProps<T = any> {
  title: string;
  description?: string;
  fields: FormFieldConfig[];
  actions: FormAction[];
  onSubmit: (values: T) => Promise<void> | void;
  initialValues?: Partial<T>;
  schema?: z.ZodSchema<T>;
  isLoading?: boolean;
  error?: string | null;
  className?: string;
}

// Reusable form component
export function BaseForm<T = any>({
  title,
  description,
  fields,
  actions,
  onSubmit,
  initialValues = {},
  schema,
  isLoading = false,
  error,
  className
}: BaseFormProps<T>) {
  const [loading, { open: startLoading, close: stopLoading }] = useDisclosure(false);
  const [formError, setFormError] = useState<string | null>(error || null);

  // Create default values object
  const defaultValues = fields.reduce((acc, field) => {
    const initialValue = initialValues[field.name as keyof T];
    if (initialValue !== undefined) {
      acc[field.name] = initialValue;
    } else {
      // Set default values based on field type
      switch (field.type) {
        case 'switch':
          acc[field.name] = false;
          break;
        case 'number':
          acc[field.name] = 0;
          break;
        case 'array':
        case 'dynamicArray':
          acc[field.name] = [];
          break;
        default:
          acc[field.name] = '';
      }
    }
    return acc;
  }, {} as Record<string, any>);

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      startLoading();
      setFormError(null);
      try {
        // Validate with schema if provided
        if (schema) {
          const validationResult = schema.safeParse(value);
          if (!validationResult.success) {
            const errors = validationResult.error.errors.map(err => 
              `${err.path.join('.')}: ${err.message}`
            ).join(', ');
            setFormError(`Validation failed: ${errors}`);
            return;
          }
          await onSubmit(validationResult.data as T);
        } else {
          await onSubmit(value as T);
        }
      } catch (err: any) {
        setFormError(err.message || 'An unexpected error occurred');
        console.error('Form submission error:', err);
      } finally {
        stopLoading();
      }
    },
  });

  // Update form error when prop changes
  useEffect(() => {
    setFormError(error || null);
  }, [error]);

  // Remove automatic validation on mount - let users interact first

  const renderField = (field: FormFieldConfig) => {
    return (
      <form.Field
        key={field.name}
        name={field.name}
        validators={{
          onChange: field.validation,
          onBlur: field.validation,
        }}
      >
        {(fieldState) => {
          const hasError = fieldState.state.meta.errors.length > 0;
          const errorMessage = hasError ? fieldState.state.meta.errors[0] : undefined;
          const isTouched = fieldState.state.meta.isTouched;
          
          // Debug logging
          if (hasError) {
            console.log(`Field ${field.name} has error:`, fieldState.state.meta.errors);
            console.log(`Field ${field.name} error message:`, errorMessage);
            console.log(`Field ${field.name} is touched:`, isTouched);
            console.log(`Form is submitted:`, form.state.isSubmitted);
          }
          
          // Show errors if field has been touched OR if form has been submitted
          const isFormSubmitted = form.state.isSubmitted;
          const shouldShowError = hasError && (isTouched || isFormSubmitted);
          
          // Handle different error message types
          let displayError = undefined;
          if (shouldShowError) {
            if (typeof errorMessage === 'string') {
              displayError = errorMessage;
            } else if (errorMessage && typeof errorMessage === 'object' && 'message' in errorMessage) {
              displayError = (errorMessage as any).message;
            } else {
              displayError = 'Invalid input';
            }
          }
          
          const fieldProps = {
            label: field.label,
            placeholder: field.placeholder,
            description: field.description,
            required: field.required,
            error: displayError,
            // Add visual error state for Mantine components
            errorProps: shouldShowError ? { color: 'red' } : undefined,
          };

          switch (field.type) {
            case 'text':
              return (
                <TextInput
                  {...fieldProps}
                  value={fieldState.state.value || ''}
                  onChange={(e) => {
                    fieldState.handleChange(e.target.value);
                    // Mark as touched and trigger validation
                    fieldState.handleBlur();
                    fieldState.validate('change');
                  }}
                  onBlur={() => {
                    fieldState.handleBlur();
                    fieldState.validate('blur');
                  }}
                />
              );

            case 'url':
              return (
                <TextInput
                  {...fieldProps}
                  value={fieldState.state.value || ''}
                  onChange={(e) => {
                    fieldState.handleChange(e.target.value);
                    fieldState.handleBlur();
                    fieldState.validate('change');
                  }}
                  onBlur={() => {
                    fieldState.handleBlur();
                    fieldState.validate('blur');
                  }}
                  type="url"
                />
              );

            case 'textarea':
              return (
                <Textarea
                  {...fieldProps}
                  value={fieldState.state.value || ''}
                  onChange={(e) => {
                    fieldState.handleChange(e.target.value);
                    fieldState.handleBlur();
                    fieldState.validate('change');
                  }}
                  onBlur={() => {
                    fieldState.handleBlur();
                    fieldState.validate('blur');
                  }}
                  minRows={3}
                  maxRows={6}
                  autosize
                />
              );

            case 'select':
              return (
                <Select
                  {...fieldProps}
                  value={fieldState.state.value || ''}
                  onChange={(value) => {
                    fieldState.handleChange(value);
                    fieldState.handleBlur();
                    fieldState.validate('change');
                  }}
                  onBlur={() => {
                    fieldState.handleBlur();
                    fieldState.validate('blur');
                  }}
                  data={field.options || []}
                  searchable
                  clearable
                />
              );

            case 'switch':
              return (
                <Switch
                  {...fieldProps}
                  checked={fieldState.state.value || false}
                  onChange={(e) => {
                    fieldState.handleChange(e.currentTarget.checked);
                    fieldState.handleBlur();
                    fieldState.validate('change');
                  }}
                  onBlur={() => {
                    fieldState.handleBlur();
                    fieldState.validate('blur');
                  }}
                  label={field.label}
                  description={field.description}
                />
              );

            case 'multiselect':
              return (
                <Select
                  {...fieldProps}
                  value={fieldState.state.value || []}
                  onChange={(value) => {
                    fieldState.handleChange(value);
                    fieldState.handleBlur();
                    fieldState.validate('change');
                  }}
                  onBlur={() => {
                    fieldState.handleBlur();
                    fieldState.validate('blur');
                  }}
                  data={field.options || []}
                  multiple
                  searchable
                  clearable
                />
              );

            case 'number':
              return (
                <NumberInput
                  {...fieldProps}
                  value={fieldState.state.value || 0}
                  onChange={(value) => {
                    fieldState.handleChange(value);
                    fieldState.handleBlur();
                    fieldState.validate('change');
                  }}
                  onBlur={() => {
                    fieldState.handleBlur();
                    fieldState.validate('blur');
                  }}
                  min={0}
                  step={1}
                />
              );

            case 'array':
            case 'dynamicArray':
              return (
                <Box>
                  <Text size="sm" fw={500} mb="xs">
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Text>
                  {field.description && (
                    <Text size="xs" c="dimmed" mb="sm">
                      {field.description}
                    </Text>
                  )}
                  <Stack gap="xs">
                    {(fieldState.state.value || []).map((item: string, index: number) => (
                      <Group key={index} gap="xs">
                        <TextInput
                          value={item}
                          onChange={(e) => {
                            const newArray = [...(fieldState.state.value || [])];
                            newArray[index] = e.target.value;
                            fieldState.handleChange(newArray);
                            fieldState.handleBlur();
                            fieldState.validate('change');
                          }}
                          onBlur={() => {
                            fieldState.handleBlur();
                            fieldState.validate('blur');
                          }}
                          placeholder={field.arrayConfig?.placeholder || 'Enter item'}
                          className="flex-1"
                        />
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => {
                            const newArray = (fieldState.state.value || []).filter((_: any, i: number) => i !== index);
                            fieldState.handleChange(newArray);
                          }}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    ))}
                    {(!field.arrayConfig?.maxItems || (fieldState.state.value || []).length < (field.arrayConfig?.maxItems || 10)) && (
                      <Button
                        variant="light"
                        size="sm"
                        leftSection={<IconPlus size={16} />}
                        onClick={() => {
                          const newArray = [...(fieldState.state.value || []), ''];
                          fieldState.handleChange(newArray);
                        }}
                      >
                        {field.arrayConfig?.addButtonText || 'Add Item'}
                      </Button>
                    )}
                  </Stack>
                  {shouldShowError && (
                    <Text size="xs" c="red" mt="xs">
                      {displayError}
                    </Text>
                  )}
                </Box>
              );

            default:
              return null;
          }
        }}
      </form.Field>
    );
  };

  return (
    <Card className={cn('relative', className)}>
      <LoadingOverlay visible={isLoading || loading} />
      
      <Stack gap="lg">
        {/* Header */}
        <div>
          <Title order={2} className="text-gray-900 font-playfair">
            {title}
          </Title>
          {description && (
            <Text size="sm" c="dimmed" className="mt-1">
              {description}
            </Text>
          )}
        </div>

        {/* Error Alert */}
        {formError && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Error"
            color="red"
            variant="light"
          >
            {formError}
          </Alert>
        )}

        {/* Form */}
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Validate all fields before submission
            form.validateAllFields('change');
            form.handleSubmit();
          }}
        >
          <Stack gap="md">
            <Grid>
              {fields.map((field) => (
                <Grid.Col key={field.name} span={field.gridSpan || 12}>
                  {renderField(field)}
                </Grid.Col>
              ))}
            </Grid>

            {/* Actions */}
            <Group justify="flex-end" gap="sm" className="pt-4">
              {actions.map((action, index) => (
                <Button
                  key={index}
                  type={action.type}
                  variant={action.variant || 'filled'}
                  color={action.color}
                  loading={action.loading || loading}
                  disabled={action.disabled || loading}
                  onClick={action.onClick}
                  style={{
                    backgroundColor: action.type === 'submit' ? '#4362FF' : undefined,
                    color: action.type === 'submit' ? 'white' : undefined,
                    border: action.type === 'submit' ? 'none' : undefined,
                  }}
                  leftSection={
                    action.type === 'submit' ? <IconCheck size={16} /> : 
                    action.type === 'reset' ? <IconX size={16} /> : undefined
                  }
                >
                  {action.label}
                </Button>
              ))}
            </Group>
          </Stack>
        </form>
      </Stack>
    </Card>
  );
}

// Specialized form components
export function CreateForm<T = any>(props: Omit<BaseFormProps<T>, 'actions'> & {
  onCreate: (values: T) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const { onCreate, onCancel, ...rest } = props;

  const actions: FormAction[] = [
    {
      label: 'Cancel',
      type: 'button',
      variant: 'outline',
      onClick: onCancel,
    },
    {
      label: 'Create',
      type: 'submit',
      variant: 'filled',
      color: 'blue',
    },
  ];

  return <BaseForm {...rest} actions={actions} onSubmit={onCreate} />;
}

export function EditForm<T = any>(props: Omit<BaseFormProps<T>, 'actions'> & {
  onUpdate: (values: T) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const { onUpdate, onCancel, ...rest } = props;

  const actions: FormAction[] = [
    {
      label: 'Cancel',
      type: 'button',
      variant: 'outline',
      onClick: onCancel,
    },
    {
      label: 'Update',
      type: 'submit',
      variant: 'filled',
      color: 'blue',
    },
  ];

  return <BaseForm {...rest} actions={actions} onSubmit={onUpdate} />;
}

// Form field helpers
export const createTextField = (
  name: string,
  label: string,
  options: Partial<FormFieldConfig> = {}
): FormFieldConfig => ({
  name,
  label,
  type: 'text',
  required: true,
  ...options,
});

export const createTextareaField = (
  name: string,
  label: string,
  options: Partial<FormFieldConfig> = {}
): FormFieldConfig => ({
  name,
  label,
  type: 'textarea',
  ...options,
});

export const createSelectField = (
  name: string,
  label: string,
  options: Array<{ value: string; label: string }>,
  config: Partial<FormFieldConfig> = {}
): FormFieldConfig => ({
  name,
  label,
  type: 'select',
  options,
  ...config,
});

export const createSwitchField = (
  name: string,
  label: string,
  options: Partial<FormFieldConfig> = {}
): FormFieldConfig => ({
  name,
  label,
  type: 'switch',
  ...options,
});

export const createUrlField = (
  name: string,
  label: string,
  options: Partial<FormFieldConfig> = {}
): FormFieldConfig => ({
  name,
  label,
  type: 'url',
  ...options,
});

export const createNumberField = (
  name: string,
  label: string,
  options: Partial<FormFieldConfig> = {}
): FormFieldConfig => ({
  name,
  label,
  type: 'number',
  ...options,
});

export const createArrayField = (
  name: string,
  label: string,
  arrayConfig: FormFieldConfig['arrayConfig'],
  options: Partial<FormFieldConfig> = {}
): FormFieldConfig => ({
  name,
  label,
  type: 'array',
  arrayConfig,
  ...options,
});

export const createDynamicArrayField = (
  name: string,
  label: string,
  arrayConfig: FormFieldConfig['arrayConfig'],
  options: Partial<FormFieldConfig> = {}
): FormFieldConfig => ({
  name,
  label,
  type: 'dynamicArray',
  arrayConfig,
  ...options,
});

// Zod validation helpers
export const createRequiredStringValidation = (message = 'This field is required') => 
  z.string().min(1, message);

export const createEmailValidation = (message = 'Please enter a valid email address') => 
  z.string().email(message);

export const createUrlValidation = (message = 'Please enter a valid URL') => 
  z.string().url(message);

export const createNumberValidation = (min = 0, message = 'Please enter a valid number') => 
  z.number().min(min, message);

export const createArrayValidation = (minLength = 1, message = 'At least one item is required') => 
  z.array(z.string()).min(minLength, message);

export const createOptionalStringValidation = () => 
  z.string().optional();

export const createBooleanValidation = () => 
  z.boolean();