import { MapPin, Shield, Users, MessageCircle } from 'lucide-react';

export interface TrustedFeature {
  id: string;
  iconName: 'MapPin' | 'Shield' | 'Users' | 'MessageCircle';
  title: string;
  description: string;
}

export interface TrustedStat {
  value: string;
  label: string;
}

export const trustedFeatures: TrustedFeature[] = [
  {
    id: '1',
    iconName: 'MapPin',
    title: 'Curated by locals you can trust',
    description: 'Every experience is handpicked by our team of Nigerian travel experts who know the country inside and out.',
  },
  {
    id: '2',
    iconName: 'Shield',
    title: 'Safety-vetted partners',
    description: 'All our partners undergo rigorous background checks and safety audits to ensure your complete security.',
  },
  {
    id: '3',
    iconName: 'Users',
    title: 'Concierge-style planning',
    description: 'Personal travel specialists create custom itineraries tailored to your preferences and interests.',
  },
  {
    id: '4',
    iconName: 'MessageCircle',
    title: '24/7 real-time support',
    description: 'Round-the-clock assistance via WhatsApp ensures help is always just a message away.',
  },
];

export const trustedStats: TrustedStat[] = [
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

export const getTrustedFeatures = (): TrustedFeature[] => {
  return trustedFeatures;
};

export const getTrustedStats = (): TrustedStat[] => {
  return trustedStats;
};
