'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrustedFeatureCard } from '@/components/ui/TrustedFeatureCard';
import { TrustedStats } from '@/components/ui/TrustedStats';
import { getTrustedFeatures, getTrustedStats } from '@/lib/data/trustedPartner';

export const TrustedPartnerSection: React.FC = () => {
  const features = getTrustedFeatures();
  const stats = getTrustedStats();

  return (
    <section className="py-16 lg:py-24 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-6">
              Your trusted partner for luxury Nigerian experiences
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              We don't just plan trips—we create transformative experiences that showcase the best of Nigeria with uncompromising safety and luxury.
            </p>
          </motion.div>

          {/* Feature Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <TrustedFeatureCard
                  iconName={feature.iconName}
                  title={feature.title}
                  description={feature.description}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            <TrustedStats stats={stats} />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
