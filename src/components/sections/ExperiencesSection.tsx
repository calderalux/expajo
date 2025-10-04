'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ExperienceCard, Experience } from '@/components/ui/ExperienceCard';
import { ExperienceCardSkeleton } from '@/components/ui/ExperienceCardSkeleton';
import { Button } from '@/components/ui/Button';

export const ExperiencesSection: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExperiences = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/experiences/public?isFeatured=true&limit=6');
        const result = await response.json();
        
        if (!response.ok) {
          throw new Error(result.error || 'Failed to fetch experiences');
        }
        
        setExperiences(result.data || []);
      } catch (err: any) {
        console.error('Failed to fetch experiences:', err);
        setError(err.message || 'Failed to load experiences');
        // Fallback to empty array on error
        setExperiences([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperiences();
  }, []);

  const handleViewDetails = (id: string) => {
    console.log('View details for experience:', id);
    // TODO: Navigate to experience detail page
  };

  const handleBookNow = (id: string) => {
    console.log('Book now for experience:', id);
    // TODO: Open booking modal or navigate to booking page
  };

  const handleToggleFavorite = (id: string) => {
    console.log('Toggle favorite for experience:', id);
    // TODO: Implement favorite functionality
  };

  const handleShare = (id: string) => {
    console.log('Share experience:', id);
    // TODO: Implement share functionality
  };

  // Determine which experiences to display (always max 6 on main page)
  const getDisplayedExperiences = () => {
    return experiences.slice(0, 6);
  };

  // Determine if we should show the "More experiences" button
  const shouldShowMoreButton = () => {
    return experiences.length > 6;
  };

  const handleMoreExperiences = () => {
    router.push('/experiences');
  };

  const handleLoadMore = () => {
    // Navigate to experiences page
    window.location.href = '/experiences';
  };

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold font-playfair text-gray-900 mb-4">
                Featured Experiences
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Discover handpicked adventures and cultural immersions across Nigeria
              </p>
            </motion.div>
          </div>

          {/* Experiences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 items-stretch">
            {isLoading
              ? // Show skeleton loaders while loading
                Array.from({ length: 6 }).map((_, index) => (
                  <ExperienceCardSkeleton key={index} />
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
            ) : experiences.length === 0 ? (
              // Show empty state
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 text-lg mb-4">
                  No featured experiences available at the moment
                </div>
                <Button onClick={handleLoadMore}>
                  View All Experiences
                </Button>
              </div>
              : // Show actual experience cards
                getDisplayedExperiences().map((experience, index) => (
                  <motion.div
                    key={experience.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="h-full"
                  >
                    <ExperienceCard
                      experience={experience}
                      onViewDetails={() => handleViewDetails(experience.id)}
                      onBookNow={() => handleBookNow(experience.id)}
                      onToggleFavorite={() => handleToggleFavorite(experience.id)}
                      onShare={() => handleShare(experience.id)}
                    />
                  </motion.div>
                ))}
          </div>

          {/* Load More Button */}
          {!isLoading && !error && experiences.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="text-center"
            >
              <Button
                variant="outline"
                size="lg"
                className="px-8 py-3"
                onClick={handleLoadMore}
              >
                More experiences
                <ArrowRight size={20} className="ml-2" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};
