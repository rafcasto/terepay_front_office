'use client';

import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuth } from './useAuth';
import { useRouter, usePathname } from 'next/navigation';

export function useOnboardingRedirect() {
  const { data, isLoaded } = useOnboardingStore();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user || hasRedirected) {
      return;
    }

    setIsChecking(true);
    try {
      const isOnboardingPath = pathname?.startsWith('/onboarding');
      const isDashboardPath = pathname === '/dashboard';

      if (data.isCompleted && isOnboardingPath) {
        setHasRedirected(true);
        router.replace('/dashboard');
      } else if (!data.isCompleted && isDashboardPath) {
        setHasRedirected(true);
        router.replace('/onboarding/1');
      }
    } finally {
      setIsChecking(false);
    }
  }, [isLoaded, user, data.isCompleted, pathname, hasRedirected, router]);

  return {
    isLoading: !isLoaded || isChecking,
    isCompleted: data.isCompleted,
    currentStep: data.stepCompleted,
    shouldShowOnboarding: !data.isCompleted
  };
}
