'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Mountain, Waves, Plane, Car, Building } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const categories = [
  {
    id: 'apartments',
    name: 'Apartments',
    icon: <Home size={24} />,
    count: '2,500+',
    color: 'from-blue-500 to-blue-600',
  },
  {
    id: 'houses',
    name: 'Houses',
    icon: <Building size={24} />,
    count: '1,800+',
    color: 'from-green-500 to-green-600',
  },
  {
    id: 'cabins',
    name: 'Cabins',
    icon: <Mountain size={24} />,
    count: '800+',
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'beachfront',
    name: 'Beachfront',
    icon: <Waves size={24} />,
    count: '600+',
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    id: 'city-center',
    name: 'City Center',
    icon: <Plane size={24} />,
    count: '3,200+',
    color: 'from-purple-500 to-purple-600',
  },
  {
    id: 'rural',
    name: 'Rural',
    icon: <Car size={24} />,
    count: '400+',
    color: 'from-emerald-500 to-emerald-600',
  },
];

export const CategoriesSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold font-playfair text-gray-900 mb-6">
            Explore by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect type of accommodation for your next trip
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                hover
                className="text-center p-6 group cursor-pointer"
                onClick={() => {
                  // TODO: Navigate to category page
                  console.log('Navigate to category:', category.id);
                }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-200`}>
                  {category.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {category.count} properties
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
