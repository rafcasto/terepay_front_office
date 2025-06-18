'use client';
import { useState } from 'react';

interface NavigationProps {
  step: number;
  isFinalStep?: boolean;
  onSubmit?: () => void | Promise<void>;
  isValid?: boolean;
  isLoading?: boolean;
}

export function Navigation({ 
  step, 
  isFinalStep = false, 
  onSubmit, 
  isValid = true,
  isLoading = false
}: NavigationProps) {
  const [isNavigating, setIsNavigating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple router function that works with any Next.js version
  const navigate = (url: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  };

  const handleBack = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isNavigating || isSubmitting || isLoading || step <= 1) return;
    
    setIsNavigating(true);
    try {
      navigate(`/onboarding/${step - 1}`);
    } finally {
      setTimeout(() => setIsNavigating(false), 500);
    }
  };

  const handleNext = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isNavigating || isSubmitting || isLoading || !isValid) return;
    
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit();
        // Navigation will happen in the onSubmit handler if successful
      } catch (error) {
        console.error('Submit error:', error);
        // Don't navigate if there's an error
      } finally {
        setIsSubmitting(false);
      }
    } else if (!isFinalStep) {
      // Default navigation behavior if no onSubmit provided
      setIsNavigating(true);
      try {
        navigate(`/onboarding/${step + 1}`);
      } finally {
        setTimeout(() => setIsNavigating(false), 500);
      }
    }
  };

  const isAnyLoading = isLoading || isSubmitting || isNavigating;

  return (
    <div className="border-t border-gray-200 pt-6 mt-8">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-gray-600">Step {step} of 6</span>
          <span className="text-xs text-gray-500">{Math.round((step / 6) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${(step / 6) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Validation status */}
      {!isValid && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            ⚠️ Please complete all required fields before continuing.
          </p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            disabled={isAnyLoading}
            className={`inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg transition-colors ${
              isAnyLoading 
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed' 
                : 'text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
            }`}
          >
            {isNavigating ? (
              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-500 border-t-transparent"></div>
            ) : (
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            )}
            Back
          </button>
        ) : (
          <div></div>
        )}

        {isFinalStep ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isValid || isAnyLoading}
            className={`inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-lg text-white shadow-lg transition-all duration-200 ${
              isValid && !isAnyLoading
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform hover:scale-105' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Submitting...
              </>
            ) : (
              <>
                Submit Application
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isValid || isAnyLoading}
            className={`inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-lg text-white shadow-lg transition-all duration-200 ${
              isValid && !isAnyLoading
                ? 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transform hover:scale-105' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : isNavigating ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                Loading...
              </>
            ) : (
              <>
                Continue
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}