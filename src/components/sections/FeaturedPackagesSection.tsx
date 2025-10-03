'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { PackageCard, Package } from '@/components/ui/PackageCard';
import { Button } from '@/components/ui/Button';

export const FeaturedPackagesSection: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedPackages = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/packages/public?featured=true&limit=3');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch packages');
        }
        
        // Convert database packages to UI format
        const packageData: Package[] = (result.data || []).map((pkg: any) => ({
          id: pkg.id,
          title: pkg.title,
          location: `${pkg.destinations?.name || 'Unknown'}, ${pkg.destinations?.country || 'Nigeria'}`,
          description: pkg.summary || pkg.description || `Discover the beauty and culture of ${pkg.destinations?.name || 'this destination'}`,
          imageUrl: pkg.destinations?.image_cover_url || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
          originalPrice: pkg.base_price,
          currentPrice: pkg.discount_percent ? 
            pkg.base_price * (1 - pkg.discount_percent / 100) : 
            pkg.base_price,
          currency: pkg.currency || 'USD',
          rating: pkg.avg_rating || 4.5,
          reviewCount: pkg.review_count || 0,
          duration: pkg.duration_days ? `${pkg.duration_days} day${pkg.duration_days > 1 ? 's' : ''}` : 'Multi-day',
          maxGuests: pkg.group_size_limit || 8,
          inclusions: Array.isArray(pkg.inclusions) ? pkg.inclusions.map((inc: string, index: number) => ({
            id: index.toString(),
            name: inc
          })) : [
            { id: '1', name: 'Luxury accommodation' },
            { id: '2', name: 'Private guide' },
            { id: '3', name: 'Transportation' },
            { id: '4', name: 'Meals included' },
            { id: '5', name: 'Cultural experiences' },
            { id: '6', name: '24/7 support' },
          ],
          savings: pkg.discount_percent ? pkg.base_price * (pkg.discount_percent / 100) : 0,
        }));
        
        setPackages(packageData);
      } catch (err: any) {
        console.error('Failed to fetch featured packages:', err);
        setError(err.message || 'Failed to load packages');
        setPackages([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedPackages();
  }, []);

  const handleBookPackage = (packageId: string) => {
    console.log('Booking package:', packageId);
    // TODO: Implement booking functionality
  };

  const handleCreateCustomPackage = () => {
    console.log('Creating custom package');
    // TODO: Implement custom package creation
  };

  const handleViewAllPackages = () => {
    // Navigate to packages page
    window.location.href = '/packages';
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
            {isLoading ? (
              // Show skeleton loaders while loading
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 rounded-lg h-64 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : error ? (
              // Show error state
              <div className="col-span-full text-center py-12">
                <div className="text-red-600 text-lg mb-4">
                  {error}
                </div>
                <Button onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : packages.length === 0 ? (
              // Show empty state
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg mb-4">
                  No featured packages available at the moment
                </div>
                <Button onClick={handleViewAllPackages}>
                  View All Packages
                </Button>
              </div>
            ) : (
              packages.map((pkg, index) => (
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
              ))
            )}
          </motion.div>

          {/* Bottom CTA */}
          {!isLoading && !error && packages.length > 0 && (
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
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCreateCustomPackage}
                  className="px-8 py-3 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-200 bg-white"
                >
                  Create Custom Package <ArrowRight size={20} className="ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleViewAllPackages}
                  className="px-8 py-3 rounded-full border-2 border-secondary text-secondary hover:bg-secondary hover:text-white transition-all duration-200 bg-white"
                >
                  View All Packages <ArrowRight size={20} className="ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
