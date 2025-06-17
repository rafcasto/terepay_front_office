// Utility functions for managing localStorage quota and storage issues

export const getStorageInfo = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const estimate = navigator.storage && navigator.storage.estimate ? 
        navigator.storage.estimate() : Promise.resolve({ usage: 0, quota: 0 });
      
      return estimate.then(({ usage = 0, quota = 0 }) => ({
        used: usage,
        available: quota,
        percentage: quota > 0 ? (usage / quota) * 100 : 0
      }));
    } catch (error) {
      console.warn('Could not get storage estimate:', error);
      return Promise.resolve({ used: 0, available: 0, percentage: 0 });
    }
  };
  
  export const clearOldOnboardingData = (currentUserId?: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const keys = Object.keys(localStorage);
      const onboardingKeys = keys.filter(key => key.startsWith('onboarding_'));
      
      onboardingKeys.forEach(key => {
        // Don't delete current user's data
        if (currentUserId && key === `onboarding_${currentUserId}`) return;
        
        try {
          localStorage.removeItem(key);
          console.log(`Cleared old onboarding data: ${key}`);
        } catch (error) {
          console.warn(`Failed to remove ${key}:`, error);
        }
      });
      
      return onboardingKeys.length;
    } catch (error) {
      console.error('Error clearing old onboarding data:', error);
      return 0;
    }
  };
  
  export const getLocalStorageSize = () => {
    if (typeof window === 'undefined') return 0;
    
    try {
      let total = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          total += (localStorage[key].length + key.length);
        }
      }
      return total;
    } catch (error) {
      console.error('Error calculating localStorage size:', error);
      return 0;
    }
  };
  
  export const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Define a proper interface for storage errors
  interface StorageError {
    name?: string;
    code?: number;
    message?: string;
  }
  
  // Type guard to check if error is a storage-related error
  const isStorageErrorLike = (error: unknown): error is StorageError => {
    return (
      error !== null &&
      typeof error === 'object' &&
      ('name' in error || 'code' in error || 'message' in error)
    );
  };
  
  // Fixed: Accept unknown (from catch blocks) and handle type checking internally
  export const isStorageQuotaExceeded = (error: unknown): boolean => {
    // First check if it's an error-like object
    if (!isStorageErrorLike(error)) return false;
    
    // Now TypeScript knows error has the StorageError properties
    return (
      error.name === 'QuotaExceededError' ||
      error.code === 22 ||
      (typeof error.message === 'string' && error.message.includes('quota')) ||
      (typeof error.message === 'string' && error.message.includes('storage'))
    );
  };
  
  // Safe localStorage setter with quota handling
  export const safeSetItem = (key: string, value: string): boolean => {
    if (typeof window === 'undefined') return false;
    
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error('localStorage setItem failed:', error);
      
      if (isStorageQuotaExceeded(error)) {
        console.warn('Storage quota exceeded, attempting cleanup...');
        
        // Get current user ID for protection
        const currentUserId = getCurrentUserId();
        
        // Clear old onboarding data
        const clearedCount = clearOldOnboardingData(currentUserId);
        console.log(`Cleared ${clearedCount} old onboarding entries`);
        
        // Try again after cleanup
        try {
          localStorage.setItem(key, value);
          console.log('Successfully saved after cleanup');
          return true;
        } catch (retryError) {
          console.error('Still failed after cleanup:', retryError);
          return false;
        }
      }
      
      return false;
    }
  };
  
  // Helper to get current user ID (duplicate from store but needed here)
  const getCurrentUserId = (): string | undefined => {
    if (typeof window === 'undefined') return undefined;
    try {
      const authUser = localStorage.getItem('firebase:authUser');
      if (authUser) {
        const parsed = JSON.parse(authUser) as { uid?: string };
        return parsed?.uid || undefined;
      }
    } catch (error) {
      console.error('Error getting user ID:', error);
    }
    return undefined;
  };