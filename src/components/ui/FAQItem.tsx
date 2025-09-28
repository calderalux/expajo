'use client';

import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface FAQItemData {
  id: string;
  question: string;
  answer: string;
}

interface FAQItemProps {
  faq: FAQItemData;
  isOpen: boolean;
  onToggle: () => void;
  className?: string;
}

export const FAQItem: React.FC<FAQItemProps> = ({
  faq,
  isOpen,
  onToggle,
  className = '',
}) => {
  return (
    <div className={cn('bg-white rounded-card overflow-hidden', className)}>
      <button
        onClick={onToggle}
        className="w-full text-left p-6 focus:outline-none"
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${faq.id}`}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 pr-4">
            {faq.question}
          </h3>
          <div className="flex-shrink-0">
            {isOpen ? (
              <ChevronUp size={20} className="text-gray-600" />
            ) : (
              <ChevronDown size={20} className="text-gray-600" />
            )}
          </div>
        </div>
      </button>
      
      <div
        id={`faq-answer-${faq.id}`}
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="px-6 pb-6">
          <p className="text-gray-700 leading-relaxed pt-4">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
};
