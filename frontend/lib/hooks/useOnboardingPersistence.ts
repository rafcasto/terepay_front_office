import { useEffect, useState } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAuth } from '@/components/auth/AuthProvider';
import { OnboardingService } from '@/lib/services/onboardingService';

/**
 * Enhanced hook to handle onboarding data persistence with backend sync
 */
export function useOnboardingPersistence() {
  const { user, loading: authLoading } = useAuth();
  const { 
    loadFromStorage, 
    loadStep1FromBackend, 
    loadStep2FromBackend, // Add this
    loadStep3FromBackend,
    loadStep4FromBackend,
    loadStep5FromBackend,
    isLoaded, 
    data 
  } = useOnboardingStore();
  const [hasInitialized, setHasInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize onboarding system when user is ready
  useEffect(() => {
    let mounted = true;

    const initializeOnboarding = async () => {
      if (authLoading || !user || hasInitialized) return;

      console.log('Initializing onboarding for user:', user.uid);

      try {
        // Load from localStorage first (immediate)
        loadFromStorage();
        console.log('Loaded from localStorage');

        // Initialize backend tables if needed
        await OnboardingService.initializeOnboarding();
        console.log('Backend initialized');

        // Load data from backend (may override localStorage)
        if (mounted) {
          await loadStep1FromBackend();
          await loadStep2FromBackend();
          await loadStep3FromBackend();
          await loadStep4FromBackend();
          await loadStep5FromBackend();
          console.log('Loaded from backend');
          setHasInitialized(true);
          setInitError(null);
        }
      } catch (error) {
        console.error('Failed to initialize onboarding:', error);
        if (mounted) {
          setInitError(error instanceof Error ? error.message : 'Initialization failed');
          setHasInitialized(true); // Still mark as initialized to prevent retries
        }
      }
    };

    initializeOnboarding();

    return () => {
      mounted = false;
    };
  }, [user, authLoading, hasInitialized, loadFromStorage, loadStep1FromBackend,loadStep2FromBackend,loadStep3FromBackend,loadStep4FromBackend,loadStep5FromBackend]);

  return {
    isLoaded: isLoaded && hasInitialized,
    isInitializing: !hasInitialized && !authLoading && !!user,
    initError,
    isSyncing: data.isSyncing,
    syncError: data.syncError,
    lastSyncedAt: data.lastSyncedAt,
  };
}