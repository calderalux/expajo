'use client';

import React from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { motion } from 'framer-motion';
import { DatePickerInput, DatePicker } from '@mantine/dates';
import { Select, TextInput, Textarea, Checkbox } from '@mantine/core';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/Button';
import { ClientWrapper } from '@/components/ClientWrapper';
import { z } from 'zod';

export interface FormFieldConfig {
  name: string;
  type:
    | 'text'
    | 'email'
    | 'select'
    | 'date'
    | 'date-range'
    | 'textarea'
    | 'checkbox-group';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
  description?: string;
}

export interface FormAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'outline';
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface TanStackDynamicFormProps<T extends z.ZodType> {
  title: string;
  subtitle?: string;
  fields: FormFieldConfig[];
  actions: FormAction[];
  schema: T;
  onSubmit: (data: z.infer<T>) => void | Promise<void>;
  onPrimaryActionClick?: () => void;
  className?: string;
  isLoading?: boolean;
  defaultValues?: Partial<z.infer<T>>;
}

export function TanStackDynamicForm<T extends z.ZodType>({
  title,
  subtitle,
  fields,
  actions,
  schema,
  onSubmit,
  onPrimaryActionClick,
  className = '',
  isLoading = false,
  defaultValues = {},
}: TanStackDynamicFormProps<T>) {
  const form = useForm({
    defaultValues: {
      ...defaultValues,
      // Ensure date-range fields are initialized as arrays with null values
      ...fields.reduce((acc, field) => {
        if (field.type === 'date-range') {
          acc[field.name] = [null, null];
        }
        return acc;
      }, {} as any),
    } as z.infer<T>,
    validators: {
      onSubmit: schema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });

  const renderField = (field: FormFieldConfig) => {
    return (
      <form.Field key={field.name} name={field.name as any}>
        {(fieldApi) => {
          const fieldState = fieldApi.state;
          const value = fieldState.value || '';
          const isTouched = fieldState.meta.isTouched;

          // Validate field - show errors only when touched or form is submitted
          let hasError = false;
          let errorMessage = '';

          // Get the field schema for individual validation
          const fieldSchema = (schema as any).shape?.[field.name];
          if (fieldSchema && isTouched) {
            // For date-range fields, ensure we have an array
            const fieldValue =
              field.type === 'date-range' && !Array.isArray(value)
                ? [null, null]
                : value;

            // Validate field only if touched
            const validationResult = fieldSchema.safeParse(fieldValue);
            if (!validationResult.success) {
              hasError = true;
              errorMessage =
                validationResult.error.errors[0]?.message || 'Invalid input';
            }
          }

          return (
            <div className="space-y-2">
              {field.type === 'select' ? (
                <Select
                  label={field.label}
                  placeholder={
                    field.placeholder || `Select ${field.label.toLowerCase()}`
                  }
                  data={field.options || []}
                  value={value}
                  onChange={(val) => fieldApi.handleChange(val as any)}
                  onBlur={fieldApi.handleBlur}
                  leftSection={field.icon}
                  required={field.required}
                  error={errorMessage}
                  styles={{
                    input: {
                      height: '3rem',
                      fontSize: '1rem',
                      '&::placeholder': {
                        color: '#9ca3af',
                      },
                    },
                  }}
                />
              ) : field.type === 'date' ? (
                <DatePickerInput
                  label={field.label}
                  placeholder={field.placeholder || 'dd/mm/yy'}
                  value={value ? new Date(value + 'T00:00:00') : null}
                  onChange={(date) =>
                    fieldApi.handleChange(
                      (date && typeof date === 'object' && 'getFullYear' in date
                        ? `${(date as Date).getFullYear()}-${String((date as Date).getMonth() + 1).padStart(2, '0')}-${String((date as Date).getDate()).padStart(2, '0')}`
                        : '') as any
                    )
                  }
                  onBlur={fieldApi.handleBlur}
                  leftSection={field.icon}
                  required={field.required}
                  error={errorMessage}
                  styles={{
                    input: {
                      height: '3rem',
                      fontSize: '1rem',
                      '&::placeholder': {
                        color: '#9ca3af',
                      },
                    },
                  }}
                />
              ) : field.type === 'date-range' ? (
                <ClientWrapper
                  fallback={
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {field.label}
                        {field.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={
                            field.placeholder || 'Select travel dates'
                          }
                          className="w-full h-12 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          readOnly
                        />
                        {field.icon && (
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                            {field.icon}
                          </div>
                        )}
                      </div>
                      {errorMessage && (
                        <p className="text-sm text-red-600">{errorMessage}</p>
                      )}
                    </div>
                  }
                >
                  <DatePickerInput
                    type="range"
                    label={field.label}
                    placeholder={field.placeholder || 'Select travel dates'}
                    value={Array.isArray(value) ? value : [null, null]}
                    onChange={(dates) => {
                      // Handle date range selection properly
                      if (dates && Array.isArray(dates)) {
                        const [start, end] = dates;
                        // Allow partial selection during the selection process
                        if (start) {
                          if (end) {
                            // Both dates selected
                            fieldApi.handleChange([start, end] as any);
                          } else {
                            // Only start date selected (user is still selecting)
                            fieldApi.handleChange([start, null] as any);
                          }
                        } else {
                          // No dates selected
                          fieldApi.handleChange([] as any);
                        }
                      } else {
                        fieldApi.handleChange([] as any);
                      }
                    }}
                    onBlur={fieldApi.handleBlur}
                    leftSection={field.icon}
                    required={field.required}
                    minDate={new Date()}
                    allowSingleDateInRange={false}
                    error={errorMessage}
                    styles={{
                      input: {
                        height: '3rem',
                        fontSize: '1rem',
                        '&::placeholder': {
                          color: '#9ca3af',
                        },
                      },
                    }}
                  />
                </ClientWrapper>
              ) : field.type === 'textarea' ? (
                <Textarea
                  label={field.label}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => fieldApi.handleChange(e.target.value as any)}
                  onBlur={fieldApi.handleBlur}
                  leftSection={field.icon}
                  required={field.required}
                  error={errorMessage}
                  rows={3}
                  styles={{
                    input: {
                      fontSize: '1rem',
                      '&::placeholder': {
                        color: '#9ca3af',
                      },
                    },
                  }}
                />
              ) : field.type === 'checkbox-group' ? (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {field.label}
                    {field.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {field.options?.map((option) => (
                      <Checkbox
                        key={option.value}
                        label={option.label}
                        checked={
                          (value as string[])?.includes(option.value) || false
                        }
                        onChange={(e) => {
                          const currentValue = (value as string[]) || [];
                          if (e.currentTarget.checked) {
                            fieldApi.handleChange([
                              ...currentValue,
                              option.value,
                            ] as any);
                          } else {
                            fieldApi.handleChange(
                              currentValue.filter(
                                (v) => v !== option.value
                              ) as any
                            );
                          }
                        }}
                        onBlur={fieldApi.handleBlur}
                        styles={{
                          label: {
                            fontSize: '0.875rem',
                            color: '#374151',
                          },
                        }}
                      />
                    ))}
                  </div>
                  {hasError && (
                    <p className="text-sm text-red-600">{errorMessage}</p>
                  )}
                </div>
              ) : (
                <TextInput
                  label={field.label}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={value}
                  onChange={(e) => fieldApi.handleChange(e.target.value as any)}
                  onBlur={fieldApi.handleBlur}
                  leftSection={field.icon}
                  required={field.required}
                  error={errorMessage}
                  styles={{
                    input: {
                      height: '3rem',
                      fontSize: '1rem',
                      '&::placeholder': {
                        color: '#9ca3af',
                      },
                    },
                  }}
                />
              )}
            </div>
          );
        }}
      </form.Field>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={cn('max-w-4xl mx-auto', className)}
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-playfair text-gray-900 mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fields.map(renderField)}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            {actions.map((action) => (
              <Button
                key={action.id}
                type={action.type === 'primary' ? 'submit' : 'button'}
                variant={
                  action.type === 'primary'
                    ? 'primary'
                    : action.type === 'secondary'
                      ? 'secondary'
                      : 'outline'
                }
                onClick={async () => {
                  if (action.type === 'primary' && onPrimaryActionClick) {
                    // Validate all fields when Start Planning is clicked
                    const formData = form.state.values;
                    const validationResult = schema.safeParse(formData);

                    if (validationResult.success) {
                      onPrimaryActionClick();
                    } else {
                      // Mark all fields as touched to show validation errors
                      form.setFieldMeta('travel_dates', (prev) => ({
                        ...prev,
                        isTouched: true,
                      }));
                      form.setFieldMeta('location', (prev) => ({
                        ...prev,
                        isTouched: true,
                      }));
                      form.setFieldMeta('guests', (prev) => ({
                        ...prev,
                        isTouched: true,
                      }));

                      // Trigger validation to show errors for all fields
                      form.handleSubmit();
                    }
                  } else if (action.onClick) {
                    action.onClick();
                  }
                }}
                disabled={
                  action.disabled || isLoading || form.state.isSubmitting
                }
                isLoading={
                  action.loading ||
                  (action.type === 'primary' && form.state.isSubmitting)
                }
                className="flex-1"
              >
                {action.type === 'primary' && form.state.isSubmitting
                  ? 'Submitting...'
                  : action.label}
              </Button>
            ))}
          </div>
        </form>
      </div>
    </motion.div>
  );
}
