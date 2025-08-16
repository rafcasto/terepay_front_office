'use client';

import React, { Suspense } from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { StepLoadingState } from '@/components/onboarding/StepLoadingStates';

// Updated onboarding layout with TerePay branding
export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <ProtectedRoute>
      <section className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">            
            <h2 className="text-xl text-gray-600 mb-2">Loan Application</h2>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Complete your application securely. All information is encrypted and complies with New Zealand privacy and financial regulations.
            </p>
          </div>

          {/* Main content */}
          <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
              <Suspense fallback={<StepLoadingState />}>
                {children}
              </Suspense>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-xs text-gray-500 space-y-2">
            <p>TerePay is a registered Financial Service Provider in New Zealand</p>
            <p>FSP Number: [Your FSP Number] | Privacy Policy | Terms of Service</p>
            <p>This site is protected by reCAPTCHA and secured with 256-bit SSL encryption</p>
          </div>
        </div>
      </div>
    </section>
    </ProtectedRoute>
  );
}