import { useEffect } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';

/**
 * Hook to handle onboarding data persistence
 * This should be used in every onboarding step component
 * Since the store now loads data immediately, this hook mainly ensures
 * data is refreshed if the user ID changes during the session
 */
export function useOnboardingPersistence() {
  const { loadFromStorage, isLoaded } = useOnboardingStore();

  useEffect(() => {
    // Refresh data from storage in case user ID changed
    // This is now more of a safety check since data loads immediately in store
    if (!isLoaded) {
      loadFromStorage();
    }
  }, [loadFromStorage, isLoaded]);

  // Return loading state for components that want to show loading
  return { isLoaded };
}