'use client';

import React, { useState } from 'react';
import { FAQItem, FAQItemData } from './FAQItem';
import { cn } from '@/utils/cn';

interface FAQGridProps {
  faqs: FAQItemData[];
  className?: string;
}

export const FAQGrid: React.FC<FAQGridProps> = ({
  faqs,
  className = '',
}) => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-2 gap-6', className)}>
      {faqs.map((faq) => (
        <FAQItem
          key={faq.id}
          faq={faq}
          isOpen={openItems.has(faq.id)}
          onToggle={() => toggleItem(faq.id)}
        />
      ))}
    </div>
  );
};
