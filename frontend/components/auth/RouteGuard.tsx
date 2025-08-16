'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from './AuthProvider';
import { useOnboardingStore } from '@/store/onboardingStore';
import { LoadingSpinner } from '../ui/LoadingSpinner';

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { data, isLoaded: onboardingLoaded } = useOnboardingStore();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const validateRoute = async () => {
      if (authLoading || !onboardingLoaded) {
        return;
      }

      setIsValidating(true);
      
      try {
        // Public routes - allow access
        if (['/login', '/register'].includes(pathname || '')) {
          if (user) {
            // User is logged in, redirect based on onboarding status
            router.replace(data.isCompleted ? '/dashboard' : '/onboarding/1');
          }
          return;
        }

        // Protected routes - require authentication
        if (!user) {
          router.replace('/login');
          return;
        }

        // Onboarding routes
        if (pathname?.startsWith('/onboarding')) {
          if (data.isCompleted) {
            router.replace('/dashboard');
          }
          return;
        }

        // Dashboard route
        if (pathname === '/dashboard') {
          if (!data.isCompleted) {
            router.replace('/onboarding/1');
          }
          return;
        }

      } finally {
        setIsValidating(false);
      }
    };

    validateRoute();
  }, [pathname, user, authLoading, onboardingLoaded, data.isCompleted, router]);

  if (authLoading || !onboardingLoaded || isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
}
