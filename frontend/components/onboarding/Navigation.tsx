// Updated Navigation.tsx with TerePay branding
'use client';
import { useRouter } from 'next/navigation';

interface NavigationProps {
  step: number;
  isFinalStep?: boolean;
  onSubmit?: () => void;
}

export function Navigation({ step, isFinalStep = false, onSubmit }: NavigationProps) {
  const router = useRouter();

  const goBack = () => {
    if (step > 1) router.push(`/onboarding/${step - 1}`);
  };

  const goNext = () => {
    if (step < 6) router.push(`/onboarding/${step + 1}`);
  };

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

      {/* Navigation buttons */}
      <div className="flex justify-between items-center">
        {step > 1 ? (
          <button
            type="button"
            onClick={goBack}
            className="inline-flex items-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
        ) : (
          <div></div>
        )}

        {isFinalStep ? (
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Submit Application
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        ) : (
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center px-8 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 shadow-lg transition-all duration-200 transform hover:scale-105"
          >
            Continue
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
