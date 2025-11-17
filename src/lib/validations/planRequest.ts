import { z } from 'zod';

// Dynamic destinations will be fetched from API
// This will be populated at runtime

// Plan request form schema using Zod - core fields only
export const planRequestSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  travel_dates: z
    .array(
      z.union([
        z.date(),
        z.string().transform((str) => new Date(str)),
        z.null(),
      ])
    )
    .refine((dates) => {
      // Require exactly 2 dates
      if (!dates || dates.length !== 2) return false;

      const [arrival, departure] = dates;
      if (!arrival || !departure) return false;

      // Convert to Date objects if they're strings
      const arrivalDate = arrival instanceof Date ? arrival : new Date(arrival);
      const departureDate =
        departure instanceof Date ? departure : new Date(departure);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return arrivalDate >= today && departureDate > arrivalDate;
    }, 'Select travel dates')
    .transform((dates) => {
      // Filter out null values and ensure we have exactly 2 dates for final validation
      const validDates = dates
        .filter((date) => date !== null)
        .map((date) => {
          if (date instanceof Date) return date;
          if (typeof date === 'string') return new Date(date);
          return new Date(); // fallback
        });

      return validDates;
    }),
  guests: z
    .string()
    .min(1, 'Number of guests is required')
    .transform((val) => parseInt(val, 10))
    .refine(
      (val) => val >= 1 && val <= 20,
      'Number of guests must be between 1 and 20'
    ),
});

export type PlanRequestFormData = z.infer<typeof planRequestSchema>;

// Field configuration for dynamic form
export interface FormFieldConfig {
  name: keyof PlanRequestFormData;
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

// Form field configurations - core fields only
// Note: location options will be populated dynamically from API
export const planRequestFields: FormFieldConfig[] = [
  {
    name: 'location',
    type: 'select',
    label: 'Destination',
    placeholder: 'Select your destination',
    required: true,
    options: [], // Will be populated dynamically
  },
  {
    name: 'travel_dates',
    type: 'date-range',
    label: 'Travel Dates',
    placeholder: 'Select your travel dates',
    required: true,
  },
  {
    name: 'guests',
    type: 'select',
    label: 'Number of Guests',
    placeholder: 'Select number of guests',
    required: true,
    options: Array.from({ length: 20 }, (_, i) => ({
      value: (i + 1).toString(),
      label: (i + 1).toString(),
    })),
  },
];
