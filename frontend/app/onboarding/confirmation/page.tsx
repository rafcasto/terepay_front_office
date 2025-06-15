// File: app/onboarding/confirmation/page.tsx

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmationPage() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push('/dashboard');
    }, 3000); // auto-redirect after 3s

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-3xl font-bold text-green-600 mb-4">🎉 Thank you!</h1>
      <p className="text-lg">Your application has been submitted successfully.</p>
      <p className="text-sm text-gray-500 mt-2">Redirecting you to the dashboard...</p>
    </div>
  );
}
