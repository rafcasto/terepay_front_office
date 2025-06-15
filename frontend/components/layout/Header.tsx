'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            {/* TerePay Chevron Logo */}
            <div className="flex items-center">
              <div className="w-10 h-10 flex items-center justify-center mr-3">
                <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
                  {/* Bottom chevron */}
                  <path d="M6 22 L16 12 L26 22" stroke="url(#headerGradient1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  {/* Middle chevron */}
                  <path d="M6 18 L16 8 L26 18" stroke="url(#headerGradient2)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  {/* Top chevron */}
                  <path d="M6 14 L16 4 L26 14" stroke="url(#headerGradient3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  
                  <defs>
                    <linearGradient id="headerGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FB923C" />
                      <stop offset="100%" stopColor="#EF4444" />
                    </linearGradient>
                    <linearGradient id="headerGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="#DC2626" />
                    </linearGradient>
                    <linearGradient id="headerGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EA580C" />
                      <stop offset="100%" stopColor="#B91C1C" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  TerePay
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Fast & Secure Lending</p>
              </div>
            </div>
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user.displayName || user.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}