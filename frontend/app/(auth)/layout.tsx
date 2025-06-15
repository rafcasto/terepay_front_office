'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          {/* TerePay Loading Logo */}
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 flex items-center justify-center">
              <svg className="w-12 h-12 animate-pulse" viewBox="0 0 48 48" fill="none">
                {/* Bottom chevron */}
                <path d="M10 34 L24 20 L38 34" stroke="url(#loadingGradient1)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                {/* Middle chevron */}
                <path d="M10 26 L24 12 L38 26" stroke="url(#loadingGradient2)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                {/* Top chevron */}
                <path d="M10 18 L24 4 L38 18" stroke="url(#loadingGradient3)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                
                <defs>
                  <linearGradient id="loadingGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FB923C" />
                    <stop offset="100%" stopColor="#EF4444" />
                  </linearGradient>
                  <linearGradient id="loadingGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#DC2626" />
                  </linearGradient>
                  <linearGradient id="loadingGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#EA580C" />
                    <stop offset="100%" stopColor="#B91C1C" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <h2 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-3">
            TerePay
          </h2>
          
          {/* Loading Spinner */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          
          <p className="text-gray-600 mt-4 text-sm">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 bg-gradient-to-br from-orange-100 to-red-100 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-32 w-96 h-96 bg-gradient-to-tr from-red-100 to-orange-100 rounded-full opacity-20 blur-3xl"></div>
      </div>

      {/* Main Content - Takes up most of the screen */}
      <div className="relative flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>

      {/* Compact Footer - Fixed at bottom */}
      <div className="relative flex-shrink-0 pb-4">
        <div className="text-center px-4">
          <div className="text-xs text-gray-500 space-y-1">
            <p>TerePay is a registered Financial Service Provider in New Zealand</p>
            <div className="flex items-center justify-center space-x-4 text-xs">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Fast
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Trusted
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}