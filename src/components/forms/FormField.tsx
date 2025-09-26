import React from 'react';
import { FieldApi } from '@tanstack/react-form';
import { Input } from '@/components/ui/Input';
import { DateRangePicker } from '@/components/ui/DateRangePicker';

export interface FormFieldProps {
  field: any;
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'date' | 'dateRange' | 'textarea';
  placeholder?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  label,
  type = 'text',
  placeholder,
  leftIcon,
  rightIcon,
  disabled = false,
  className,
}) => {
  const handleChange = (value: any) => {
    field.handleChange(value);
  };

  const handleBlur = () => {
    field.handleBlur();
  };

  if (type === 'dateRange') {
    return (
      <DateRangePicker
        label={label}
        value={field.state.value || [null, null]}
        onChange={handleChange}
        error={field.state.meta.errors[0]}
        disabled={disabled}
        className={className}
      />
    );
  }

  if (type === 'textarea') {
    return (
      <div className="w-full">
        {label && (
          <label className="label">
            {label}
          </label>
        )}
        <textarea
          value={field.state.value || ''}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`input min-h-[100px] resize-vertical ${className || ''}`}
        />
        {field.state.meta.errors[0] && (
          <p className="mt-1 text-sm text-red-600">{field.state.meta.errors[0]}</p>
        )}
      </div>
    );
  }

  return (
    <Input
      label={label}
      type={type}
      value={field.state.value || ''}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder}
      error={field.state.meta.errors[0]}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      disabled={disabled}
      className={className}
    />
  );
};
