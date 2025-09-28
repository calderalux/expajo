import { Testimonial } from '@/components/ui/TestimonialCard';

export interface TestimonialStat {
  value: string;
  label: string;
}

export const testimonialStats: TestimonialStat[] = [
  {
    value: '500+',
    label: 'International Travelers',
  },
  {
    value: '4.9',
    label: 'Average Rating',
  },
  {
    value: '50+',
    label: 'Countries',
  },
  {
    value: '100%',
    label: 'Satisfactory Rate',
  },
];

export const testimonials: Testimonial[] = [
  {
    id: '1',
    rating: 5,
    comment: 'Absolutely incredible experience! The Lagos nightlife tour exceeded all my expectations. The local guides were knowledgeable and the venues were top-notch. Highly recommend!',
    user: {
      name: 'Adaobi Okafor',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face',
    },
    experience: 'Lagos Nightlife & Cultural Tour',
    date: 'December 2023',
    likes: 99,
    isVerified: true,
  },
  {
    id: '2',
    rating: 5,
    comment: 'The Abuja cultural experience was transformative. We visited amazing art galleries and had authentic local meals. The team made everything seamless and memorable.',
    user: {
      name: 'James Mitchell',
      location: 'New York, USA',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    },
    experience: 'Abuja Cultural Heritage Journey',
    date: 'November 2023',
    likes: 87,
    isVerified: true,
  },
  {
    id: '3',
    rating: 5,
    comment: 'Calabar beach escape was pure paradise! The beachfront suite was luxurious and the private chef prepared the most amazing Nigerian dishes. Perfect relaxation.',
    user: {
      name: 'Sarah Johnson',
      location: 'Toronto, Canada',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    },
    experience: 'Calabar Beach Resort Luxury Escape',
    date: 'January 2024',
    likes: 124,
    isVerified: true,
  },
  {
    id: '4',
    rating: 5,
    comment: 'The private chef experience was outstanding! We learned to cook authentic Nigerian cuisine and the wine pairing was perfect. A truly unique cultural immersion.',
    user: {
      name: 'Michael Chen',
      location: 'Sydney, Australia',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    },
    experience: 'Private Chef Culinary Journey',
    date: 'February 2024',
    likes: 76,
    isVerified: true,
  },
  {
    id: '5',
    rating: 5,
    comment: 'The luxury safari adventure was breathtaking! We saw incredible wildlife and the luxury camping was beyond comfortable. The expert guides made it unforgettable.',
    user: {
      name: 'Emma Williams',
      location: 'Manchester, UK',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    },
    experience: 'Luxury Safari Adventure',
    date: 'March 2024',
    likes: 92,
    isVerified: true,
  },
  {
    id: '6',
    rating: 5,
    comment: 'The art and fashion tour was incredible! We met amazing designers and visited exclusive studios. The behind-the-scenes access was truly special.',
    user: {
      name: 'David Rodriguez',
      location: 'Barcelona, Spain',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    },
    experience: 'Exclusive Art & Fashion Tour',
    date: 'April 2024',
    likes: 68,
    isVerified: true,
  },
];

export const getTestimonialStats = (): TestimonialStat[] => {
  return testimonialStats;
};

export const getTestimonials = (): Testimonial[] => {
  return testimonials;
};
