import { z } from 'zod';

// Step 1: Services selection
export const step1Schema = z.object({
  services: z
    .array(z.string())
    .min(1, 'Please select at least one service')
    .refine(
      (services) => services.length > 0,
      'Please select at least one service'
    ),
});

// Step 2: Travel details
export const step2Schema = z
  .object({
    destination: z
      .string()
      .min(1, 'Destination is required')
      .min(2, 'Destination must be at least 2 characters'),
    arrivalDate: z
      .string()
      .min(1, 'Arrival date is required')
      .refine((date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      }, 'Arrival date must be in the future'),
    departureDate: z
      .string()
      .min(1, 'Departure date is required')
      .refine((date) => {
        const selectedDate = new Date(date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return selectedDate >= today;
      }, 'Departure date must be in the future'),
    adults: z
      .string()
      .min(1, 'Number of adults is required')
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => val >= 1 && val <= 20,
        'Adults must be between 1 and 20'
      ),
    children: z
      .string()
      .min(1, 'Number of children is required')
      .transform((val) => parseInt(val, 10))
      .refine(
        (val) => val >= 0 && val <= 20,
        'Children must be between 0 and 20'
      ),
  })
  .refine(
    (data) => {
      const arrival = new Date(data.arrivalDate);
      const departure = new Date(data.departureDate);
      return departure > arrival;
    },
    {
      message: 'Departure date must be after arrival date',
      path: ['departureDate'],
    }
  );

// Step 3: Contact information
export const step3Schema = z.object({
  fullName: z
    .string()
    .min(1, 'Full name is required')
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must be less than 100 characters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^\+[0-9]{1,4}[0-9]{10,11}$/,
      'Please enter a valid phone number with country code'
    ),
  consent: z
    .boolean()
    .refine((val) => val === true, 'You must agree to the terms to continue'),
});

// Combined schema for all steps
export const threeStepFormSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
});

// Service options for Step 1
export const serviceOptions = [
  { value: 'cab-rental', label: 'Cab/Car Rental' },
  { value: 'luxury-stays', label: 'Luxury stays' },
  { value: 'airport-pickup', label: 'Airport pickup' },
  { value: 'private-chef', label: 'Private chef' },
  { value: 'cultural-tours', label: 'Cultural tours' },
  { value: 'adventure', label: 'Adventure' },
] as const;

// Guest options for Step 2
export const guestOptions = Array.from({ length: 21 }, (_, i) => ({
  value: i.toString(),
  label: i === 0 ? '0' : i.toString(),
}));

// Type definitions
export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;
export type ThreeStepFormData = z.infer<typeof threeStepFormSchema>;
