import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DatePickerInput } from '@mantine/dates';
import { cn } from '@/utils/cn';

export interface FormField {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password' | 'select' | 'date' | 'number' | 'textarea';
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface FormAction {
  id: string;
  label: string;
  type: 'primary' | 'secondary' | 'outline';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export interface DynamicFormProps {
  title: string;
  subtitle?: string;
  fields: FormField[];
  actions: FormAction[];
  onSubmit: (data: Record<string, any>) => void;
  className?: string;
  isLoading?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({
  title,
  subtitle,
  fields,
  actions,
  onSubmit,
  className = '',
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || value.toString().trim() === '')) {
      return `${field.label} is required`;
    }

    if (field.validation) {
      const { min, max, pattern, message } = field.validation;
      
      if (min !== undefined && value < min) {
        return message || `${field.label} must be at least ${min}`;
      }
      
      if (max !== undefined && value > max) {
        return message || `${field.label} must be at most ${max}`;
      }
      
      if (pattern && !new RegExp(pattern).test(value)) {
        return message || `${field.label} format is invalid`;
      }
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const newErrors: Record<string, string> = {};
    let isValid = true;

    fields.forEach(field => {
      const value = formData[field.name];
      const error = validateField(field, value);
      
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    if (isValid) {
      onSubmit(formData);
    }
  };

  const renderField = (field: FormField) => {
    const hasError = !!errors[field.name];
    const value = formData[field.name] || '';

    return (
      <div key={field.id} className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {field.label}
          {field.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        
        <div className="relative">
          {field.icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {field.icon}
            </div>
          )}
          
          {field.type === 'select' ? (
            <select
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              className={cn(
                'w-full px-4 py-3 border rounded-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 appearance-none cursor-pointer',
                field.icon ? 'pl-10' : 'pl-4',
                hasError ? 'border-red-500' : 'border-gray-300',
                field.disabled && 'opacity-50 cursor-not-allowed'
              )}
              required={field.required}
              disabled={field.disabled}
            >
              <option value="" disabled>
                {field.placeholder || `Select ${field.label.toLowerCase()}`}
              </option>
              {field.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : field.type === 'date' ? (
            <div className="relative">
              {field.icon && (
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 z-10">
                  {field.icon}
                </div>
              )}
              <DatePickerInput
                value={value ? new Date(value) : null}
                onChange={(date) => handleInputChange(field.name, date ? date.toISOString().split('T')[0] : '')}
                placeholder={field.placeholder || 'dd/mm/yy'}
                disabled={field.disabled}
                className={cn(
                  'w-full',
                  hasError ? 'border-red-500' : 'border-gray-300'
                )}
                styles={{
                  input: {
                    paddingLeft: field.icon ? '2.5rem' : '1rem',
                    paddingRight: '2.5rem',
                    height: '3rem',
                    border: hasError ? '1px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    '&:focus': {
                      borderColor: '#4362FF',
                      boxShadow: '0 0 0 2px rgba(67, 98, 255, 0.2)',
                    },
                  },
                }}
              />
            </div>
          ) : field.type === 'textarea' ? (
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                'w-full px-4 py-3 border rounded-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200 resize-none',
                field.icon ? 'pl-10' : 'pl-4',
                hasError ? 'border-red-500' : 'border-gray-300',
                field.disabled && 'opacity-50 cursor-not-allowed'
              )}
              rows={3}
              required={field.required}
              disabled={field.disabled}
            />
          ) : (
            <input
              type={field.type}
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={cn(
                'w-full px-4 py-3 border rounded-input focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200',
                field.icon ? 'pl-10' : 'pl-4',
                hasError ? 'border-red-500' : 'border-gray-300',
                field.disabled && 'opacity-50 cursor-not-allowed'
              )}
              required={field.required}
              disabled={field.disabled}
              min={field.validation?.min}
              max={field.validation?.max}
              pattern={field.validation?.pattern}
            />
          )}
          
          {(field.type === 'select' || field.type === 'date') && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6,9 12,15 18,9"></polyline>
              </svg>
            </div>
          )}
        </div>
        
        {hasError && (
          <p className="text-sm text-red-600">{errors[field.name]}</p>
        )}
      </div>
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
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fields.map(renderField)}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            {actions.map((action) => (
              <button
                key={action.id}
                type={action.type === 'primary' ? 'submit' : 'button'}
                onClick={action.onClick}
                disabled={action.disabled || isLoading}
                className={cn(
                  'flex-1 px-8 py-3 rounded-full font-medium transition-all duration-200 flex items-center justify-center',
                  action.type === 'primary' && 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg',
                  action.type === 'secondary' && 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white',
                  action.type === 'outline' && 'bg-white text-primary border-2 border-primary hover:bg-primary hover:text-white',
                  (action.disabled || isLoading) && 'opacity-50 cursor-not-allowed'
                )}
              >
                {action.loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {action.label}
              </button>
            ))}
          </div>
        </form>
      </div>
    </motion.div>
  );
};
