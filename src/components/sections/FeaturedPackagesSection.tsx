'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PackageCard, Package } from '@/components/ui/PackageCard';
import { Button } from '@/components/ui/Button';
import { getFeaturedPackages } from '@/lib/data/packages';

export const FeaturedPackagesSection: React.FC = () => {
  const packages = getFeaturedPackages();

  const handleBookPackage = (packageId: string) => {
    console.log('Booking package:', packageId);
    // TODO: Implement booking functionality
  };

  const handleCreateCustomPackage = () => {
    console.log('Creating custom package');
    // TODO: Implement custom package creation
  };

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-4">
              Featured Travel Packages
            </h2>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Carefully curated multi-day experiences that combine the best of Nigerian luxury travel. 
              Fixed pricing, premium inclusions, instant booking.
            </p>
          </motion.div>

          {/* Package Cards */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12"
          >
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                viewport={{ once: true, amount: 0.2 }}
              >
                <PackageCard
                  package={pkg}
                  onBook={handleBookPackage}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <p className="text-gray-600 mb-6">
              All packages include 24/7 concierge support and can be customized to your preferences
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={handleCreateCustomPackage}
              className="px-8 py-3 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 bg-white"
            >
              Create Custom Package <ArrowRight size={20} className="ml-2" />
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
