import React from 'react';
import { cn } from '@/utils/cn';

interface ExperienceCardSkeletonProps {
  className?: string;
}

export const ExperienceCardSkeleton: React.FC<ExperienceCardSkeletonProps> = ({
  className = '',
}) => {
  return (
    <div className={cn('bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-pulse', className)}>
      {/* Image Skeleton */}
      <div className="h-64 w-full bg-gray-200" />

      {/* Content Skeleton */}
      <div className="p-6 space-y-4">
        {/* Location Skeleton */}
        <div className="h-4 w-32 bg-gray-200 rounded" />

        {/* Title Skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-full bg-gray-200 rounded" />
          <div className="h-6 w-3/4 bg-gray-200 rounded" />
        </div>

        {/* Rating Skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2">
          <div className="h-4 w-full bg-gray-200 rounded" />
          <div className="h-4 w-5/6 bg-gray-200 rounded" />
        </div>

        {/* Features Skeleton */}
        <div className="flex gap-2">
          <div className="h-6 w-20 bg-gray-200 rounded-full" />
          <div className="h-6 w-24 bg-gray-200 rounded-full" />
          <div className="h-6 w-16 bg-gray-200 rounded-full" />
        </div>

        {/* Duration & Capacity Skeleton */}
        <div className="flex gap-4">
          <div className="h-4 w-20 bg-gray-200 rounded" />
          <div className="h-4 w-24 bg-gray-200 rounded" />
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex gap-3 pt-2">
          <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
          <div className="h-10 flex-1 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
};
