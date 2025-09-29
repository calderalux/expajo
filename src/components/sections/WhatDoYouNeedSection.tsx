'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ServiceCategoryButton } from '@/components/ui/ServiceCategoryButton';
import { Button } from '@/components/ui/Button';
import { serviceCategories, ServiceCategory } from '@/lib/data/serviceCategories';

export const WhatDoYouNeedSection: React.FC = () => {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const handleServiceToggle = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  const handleGetQuote = () => {
    console.log('Selected services:', selectedServices);
    // TODO: Implement quote request functionality
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Title and Subtitle */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-4">
              What do you need for your trip?
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto">
              Select the services you&apos;re interested in to see personalized recommendations
            </p>
          </motion.div>

          {/* Service Category Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex flex-wrap justify-center gap-4">
              {serviceCategories.map((service) => (
                <ServiceCategoryButton
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  count={service.count}
                  isSelected={selectedServices.includes(service.id)}
                  onClick={handleServiceToggle}
                />
              ))}
            </div>
          </motion.div>

          {/* Call-to-Action Button */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetQuote}
              className="px-12 py-4 text-lg font-medium rounded-full"
            >
              Get Quote For Special Services
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
