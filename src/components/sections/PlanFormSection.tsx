'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Calendar, Users } from 'lucide-react';
import { DynamicForm, FormField, FormAction } from '@/components/forms/DynamicForm';
import { PlanRequestService, PlanRequestFormData } from '@/lib/services/planRequests';

// Nigerian states and cities data
const nigerianLocations = [
  { value: 'abuja', label: 'Abuja' },
  { value: 'lagos', label: 'Lagos' },
  { value: 'calabar', label: 'Calabar' },
  { value: 'kano', label: 'Kano' },
  { value: 'ibadan', label: 'Ibadan' },
  { value: 'port-harcourt', label: 'Port Harcourt' },
  { value: 'benin', label: 'Benin' },
  { value: 'kaduna', label: 'Kaduna' },
  { value: 'maiduguri', label: 'Maiduguri' },
  { value: 'zaria', label: 'Zaria' },
  { value: 'aba', label: 'Aba' },
  { value: 'jos', label: 'Jos' },
  { value: 'ilorin', label: 'Ilorin' },
  { value: 'oyo', label: 'Oyo' },
  { value: 'enugu', label: 'Enugu' },
  { value: 'abeokuta', label: 'Abeokuta' },
  { value: 'sokoto', label: 'Sokoto' },
  { value: 'onitsha', label: 'Onitsha' },
  { value: 'warri', label: 'Warri' },
  { value: 'akure', label: 'Akure' },
];

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

  const formFields: FormField[] = [
    {
      id: 'location',
      name: 'location',
      type: 'select',
      label: 'State/City',
      placeholder: 'Abuja, Lagos, Calabar...',
      required: true,
      options: nigerianLocations,
      icon: <MapPin size={20} className="text-gray-400" />,
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

      // Submit to database
      const { data: result, error } = await PlanRequestService.createPlanRequest(formData);
      
      if (error) {
        console.error('Error submitting plan request:', error);
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
