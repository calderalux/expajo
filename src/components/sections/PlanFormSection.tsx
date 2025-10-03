'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users } from 'lucide-react';
import { DynamicForm, FormField, FormAction } from '@/components/forms/DynamicForm';
import { PlanRequestFormData } from '@/lib/services/planRequests';
// Removed DestinationService import - now using API route

const guestOptions = [
  { value: '1', label: '1 Adult' },
  { value: '2', label: '2 Adults' },
  { value: '3', label: '3 Adults' },
  { value: '4', label: '4 Adults' },
  { value: '5', label: '5 Adults' },
  { value: '6', label: '6 Adults' },
  { value: '7', label: '7 Adults' },
  { value: '8', label: '8 Adults' },
  { value: '9', label: '9 Adults' },
  { value: '10', label: '10 Adults' },
];

const stats = [
  {
    value: '500+',
    label: 'International Travelers',
  },
  {
    value: '4.9',
    label: 'Average Rating',
  },
  {
    value: '100%',
    label: 'Safety Record',
  },
  {
    value: '5 mins',
    label: 'Response Time',
  },
];

export const PlanFormSection: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [destinations, setDestinations] = useState<{ value: string; label: string }[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);

  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch('/api/destinations/public');
        const result = await response.json();
        if (result.success && result.data) {
          const destinationOptions = result.data.map((dest: { name: string; country: any; }) => ({
            value: dest.name.toLowerCase().replace(/\s+/g, '-'),
            label: `${dest.name}, ${dest.country}`,
          }));
          setDestinations(destinationOptions);
        }
      } catch (error) {
        console.error('Error fetching destinations:', error);
        // Fallback to static data
        setDestinations([
          { value: 'abuja', label: 'Abuja, Nigeria' },
          { value: 'lagos', label: 'Lagos, Nigeria' },
          { value: 'calabar', label: 'Calabar, Nigeria' },
          { value: 'kano', label: 'Kano, Nigeria' },
          { value: 'ibadan', label: 'Ibadan, Nigeria' },
        ]);
      } finally {
        setDestinationsLoading(false);
      }
    };

    fetchDestinations();
  }, []);

  const formFields: FormField[] = [
    {
      id: 'location',
      name: 'location',
      type: 'select',
      label: 'Destination',
      placeholder: destinationsLoading ? 'Loading destinations...' : 'Select a destination',
      required: true,
      options: destinations,
      icon: <MapPin size={20} className="text-gray-400" />,
      disabled: destinationsLoading,
    },
    {
      id: 'date',
      name: 'date',
      type: 'date',
      label: 'Date',
      placeholder: 'dd/mm/yy',
      required: true,
      icon: <Calendar size={20} className="text-gray-400" />,
    },
    {
      id: 'guests',
      name: 'guests',
      type: 'select',
      label: 'Guests',
      placeholder: '2 Adults',
      required: true,
      options: guestOptions,
      icon: <Users size={20} className="text-gray-400" />,
    },
  ];

  const formActions: FormAction[] = [
    {
      id: 'start-planning',
      label: 'Start Planning',
      type: 'primary',
      onClick: () => console.log('Start planning clicked'),
      loading: isLoading,
    },
    {
      id: 'browse-experiences',
      label: 'Browse experiences',
      type: 'outline',
      onClick: () => console.log('Browse experiences clicked'),
    },
  ];

  const handleFormSubmit = async (data: Record<string, any>) => {
    setIsLoading(true);
    
    try {
      // Prepare form data
      const formData: PlanRequestFormData = {
        location: data.location,
        travel_date: data.date,
        guests: parseInt(data.guests),
        special_requests: data.special_requests || '',
        budget_range: data.budget_range || '',
        interests: data.interests || [],
        contact_email: data.contact_email || '',
        contact_phone: data.contact_phone || '',
      };

      // Submit to database via API
      const response = await fetch('/api/plan-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        console.error('Error submitting plan request:', result.error);
        // TODO: Show error message to user
        return;
      }

      console.log('Plan request submitted successfully:', result);
      
      // TODO: Show success message
      // TODO: Send email notification
      // TODO: Redirect to planning page or show confirmation
      
    } catch (error) {
      console.error('Error submitting plan request:', error);
      // TODO: Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <DynamicForm
          title="Plan Your Perfect Nigerian Adventure"
          subtitle="Tell us what you're looking for and we'll create a personalized itinerary just for you."
          fields={formFields}
          actions={formActions}
          onSubmit={handleFormSubmit}
          isLoading={isLoading}
        />

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16"
        >
          <div className="flex flex-col md:flex-row items-center justify-center max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="flex-1 text-center relative"
              >
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm md:text-base text-gray-600 font-medium">
                  {stat.label}
                </div>
                {index < stats.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 transform -translate-y-1/2 w-px h-12 bg-gray-300"></div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
