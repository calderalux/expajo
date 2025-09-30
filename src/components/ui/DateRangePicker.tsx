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
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}

      <DatePickerInput
        type="range"
        value={value}
        onChange={(dates) => onChange(dates as [Date | null, Date | null])}
        placeholder={placeholder}
        minDate={minDate}
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
