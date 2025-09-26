'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl font-playfair font-bold">
                <span className="text-accent">expa</span>
                <span className="text-secondary">jo</span>
              </span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Discover unique short-term rentals and experiences. 
              Book unforgettable stays from cozy cabins to luxurious villas.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-gray-600 hover:text-primary transition-colors duration-200 text-sm">
                  Search Experiences
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="text-gray-600 hover:text-primary transition-colors duration-200 text-sm">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary transition-colors duration-200 text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors duration-200 text-sm">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-gray-600 hover:text-primary transition-colors duration-200 text-sm">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors duration-200 text-sm">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors duration-200 text-sm">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cancellation" className="text-gray-600 hover:text-primary transition-colors duration-200 text-sm">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2024 Expajo. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/auth/login" className="text-gray-500 hover:text-primary transition-colors duration-200 text-sm">
                Sign In
              </Link>
              <Link href="/auth/register" className="text-gray-500 hover:text-primary transition-colors duration-200 text-sm">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
