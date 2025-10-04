'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<PlanRequestData | null>(null);
  const router = useRouter();

  // Core form fields using TanStack Form + Zod
  const formFields: FormFieldConfig[] = [
    {
      ...planRequestFields[0], // location
      icon: <MapPin size={20} className="text-gray-400" />,
      disabled: destinationsLoading,
    },
    {
      ...planRequestFields[1], // travel_date
      icon: <Calendar size={20} className="text-gray-400" />,
    },
    {
      ...planRequestFields[2], // guests
      icon: <Users size={20} className="text-gray-400" />,
    },
  ];

  const formActions: FormAction[] = [
    {
      id: 'start-planning',
      label: 'Start Planning',
      type: 'primary',
      loading: isLoading,
      onClick: () => {
        // Don't add onClick here - we'll handle it in the form submission
      },
    },
    {
      id: 'browse-experiences',
      label: 'Browse Experiences',
      type: 'outline',
      onClick: () => {
        // Navigate to experiences page
        router.push('/experiences');
      },
    },
  ];

  const handleFormSubmit = async (data: PlanRequestData) => {
    // Store the form data and open the three-step modal
    console.log('Form is valid, opening three-step modal with data:', data);
    console.log('Travel dates type:', typeof data.travel_dates);
    console.log('Travel dates value:', data.travel_dates);
    console.log('First date type:', typeof data.travel_dates[0]);
    console.log('First date value:', data.travel_dates[0]);
    setFormData(data);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleModalSuccess = async (data: any) => {
    console.log('Three-step form completed:', data);
    setIsLoading(true);

    try {
      // Combine the original form data with the three-step form data
      const combinedData = {
        ...data.step2, // destination, arrivalDate, departureDate, adults, children
        services: data.step1.services,
        fullName: data.step3.fullName,
        email: data.step3.email,
        phone: data.step3.phone,
        consent: data.step3.consent,
      };

      // Submit to database using the combined data
      const { data: result, error } =
        await PlanRequestService.createPlanRequest(combinedData);

      if (error) {
        console.error('Error submitting plan request:', error);
        // TODO: Show error message to user using toast
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
      // TODO: Show success message using toast
      // TODO: Send email notification
      // TODO: Redirect to planning page or show confirmation
    } catch (error) {
      console.error('Error submitting plan request:', error);
      // TODO: Show error message to user using toast
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
    }
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <TanStackDynamicForm
          title="Plan Your Perfect Nigerian Adventure"
          subtitle="Tell us what you're looking for and we'll create a personalized itinerary just for you."
          fields={formFields}
          actions={formActions}
          schema={planRequestSchema}
          onSubmit={handleFormSubmit}
          onPrimaryActionClick={() => setIsModalOpen(true)}
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

      {/* Plan Your Experience Modal */}
      <PlanYourExperienceModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        initialData={
          formData
            ? {
                location: formData.location,
                travel_date:
                  formData.travel_dates && formData.travel_dates[0]
                    ? (() => {
                        const date = formData.travel_dates[0];
                        console.log(
                          'Converting date:',
                          date,
                          'type:',
                          typeof date
                        );

                        // Handle both Date objects and strings
                        if (date instanceof Date) {
                          return date.toISOString().split('T')[0];
                        } else if (typeof date === 'string') {
                          const parsedDate = new Date(date);
                          if (!isNaN(parsedDate.getTime())) {
                            return parsedDate.toISOString().split('T')[0];
                          }
                        } else if (
                          date &&
                          typeof date === 'object' &&
                          'toISOString' in date
                        ) {
                          // Handle Date-like objects
                          return (date as any).toISOString().split('T')[0];
                        }
                        console.warn('Could not convert date:', date);
                        return '';
                      })()
                    : '',
                departure_date:
                  formData.travel_dates && formData.travel_dates[1]
                    ? (() => {
                        const date = formData.travel_dates[1];
                        console.log(
                          'Converting departure date:',
                          date,
                          'type:',
                          typeof date
                        );

                        // Handle both Date objects and strings
                        if (date instanceof Date) {
                          return date.toISOString().split('T')[0];
                        } else if (typeof date === 'string') {
                          const parsedDate = new Date(date);
                          if (!isNaN(parsedDate.getTime())) {
                            return parsedDate.toISOString().split('T')[0];
                          }
                        } else if (
                          date &&
                          typeof date === 'object' &&
                          'toISOString' in date
                        ) {
                          // Handle Date-like objects
                          return (date as any).toISOString().split('T')[0];
                        }
                        console.warn('Could not convert departure date:', date);
                        return '';
                      })()
                    : '',
                guests: formData.guests.toString(),
              }
            : undefined
        }
      />
    </section>
  );
};
