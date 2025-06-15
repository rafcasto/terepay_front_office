// File: app/onboarding/layout.tsx

import React from 'react';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Loan Application</h1>
        {children}
      </div>
    </section>
  );
}
