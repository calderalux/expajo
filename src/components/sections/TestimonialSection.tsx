'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TestimonialStats } from '@/components/ui/TestimonialStats';
import { TestimonialCarousel } from '@/components/ui/TestimonialCarousel';
import { getTestimonialStats, getTestimonials } from '@/lib/data/testimonials';

export const TestimonialSection: React.FC = () => {
  const stats = getTestimonialStats();
  const testimonials = getTestimonials();

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-6">
              Loved by Travelers Worldwide
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Real stories from real travelers who&apos;ve discovered the magic of Nigeria with Expajo.
            </p>
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <TestimonialStats stats={stats} />
          </motion.div>

          {/* Testimonials Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <TestimonialCarousel testimonials={testimonials} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
