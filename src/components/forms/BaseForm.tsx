'use client';

import React, { useState } from 'react';
import { 
  TextInput, 
  Textarea, 
  Select, 
  Switch, 
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
  TextInput as MantineTextInput
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
  validation?: any;
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
  schema?: any;
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
  const [formData, setFormData] = useState<T>(initialValues as T);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    startLoading();
    try {
      await onSubmit(formData);
    } catch (err) {
      console.error('Form submission error:', err);
    } finally {
      stopLoading();
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const renderField = (field: FormFieldConfig) => {
    const fieldValue = formData[field.name as keyof T];
    const fieldError = fieldErrors[field.name];

    const fieldProps = {
      label: field.label,
      placeholder: field.placeholder,
      description: field.description,
      required: field.required,
      error: fieldError,
    };

    switch (field.type) {
      case 'text':
        return (
          <TextInput
            key={field.name}
            {...fieldProps}
            value={fieldValue as string || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
          />
        );

      case 'url':
        return (
          <TextInput
            key={field.name}
            {...fieldProps}
            value={fieldValue as string || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            type="url"
          />
        );

      case 'textarea':
        return (
          <Textarea
            key={field.name}
            {...fieldProps}
            value={fieldValue as string || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            minRows={3}
            maxRows={6}
            autosize
          />
        );

      case 'select':
        return (
          <Select
            key={field.name}
            {...fieldProps}
            value={fieldValue as string || ''}
            onChange={(value) => handleFieldChange(field.name, value)}
            data={field.options || []}
            searchable
            clearable
          />
        );

      case 'switch':
        return (
          <Switch
            key={field.name}
            {...fieldProps}
            checked={fieldValue as boolean || false}
            onChange={(e) => handleFieldChange(field.name, e.currentTarget.checked)}
            label={field.label}
            description={field.description}
          />
        );

      case 'multiselect':
        return (
          <Select
            key={field.name}
            {...fieldProps}
            value={fieldValue as any}
            onChange={(value) => handleFieldChange(field.name, value)}
            data={field.options || []}
            multiple
            searchable
            clearable
          />
        );

      case 'number':
        return (
          <NumberInput
            key={field.name}
            {...fieldProps}
            value={fieldValue as number || 0}
            onChange={(value) => handleFieldChange(field.name, value)}
            min={0}
            step={1}
          />
        );

      case 'array':
        return (
          <Box key={field.name}>
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
              {(fieldValue as string[] || []).map((item, index) => (
                <Group key={index} gap="xs">
                  <MantineTextInput
                    value={item}
                    onChange={(e) => {
                      const newArray = [...(fieldValue as string[] || [])];
                      newArray[index] = e.target.value;
                      handleFieldChange(field.name, newArray);
                    }}
                    placeholder={field.arrayConfig?.placeholder || 'Enter item'}
                    className="flex-1"
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => {
                      const newArray = (fieldValue as string[] || []).filter((_, i) => i !== index);
                      handleFieldChange(field.name, newArray);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              {(!field.arrayConfig?.maxItems || (fieldValue as string[] || []).length < field.arrayConfig.maxItems) && (
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    const newArray = [...(fieldValue as string[] || []), ''];
                    handleFieldChange(field.name, newArray);
                  }}
                >
                  {field.arrayConfig?.addButtonText || 'Add Item'}
                </Button>
              )}
            </Stack>
            {fieldError && (
              <Text size="xs" c="red" mt="xs">
                {fieldError}
              </Text>
            )}
          </Box>
        );

      case 'dynamicArray':
        return (
          <Box key={field.name}>
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
              {(fieldValue as string[] || []).map((item, index) => (
                <Group key={index} gap="xs">
                  <MantineTextInput
                    value={item}
                    onChange={(e) => {
                      const newArray = [...(fieldValue as string[] || [])];
                      newArray[index] = e.target.value;
                      handleFieldChange(field.name, newArray);
                    }}
                    placeholder={field.arrayConfig?.placeholder || 'Enter item'}
                    className="flex-1"
                  />
                  <ActionIcon
                    color="red"
                    variant="subtle"
                    onClick={() => {
                      const newArray = (fieldValue as string[] || []).filter((_, i) => i !== index);
                      handleFieldChange(field.name, newArray);
                    }}
                  >
                    <IconTrash size={16} />
                  </ActionIcon>
                </Group>
              ))}
              {(!field.arrayConfig?.maxItems || (fieldValue as string[] || []).length < field.arrayConfig.maxItems) && (
                <Button
                  variant="light"
                  size="sm"
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    const newArray = [...(fieldValue as string[] || []), ''];
                    handleFieldChange(field.name, newArray);
                  }}
                >
                  {field.arrayConfig?.addButtonText || 'Add Item'}
                </Button>
              )}
            </Stack>
            {fieldError && (
              <Text size="xs" c="red" mt="xs">
                {fieldError}
              </Text>
            )}
          </Box>
        );

      default:
        return null;
    }
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

        {/* Form */}
        <form onSubmit={handleSubmit}>
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