import { z } from 'zod';
import { 
  BookingStatus, 
  PaymentStatus, 
  PartnerStatus, 
  MembershipTier, 
  CurrencyEnum, 
  PackageCategory, 
  ItemType 
} from './supabase';

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Booking schemas
export const bookingSchema = z.object({
  packageId: z.string().min(1, 'Package ID is required'),
  startDate: z.date({
    required_error: 'Start date is required',
  }),
  endDate: z.date({
    required_error: 'End date is required',
  }),
  travelerCount: z.number().min(1, 'At least 1 traveler is required').max(20, 'Maximum 20 travelers allowed'),
  concierge: z.boolean().optional(),
  selectedOptions: z.array(z.string()).optional(),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const bookingStatusSchema = z.enum([
  BookingStatus.PENDING,
  BookingStatus.CONFIRMED,
  BookingStatus.CANCELLED,
  BookingStatus.COMPLETED
]);

export const paymentStatusSchema = z.enum([
  PaymentStatus.PENDING,
  PaymentStatus.PAID,
  PaymentStatus.FAILED,
  PaymentStatus.REFUNDED
]);

// Search schemas
export const searchSchema = z.object({
  location: z.string().min(1, 'Location is required'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  guests: z.number().min(1).max(20).optional(),
  priceMin: z.number().min(0).optional(),
  priceMax: z.number().min(0).optional(),
});

// Profile schemas
export const profileSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatar: z.string().url('Please enter a valid URL').optional(),
});

// Review schemas
export const reviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  packageId: z.string().min(1, 'Package ID is required'),
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
  comment: z.string().min(10, 'Comment must be at least 10 characters').max(500, 'Comment must be less than 500 characters').optional(),
});

// Contact schemas
export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(1000, 'Message must be less than 1000 characters'),
});

// Package schemas
export const packageSchema = z.object({
  destinationId: z.string().min(1, 'Destination ID is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(50, 'Slug must be less than 50 characters').optional(),
  summary: z.string().max(200, 'Summary must be less than 200 characters').optional(),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters').optional(),
  category: z.nativeEnum(PackageCategory).optional(),
  leadPartnerId: z.string().optional(),
  durationDays: z.number().min(1, 'Duration must be at least 1 day').max(365, 'Duration cannot exceed 365 days').optional(),
  groupSizeLimit: z.number().min(1, 'Group size limit must be at least 1').max(100, 'Group size limit cannot exceed 100').optional(),
  basePrice: z.number().min(0, 'Base price must be non-negative'),
  currency: z.nativeEnum(CurrencyEnum).default(CurrencyEnum.USD),
  discountPercent: z.number().min(0, 'Discount percent must be non-negative').max(100, 'Discount percent cannot exceed 100').optional(),
  featured: z.boolean().optional(),
  luxuryCertified: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

export const packageCategorySchema = z.nativeEnum(PackageCategory);
export const currencySchema = z.nativeEnum(CurrencyEnum);

// Destination schemas
export const destinationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  slug: z.string().min(3, 'Slug must be at least 3 characters').max(50, 'Slug must be less than 50 characters').optional(),
  description: z.string().max(2000, 'Description must be less than 2000 characters').optional(),
  country: z.string().min(2, 'Country must be at least 2 characters').max(50, 'Country must be less than 50 characters').default('Nigeria'),
  countryCode: z.string().length(2, 'Country code must be exactly 2 characters').optional(),
  region: z.string().max(100, 'Region must be less than 100 characters').optional(),
  imageCoverUrl: z.string().url('Please enter a valid URL').optional(),
  featured: z.boolean().optional(),
  isPublished: z.boolean().optional(),
});

// Partner schemas
export const partnerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  type: z.string().max(50, 'Type must be less than 50 characters').optional(),
  status: z.nativeEnum(PartnerStatus).default(PartnerStatus.PENDING),
  logoUrl: z.string().url('Please enter a valid URL').optional(),
  website: z.string().url('Please enter a valid URL').optional(),
  contactEmail: z.string().email('Please enter a valid email address').optional(),
  contactPhone: z.string().max(20, 'Phone number must be less than 20 characters').optional(),
});

export const partnerStatusSchema = z.nativeEnum(PartnerStatus);

// Package Item schemas
export const packageItemSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  code: z.string().max(20, 'Code must be less than 20 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  itemType: z.nativeEnum(ItemType),
});

export const packageItemOptionSchema = z.object({
  packageItemId: z.string().min(1, 'Package item ID is required'),
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  price: z.number().min(0, 'Price must be non-negative').default(0),
  isActive: z.boolean().optional(),
});

export const itemTypeSchema = z.nativeEnum(ItemType);

// Profile schemas
export const profileUpdateSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100, 'Full name must be less than 100 characters').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  avatarUrl: z.string().url('Please enter a valid URL').optional(),
  phone: z.string().max(20, 'Phone number must be less than 20 characters').optional(),
  membership: z.nativeEnum(MembershipTier).optional(),
  mfaEnabled: z.boolean().optional(),
});

export const membershipTierSchema = z.nativeEnum(MembershipTier);

// FAQ schemas
export const faqSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters').max(200, 'Question must be less than 200 characters'),
  answer: z.string().min(10, 'Answer must be at least 10 characters').max(2000, 'Answer must be less than 2000 characters'),
  category: z.string().max(50, 'Category must be less than 50 characters').optional(),
  orderIndex: z.number().min(0, 'Order index must be non-negative').optional(),
  isActive: z.boolean().optional(),
});

// Plan Request schemas
export const planRequestSchema = z.object({
  location: z.string().min(2, 'Location must be at least 2 characters').max(100, 'Location must be less than 100 characters'),
  travelDate: z.date({
    required_error: 'Travel date is required',
  }),
  guests: z.number().min(1, 'At least 1 guest is required').max(50, 'Maximum 50 guests allowed'),
  specialRequests: z.string().max(1000, 'Special requests must be less than 1000 characters').optional(),
  budgetRange: z.string().max(50, 'Budget range must be less than 50 characters').optional(),
  interests: z.array(z.string()).optional(),
  contactEmail: z.string().email('Please enter a valid email address').optional(),
  contactPhone: z.string().max(20, 'Phone number must be less than 20 characters').optional(),
});

// Experience schemas (keeping existing structure)
export const experienceSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description must be less than 2000 characters'),
  location: z.string().min(2, 'Location must be at least 2 characters').max(100, 'Location must be less than 100 characters'),
  pricePerPerson: z.number().min(0, 'Price must be non-negative'),
  durationHours: z.number().min(1, 'Duration must be at least 1 hour').max(168, 'Duration cannot exceed 168 hours (1 week)'),
  maxCapacity: z.number().min(1, 'Max capacity must be at least 1').max(1000, 'Max capacity cannot exceed 1000'),
  category: z.string().min(2, 'Category must be at least 2 characters').max(50, 'Category must be less than 50 characters'),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type BookingFormData = z.infer<typeof bookingSchema>;
export type SearchFormData = z.infer<typeof searchSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ReviewFormData = z.infer<typeof reviewSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type PackageFormData = z.infer<typeof packageSchema>;
export type DestinationFormData = z.infer<typeof destinationSchema>;
export type PartnerFormData = z.infer<typeof partnerSchema>;
export type PackageItemFormData = z.infer<typeof packageItemSchema>;
export type PackageItemOptionFormData = z.infer<typeof packageItemOptionSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type FAQFormData = z.infer<typeof faqSchema>;
export type PlanRequestFormData = z.infer<typeof planRequestSchema>;
export type ExperienceFormData = z.infer<typeof experienceSchema>;
