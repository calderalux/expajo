import { z } from 'zod';

// Nigerian states validation
const nigerianStates = [
  'abuja',
  'lagos',
  'calabar',
  'kano',
  'ibadan',
  'port-harcourt',
  'benin',
  'kaduna',
  'maiduguri',
  'zaria',
  'aba',
  'jos',
  'ilorin',
  'oyo',
  'enugu',
  'abeokuta',
  'sokoto',
  'onitsha',
  'warri',
  'akure',
] as const;

// Plan request form schema using Zod - core fields only
export const planRequestSchema = z.object({
  location: z
    .string()
    .min(1, 'Location is required')
    .refine(
      (val) => nigerianStates.includes(val.toLowerCase() as any),
      'Please select a valid Nigerian location'
    ),
  travel_date: z
    .string()
    .min(1, 'Travel date is required')
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, 'Travel date must be in the future'),
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
  type: 'text' | 'email' | 'select' | 'date' | 'textarea' | 'checkbox-group';
  label: string;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  icon?: React.ReactNode;
  description?: string;
}

// Form field configurations - core fields only
export const planRequestFields: FormFieldConfig[] = [
  {
    name: 'location',
    type: 'select',
    label: 'State/City',
    placeholder: 'Select your destination',
    required: true,
    options: nigerianStates.map((state) => ({
      value: state,
      label: state.charAt(0).toUpperCase() + state.slice(1).replace('-', ' '),
    })),
  },
  {
    name: 'travel_date',
    type: 'date',
    label: 'Travel Date',
    placeholder: 'Select your travel date',
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
      label: i === 0 ? '1 Adult' : `${i + 1} Adults`,
    })),
  },
];
