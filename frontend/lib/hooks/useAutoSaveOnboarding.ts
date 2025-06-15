// File: hooks/useAutoSaveOnboarding.ts

import { useEffect } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';

export function useAutoSaveOnboarding() {
  const { data } = useOnboardingStore();

  useEffect(() => {
    const uid = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('firebase:authUser') || '{}')?.uid : null;
    if (uid) {
      localStorage.setItem(`onboarding_${uid}`, JSON.stringify(data));
    }
  }, [data]);
}
