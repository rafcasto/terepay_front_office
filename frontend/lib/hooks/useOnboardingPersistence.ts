// File: lib/hooks/useOnboardingPersistence.ts

import { useEffect } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';

/**
 * Hook to handle onboarding data persistence
 * This should be used in every onboarding step component
 * It loads data from localStorage on mount and saves changes automatically
 */
export function useOnboardingPersistence() {
  const { loadFromStorage } = useOnboardingStore();

  useEffect(() => {
    // Load saved data when component mounts
    loadFromStorage();
  }, [loadFromStorage]);

  // The store automatically saves data to localStorage whenever setField is called
  // So no additional save logic is needed here
}