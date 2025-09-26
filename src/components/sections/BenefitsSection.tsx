'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Clock, Heart, Award } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const benefits = [
  {
    icon: <Shield size={32} />,
    title: 'Secure Booking',
    description: 'Your payment and personal information are protected with bank-level security.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: <Clock size={32} />,
    title: '24/7 Support',
    description: 'Get help anytime with our round-the-clock customer support team.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: <Heart size={32} />,
    title: 'Verified Hosts',
    description: 'All our hosts are verified and committed to providing exceptional experiences.',
    color: 'from-red-500 to-red-600',
  },
  {
    icon: <Award size={32} />,
    title: 'Best Price Guarantee',
    description: 'We guarantee the best prices or we\'ll match any lower price you find.',
    color: 'from-purple-500 to-purple-600',
  },
];

export const BenefitsSection: React.FC = () => {
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
            Why Choose Expajo?
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            We're committed to making your short-term rental experience exceptional
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="text-center p-8 h-full">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-r ${benefit.color} flex items-center justify-center text-white`}>
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
