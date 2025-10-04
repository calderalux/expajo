'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Calendar, Users, MessageSquare } from 'lucide-react';

export interface BookingFormData {
  listingId: string;
  startDate: Date;
  endDate: Date;
  guests: number;
  specialRequests: string;
}

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
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const nights = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    return nights * pricePerNight;
  };

  const calculateNights = () => {
    if (!startDate || !endDate) return 0;
    return Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startDate && endDate) {
      onSubmit({
        listingId,
        startDate,
        endDate,
        guests,
        specialRequests,
      });
    }
  };

  const isFormValid = startDate && endDate && guests > 0;

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-playfair">Book Your Stay</CardTitle>
        <CardDescription>Complete your booking details below</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Input
              label="Check-in Date"
              type="date"
              placeholder="Select check-in date"
              leftIcon={<Calendar size={20} className="text-gray-400" />}
              value={
                startDate
                  ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`
                  : ''
              }
              onChange={(e) =>
                setStartDate(
                  e.target.value
                    ? new Date(e.target.value + 'T00:00:00')
                    : undefined
                )
              }
              required
            />
          </div>

          <div>
            <Input
              label="Check-out Date"
              type="date"
              placeholder="Select check-out date"
              leftIcon={<Calendar size={20} className="text-gray-400" />}
              value={
                endDate
                  ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}`
                  : ''
              }
              onChange={(e) =>
                setEndDate(
                  e.target.value
                    ? new Date(e.target.value + 'T00:00:00')
                    : undefined
                )
              }
              required
            />
          </div>

          <div>
            <Input
              label="Number of Guests"
              type="number"
              placeholder="Enter number of guests"
              leftIcon={<Users size={20} className="text-gray-400" />}
              value={guests}
              onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
              min="1"
              max="20"
              required
            />
          </div>

          <div>
            <Input
              label="Special Requests (Optional)"
              type="textarea"
              placeholder="Any special requests or notes for your stay"
              leftIcon={<MessageSquare size={20} className="text-gray-400" />}
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
            />
          </div>

          {/* Price Summary */}
          {startDate && endDate && (
            <div className="bg-gray-50 rounded-card p-4 space-y-2">
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
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? 'Processing...' : 'Complete Booking'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
