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
    <div className="flex justify-between mt-6">
      {step > 1 ? (
        <button
          type="button"
          onClick={goBack}
          className="bg-gray-300 text-black px-4 py-2 rounded"
        >
          Back
        </button>
      ) : <span />}

      {isFinalStep ? (
        <button
          type="button"
          onClick={onSubmit}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      ) : (
        <button
          type="button"
          onClick={goNext}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Next
        </button>
      )}
    </div>
  );
}
