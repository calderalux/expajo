export interface ServiceCategory {
  id: string;
  name: string;
  count: number;
  description?: string;
  icon?: string;
}

export const serviceCategories: ServiceCategory[] = [
  {
    id: 'luxury-stays',
    name: 'Luxury Stays',
    count: 50,
    description: 'Premium accommodations and luxury hotels',
  },
  {
    id: 'cultural-tours',
    name: 'Cultural Tours',
    count: 15,
    description: 'Guided cultural experiences and heritage tours',
  },
  {
    id: 'car-rental',
    name: 'Car Rental',
    count: 24,
    description: 'Premium vehicle rental services',
  },
  {
    id: 'airport-pickup',
    name: 'Airport Pickup',
    count: 30,
    description: 'Convenient airport transfer services',
  },
  {
    id: 'private-chef',
    name: 'Private chef',
    count: 12,
    description: 'Personal chef services for your stay',
  },
  {
    id: 'adventure',
    name: 'Adventure',
    count: 50,
    description: 'Thrilling adventure and outdoor activities',
  },
];

export const getServiceCategories = (): ServiceCategory[] => {
  return serviceCategories;
};

export const getServiceCategoryById = (id: string): ServiceCategory | undefined => {
  return serviceCategories.find(category => category.id === id);
};
