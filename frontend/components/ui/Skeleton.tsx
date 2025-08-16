'use client';

import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  /**
   * The accessible name for the skeleton.
   * Use this to describe what's loading (e.g., "Loading profile information").
   */
  ariaLabel?: string;
}

export function Skeleton({ 
  className, 
  variant = 'text', 
  ariaLabel,
  ...props 
}: SkeletonProps) {
  return (
    <div
      role="status"
      aria-label={ariaLabel || "Loading..."}
      aria-busy="true"
      className={cn(
        'animate-pulse bg-gray-200 dark:bg-gray-700',
        {
          'h-4 w-full rounded': variant === 'text',
          'rounded-full': variant === 'circular',
          'rounded-md': variant === 'rectangular',
        },
        className
      )}
      {...props}
    />
  );
}

interface FormFieldSkeletonProps {
  labelWidth?: string;
  inputHeight?: string;
  ariaLabel?: string;
  className?: string;
}

export function FormFieldSkeleton({ 
  labelWidth = 'w-24', 
  inputHeight = 'h-10',
  ariaLabel = 'Loading form field'
}: FormFieldSkeletonProps) {
  return (
    <div className="space-y-2" role="status" aria-label={ariaLabel}>
      <Skeleton className={cn('h-4', labelWidth)} ariaLabel="Loading field label" />
      <Skeleton className={inputHeight} variant="rectangular" ariaLabel="Loading input field" />
    </div>
  );
}

interface ButtonSkeletonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  ariaLabel?: string;
}

export function ButtonSkeleton({ 
  className, 
  size = 'default',
  ariaLabel = 'Loading button' 
}: ButtonSkeletonProps) {
  const sizeClasses = {
    sm: 'h-9 w-20',
    default: 'h-10 w-24',
    lg: 'h-11 w-32',
  };

  return (
    <Skeleton
      variant="rectangular"
      className={cn(sizeClasses[size], 'inline-flex items-center justify-center', className)}
      ariaLabel={ariaLabel}
    />
  );
}

interface DashboardSkeletonProps {
  className?: string;
}

export function DashboardSkeleton({ className }: DashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6 p-4", className)} role="status" aria-label="Loading dashboard">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-1/4" ariaLabel="Loading title" />
        <Skeleton className="h-10 w-32" variant="rectangular" ariaLabel="Loading action button" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border bg-white p-4 shadow">
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-8 w-3/4" />
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="rounded-lg border bg-white p-6">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProfileSkeletonProps {
  className?: string;
}

export function ProfileSkeleton({ className }: ProfileSkeletonProps) {
  return (
    <div className={cn("max-w-2xl mx-auto py-8 px-4 space-y-6", className)} role="status" aria-label="Loading profile">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3" ariaLabel="Loading profile title" />
        <Skeleton className="h-4 w-1/2" ariaLabel="Loading profile subtitle" />
      </div>

      <div className="rounded-lg border bg-white p-6 space-y-6">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-16 w-16" variant="circular" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface OnboardingFormSkeletonProps {
  className?: string;
  steps?: number;
}

export function OnboardingFormSkeleton({ className, steps = 6 }: OnboardingFormSkeletonProps) {
  return (
    <div className={cn("max-w-2xl mx-auto space-y-8", className)} role="status" aria-label="Loading onboarding form">
      {/* Progress Indicator */}
      <div className="flex justify-between mb-8">
        {[...Array(steps)].map((_, i) => (
          <div key={i} className="flex items-center">
            <Skeleton 
              className="h-8 w-8" 
              variant="circular" 
              ariaLabel={`Loading step ${i + 1} indicator`}
            />
            {i < steps - 1 && (
              <Skeleton 
                className="h-1 w-full mx-2" 
                ariaLabel={`Loading progress bar ${i + 1}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-12 w-full" variant="rectangular" />
            </div>
          ))}
        </div>

        <div className="flex justify-between pt-6">
          <Skeleton className="h-10 w-24" variant="rectangular" />
          <Skeleton className="h-10 w-24" variant="rectangular" />
        </div>
      </div>
    </div>
  );
}
