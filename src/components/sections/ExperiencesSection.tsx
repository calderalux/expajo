'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ExperienceCard, Experience } from '@/components/ui/ExperienceCard';
import { ExperienceCardSkeleton } from '@/components/ui/ExperienceCardSkeleton';
import { Button } from '@/components/ui/Button';

// Mock data - replace with actual Supabase data fetching
const mockExperiences: Experience[] = [
  {
    id: '1',
    title: 'Lagos VIP Nightlife Experience',
    description:
      "Exclusive access to Lagos' most prestigious clubs and lounges with personal security and luxury transportation.",
    location: 'Victoria Island, Lagos',
    price_per_person: 1200,
    rating: 4.9,
    reviews_count: 192,
    image_urls: [
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=400&fit=crop',
    ],
    features: ['VIP Access', 'Security included', 'Luxury transportation'],
    duration_hours: 8,
    max_capacity: 8,
    category: 'Nightlife',
  },
  {
    id: '2',
    title: 'Abuja Cultural Heritage Journey',
    description:
      "Private guided exploration of Nigeria's capital with visits to cultural centers, art galleries, and traditional villages.",
    location: 'Federal Capital Territory',
    price_per_person: 1200,
    rating: 4.8,
    reviews_count: 156,
    image_urls: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500&h=400&fit=crop',
    ],
    features: ['VIP Access', 'Security included', 'Private guide'],
    duration_hours: 8,
    max_capacity: 8,
    category: 'Culture',
  },
  {
    id: '3',
    title: 'Calabar Beach Resort Luxury Escape',
    description:
      'Exclusive beachfront accommodations with private chef services, water sports, and spa treatments.',
    location: 'Calabar, Cross River State',
    price_per_person: 1200,
    rating: 4.9,
    reviews_count: 203,
    image_urls: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=400&fit=crop',
    ],
    features: ['VIP Access', 'Security included', 'Private chef'],
    duration_hours: 8,
    max_capacity: 8,
    category: 'Beach resort',
  },
  {
    id: '4',
    title: 'Private Chef Culinary Journey',
    description:
      'Authentic Nigerian cuisine prepared by renowned chefs with cooking classes and wine pairings.',
    location: 'Lagos & Abuja',
    price_per_person: 1200,
    rating: 4.7,
    reviews_count: 134,
    image_urls: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=400&fit=crop',
    ],
    features: ['VIP Access', 'Security included', 'Cooking classes'],
    duration_hours: 8,
    max_capacity: 8,
    category: 'Culinary',
  },
  {
    id: '5',
    title: 'Luxury Safari Adventure',
    description:
      "Exclusive wildlife experience in Nigeria's premier game reserves with luxury camping and expert guides.",
    location: 'Yankari Game Reserve',
    price_per_person: 1200,
    rating: 4.8,
    reviews_count: 178,
    image_urls: [
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500&h=400&fit=crop',
    ],
    features: ['VIP Access', 'Security included', 'Expert guides'],
    duration_hours: 8,
    max_capacity: 8,
    category: 'Adventure',
  },
  {
    id: '6',
    title: 'Exclusive Art & Fashion Tour',
    description:
      "Behind-the-scenes access to Nigeria's thriving art and fashion scene with private studio visits.",
    location: 'Lagos',
    price_per_person: 1200,
    rating: 4.6,
    reviews_count: 145,
    image_urls: [
      'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&h=400&fit=crop',
    ],
    features: ['VIP Access', 'Security included', 'Studio visits'],
    duration_hours: 8,
    max_capacity: 8,
    category: 'Art & Fashion',
  },
  {
    id: '7',
    title: 'Luxury Wellness Retreat',
    description:
      'Premium spa and wellness experience with personalized treatments, meditation sessions, and healthy cuisine.',
    location: 'Abuja',
    price_per_person: 1500,
    rating: 4.8,
    reviews_count: 98,
    image_urls: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=500&h=400&fit=crop',
    ],
    features: ['VIP Access', 'Security included', 'Personalized treatments'],
    duration_hours: 12,
    max_capacity: 6,
    category: 'Wellness',
  },
];

export const ExperiencesSection: React.FC = () => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Simulate data fetching
  useEffect(() => {
    const fetchExperiences = async () => {
      setIsLoading(true);
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setExperiences(mockExperiences);
      setIsLoading(false);
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

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto">
          {/* Experiences Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12 items-stretch">
            {isLoading
              ? // Show skeleton loaders while loading
                Array.from({ length: 6 }).map((_, index) => (
                  <ExperienceCardSkeleton key={index} />
                ))
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
                      onViewDetails={handleViewDetails}
                      onBookNow={handleBookNow}
                      onToggleFavorite={handleToggleFavorite}
                      onShare={handleShare}
                    />
                  </motion.div>
                ))}
          </div>

          {/* Load More Button */}
          {shouldShowMoreButton() && (
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
                onClick={handleMoreExperiences}
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
