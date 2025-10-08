import { Package, PackageInclusion } from '@/components/ui/PackageCard';

export const featuredPackages: Package[] = [
  {
    id: '1',
    title: 'Lagos VIP Nightlife Experience',
    location: 'Lagos, Nigeria',
    description: 'Exclusive access to Lagos&apos;s most prestigious clubs and lounges with personal security and luxury.',
    imageUrl: 'https://images.unsplash.com/photo-1514525253164-ff462475708b?w=500&h=300&fit=crop',
    originalPrice: 1500,
    currentPrice: 1200,
    currency: 'USD',
    rating: 4.9,
    reviewCount: 192,
    duration: '3 days, 2 nights',
    maxGuests: 8,
    inclusions: [
      { id: '1', name: 'Priority airport check-in' },
      { id: '2', name: 'VIP lounge access' },
      { id: '3', name: 'Skip-the-line privileges' },
      { id: '4', name: 'Exclusive venue access' },
      { id: '5', name: 'Personal security detail' },
      { id: '6', name: 'Luxury transportation' },
    ],
    savings: 300,
  },
  {
    id: '2',
    title: 'Abuja Culture Sprint',
    location: 'Abuja, Nigeria',
    description: 'Intensive cultural immersion with art galleries, museums, and traditional experiences.',
    imageUrl: 'https://images.unsplash.com/photo-1596367407482-0c71924070b6?w=500&h=300&fit=crop',
    originalPrice: 800,
    currentPrice: 650,
    currency: 'USD',
    rating: 4.8,
    reviewCount: 156,
    duration: '2 days, 1 night',
    maxGuests: 6,
    inclusions: [
      { id: '1', name: 'Boutique hotel stay' },
      { id: '2', name: 'Private cultural guide' },
      { id: '3', name: 'Museum entries' },
      { id: '4', name: 'Traditional craft workshop' },
      { id: '5', name: 'Art gallery tours' },
      { id: '6', name: 'Cultural performances' },
    ],
    savings: 150,
  },
  {
    id: '3',
    title: 'Calabar Beach Escape',
    location: 'Calabar, Cross-River',
    description: 'Ultimate relaxation with beachfront luxury, spa treatments, and water activities.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&h=300&fit=crop',
    originalPrice: 1900,
    currentPrice: 1500,
    currency: 'USD',
    rating: 4.7,
    reviewCount: 98,
    duration: '4 days, 3 nights',
    maxGuests: 4,
    inclusions: [
      { id: '1', name: 'Beachfront suite' },
      { id: '2', name: 'Private chef service' },
      { id: '3', name: 'Spa treatments' },
      { id: '4', name: 'Water sports equipment' },
      { id: '5', name: 'Sunset boat cruise' },
      { id: '6', name: 'Beachside dining' },
    ],
    savings: 400,
  },
];

export const getFeaturedPackages = (): Package[] => {
  return featuredPackages;
};

export const getPackageById = (id: string): Package | undefined => {
  return featuredPackages.find(pkg => pkg.id === id);
};
