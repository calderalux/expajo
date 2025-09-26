'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const Header: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-25">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-20 h-20">
              <Image
                src="/images/logo-sample1.png"
                alt="Expajo Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search experiences"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/search" 
              className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium"
            >
              Experiences
            </Link>
            <Link 
              href="/destinations" 
              className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium"
            >
              Destinations
            </Link>
          </nav>

          {/* CTA Button - Desktop */}
          <div className="hidden md:flex items-center">
            <Button 
              variant="primary" 
              size="md"
              className="px-6 py-2"
            >
              Start Planning
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X size={24} className="text-gray-700" />
            ) : (
              <Menu size={24} className="text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Search Bar */}
        <div className="lg:hidden py-4 border-t border-gray-200">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search experiences"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-4 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/search" 
                className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Experiences
              </Link>
              <Link 
                href="/destinations" 
                className="text-gray-700 hover:text-primary transition-colors duration-200 font-medium py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Destinations
              </Link>
              <div className="pt-4">
                <Button 
                  variant="primary" 
                  size="md"
                  className="w-full"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Start Planning
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
