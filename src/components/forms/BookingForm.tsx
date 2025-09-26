'use client';

import React from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { bookingSchema, type BookingFormData } from '@/lib/validations';
import { FormField } from './FormField';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Calendar, Users, MessageSquare } from 'lucide-react';

interface BookingFormProps {
  listingId: string;
  pricePerNight: number;
  onSubmit: (data: BookingFormData) => void;
  isLoading?: boolean;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  listingId,
  pricePerNight,
  onSubmit,
  isLoading = false,
}) => {
  const form = useForm({
    defaultValues: {
      listingId,
      startDate: undefined as Date | undefined,
      endDate: undefined as Date | undefined,
      guests: 1,
      specialRequests: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: bookingSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  const startDate = form.useStore((state) => state.values.startDate);
  const endDate = form.useStore((state) => state.values.endDate);
  const guests = form.useStore((state) => state.values.guests);

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const nights = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return nights * pricePerNight;
  };

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair">Book Your Stay</CardTitle>
        <CardDescription>
          Complete your booking details below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field
            name="startDate"
            validators={{
              onChange: bookingSchema.shape.startDate,
            }}
          >
            {(field) => (
              <FormField
                field={field}
                label="Check-in Date"
                type="date"
                placeholder="Select check-in date"
                leftIcon={<Calendar size={20} className="text-gray-400" />}
              />
            )}
          </form.Field>

          <form.Field
            name="endDate"
            validators={{
              onChange: bookingSchema.shape.endDate,
            }}
          >
            {(field) => (
              <FormField
                field={field}
                label="Check-out Date"
                type="date"
                placeholder="Select check-out date"
                leftIcon={<Calendar size={20} className="text-gray-400" />}
              />
            )}
          </form.Field>

          <form.Field
            name="guests"
            validators={{
              onChange: bookingSchema.shape.guests,
            }}
          >
            {(field) => (
              <FormField
                field={field}
                label="Number of Guests"
                type="number"
                placeholder="Enter number of guests"
                leftIcon={<Users size={20} className="text-gray-400" />}
              />
            )}
          </form.Field>

          <form.Field
            name="specialRequests"
            validators={{
              onChange: bookingSchema.shape.specialRequests,
            }}
          >
            {(field) => (
              <FormField
                field={field}
                label="Special Requests (Optional)"
                type="textarea"
                placeholder="Any special requests or notes for your stay"
                leftIcon={<MessageSquare size={20} className="text-gray-400" />}
              />
            )}
          </form.Field>

          {/* Price Summary */}
          {startDate && endDate && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Price per night:</span>
                <span>${pricePerNight}</span>
              </div>
              <div className="flex justify-between">
                <span>Nights:</span>
                <span>{calculateNights()}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${calculateTotal()}</span>
              </div>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={!form.state.isValid || isLoading}
          >
            Complete Booking
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
