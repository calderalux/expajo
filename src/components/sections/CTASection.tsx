'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CTAButton } from '@/components/ui/CTAButton';

interface CTASectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
  className?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  title = "Ready to Create Your Own Story?",
  description = "Join hundreds of satisfied travelers who've discovered the magic of Nigeria with Expajo.",
  buttonText = "Start Planning Your Journey",
  buttonHref,
  onButtonClick,
  className = '',
}) => {
  return (
    <section className={`py-16 lg:py-24 bg-white ${className}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            {/* Title */}
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-playfair text-gray-900 leading-tight">
              {title}
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <CTAButton
                onClick={onButtonClick}
                href={buttonHref}
                size="lg"
                className="inline-block"
              >
                {buttonText}
              </CTAButton>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};