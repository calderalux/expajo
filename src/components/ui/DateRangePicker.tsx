'use client';

import React from 'react';
import { DatePickerInput } from '@mantine/dates';
import { cn } from '@/utils/cn';
import dayjs from 'dayjs';

export interface DateRangePickerProps {
  value: [Date | null, Date | null];
  onChange: (value: [Date | null, Date | null]) => void;
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  className?: string;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value,
  onChange,
  label,
  error,
  helperText,
  placeholder = 'Select date range',
  minDate,
  maxDate,
  disabled = false,
  className,
}) => {
  // Get tomorrow's date to disable today
  const tomorrow = dayjs().add(1, 'day').toDate();

  // Set minimum date to tomorrow (or use provided minDate if it's later)
  const effectiveMinDate = minDate
    ? minDate > tomorrow
      ? minDate
      : tomorrow
    : tomorrow;

  // Convert Date values to string format for Mantine
  const stringValue: [string | null, string | null] = [
    value[0] ? value[0].toISOString().split('T')[0] : null,
    value[1] ? value[1].toISOString().split('T')[0] : null,
  ];

  // Handle Mantine's string-based onChange
  const handleChange = (newValue: [string | null, string | null]) => {
    const dateValue: [Date | null, Date | null] = [
      newValue[0] ? new Date(newValue[0]) : null,
      newValue[1] ? new Date(newValue[1]) : null,
    ];
    onChange(dateValue);
  };

  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}

      <DatePickerInput
        type="range"
        value={stringValue}
        onChange={handleChange}
        placeholder={placeholder}
        minDate={effectiveMinDate}
        maxDate={maxDate}
        disabled={disabled}
        classNames={{
          root: cn('w-full', className),
          input: cn(
            'input h-12',
            error && 'border-red-500 focus:ring-red-500 focus:border-red-500'
          ),
        }}
        styles={{
          input: {
            border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '16px',
            transition: 'all 0.2s',
          },
        }}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export { DateRangePicker };
