'use client';

import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';

export function useOnboardingStatus() {
  const { data } = useOnboardingStore();
  const { user } = useAuth();
  const router = useRouter();
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const redirectToDashboard = () => {
    router.push('/dashboard');
  };

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      setIsCheckingStatus(true);
      try {
        // Just check if the user is logged in
        if (!user) {
          router.push('/login');
          return;
        }
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkOnboardingStatus();
  }, [user, router]);

  return {
    shouldShowOnboarding: !data.isCompleted,
    isLoading: isCheckingStatus,
    redirectToDashboard
  };
}
