'use client';

import React from 'react';
import Link from 'next/link';
import { MessageCircle, Mail, Phone, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const Footer: React.FC = () => {
  const services = [
    'Luxury Stays',
    'Cultural Tours',
    'Car Rental',
    'Airport Pickup',
    'Private Chef',
    'Adventure Tours',
    '24/7 Concierge',
  ];

  const locations = [
    'Lagos',
    'Abuja',
    'Calabar',
    'Port-Harcourt',
    'Kano',
    'Ibadan',
    'Jos',
  ];

  const handleWhatsAppClick = () => {
    // TODO: Implement WhatsApp integration
    console.log('WhatsApp clicked');
  };

  const handleStartPlanningClick = () => {
    // TODO: Implement start planning functionality
    console.log('Start Planning clicked');
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8 md:gap-0 justify-center md:justify-start items-center md:items-start">
          {/* Company Information - Left Column */}
          <div className="flex-1 max-w-md mx-auto lg:mx-0 md:w-1/3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold font-playfair text-white mb-4">
                Expajo
              </h2>
              <p className="text-gray-300 text-sm leading-relaxed">
                Nigeria's premier luxury travel platform, curating authentic and safe experiences for diasporans and international travelers. Your journey to discover the real Nigeria starts here.
              </p>
            </div>

            {/* Call to Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button
                onClick={handleWhatsAppClick}
                className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} />
                Chat on WhatsApp
              </Button>
              
              <Button
                onClick={handleStartPlanningClick}
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-6 py-3 rounded-full font-semibold"
              >
                Start Planning
              </Button>
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-300">
                <Mail size={16} className="text-gray-400" />
                <span className="text-sm">hello@expajo.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <Phone size={16} className="text-gray-400" />
                <span className="text-sm">+234 812 345 6789</span>
              </div>
              <div className="flex items-center gap-3 text-gray-300">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-sm">Lagos, Nigeria</span>
              </div>
            </div>
          </div>

          {/* Our Services - Middle Column */}
          <div className="text-left w-full max-w-md mx-auto lg:mx-0 flex-1 md:w-1/3">
            <h3 className="text-lg font-semibold text-white mb-6">
              Our Services
            </h3>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service}>
                  <Link 
                    href={`/services/${service.toLowerCase().replace(/\s+/g, '-')}`}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Locations - Right Column */}
          <div className="text-left w-full max-w-md mx-auto lg:mx-0 flex-1 md:w-1/3">
            <h3 className="text-lg font-semibold text-white mb-6">
              Locations
            </h3>
            <ul className="space-y-3">
              {locations.map((location) => (
                <li key={location}>
                  <Link 
                    href={`/destinations/${location.toLowerCase()}`}
                    className="text-gray-300 hover:text-white transition-colors duration-200 text-sm"
                  >
                    {location}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Row - Legal and Copyright */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-gray-400 text-sm">
                © 2025 Expajo
              </p>
              <div className="flex space-x-6">
                <Link 
                  href="/terms" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Terms of Service
                </Link>
                <Link 
                  href="/privacy" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Privacy Policy
                </Link>
                <Link 
                  href="/accessibility" 
                  className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
