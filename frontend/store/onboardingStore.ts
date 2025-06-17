import { create } from 'zustand';
import { safeSetItem } from '@/lib/utils/storageUtils';

interface OnboardingData {
  // Personal Information
  fullName?: string;
  dob?: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
  nzResidencyStatus?: 'citizen' | 'permanent_resident' | 'temporary_resident' | 'work_visa' | 'student_visa';
  taxNumber?: string;
  
  // Employment & Income
  employmentType?: 'full_time' | 'part_time' | 'self_employed' | 'contract' | 'casual' | 'unemployed' | 'retired' | 'student';
  employer?: string;
  jobTitle?: string;
  employmentDuration?: string;
  monthlyIncome?: number;
  otherIncome?: number;
  
  // Expenses & Obligations
  rent?: number;
  monthlyExpenses?: number;
  debts?: number;
  dependents?: number;
  
  // Assets & Financial Profile
  savings?: number;
  assets?: string;
  existingLoans?: number;
  creditCardDebt?: number;
  
  // Loan Request
  loanAmount?: number;
  loanPurpose?: string;
  loanTerm?: string;
  
  // NZ Compliance & KYC (Files stored in memory only)
  document?: File | undefined;
  addressProof?: File | undefined;
  incomeProof?: File | undefined;
  
  // AML/KYC Declarations
  isPoliticallyExposed?: boolean;
  sourceOfFunds?: string;
  expectedAccountActivity?: string;
  
  // Responsible Lending Declarations
  understandsTerms?: boolean;
  canAffordRepayments?: boolean;
  hasReceivedAdvice?: boolean;
  
  // Submission tracking
  submitted: boolean;
}

interface OnboardingStore {
  data: OnboardingData;
  isLoaded: boolean;
  setField: (field: keyof OnboardingData, value: any) => void;
  reset: () => void;
  markSubmitted: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

// Helper function to get current user ID
const getCurrentUserId = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;
  try {
    const authUser = localStorage.getItem('firebase:authUser');
    if (authUser) {
      const parsed = JSON.parse(authUser);
      return parsed?.uid || undefined;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return undefined;
};

// Helper function to load data from localStorage
const loadDataFromStorage = (): OnboardingData => {
  if (typeof window === 'undefined') return { submitted: false };
  
  const uid = getCurrentUserId();
  if (!uid) return { submitted: false };
  
  try {
    const saved = localStorage.getItem(`onboarding_${uid}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { submitted: false, ...parsed };
    }
  } catch (error) {
    console.error('Error loading onboarding data:', error);
  }
  return { submitted: false };
};

// Helper function to save data to localStorage
const saveDataToStorage = (data: OnboardingData): void => {
  if (typeof window === 'undefined') return;
  
  const uid = getCurrentUserId();
  if (!uid) return;
  
  try {
    // Create a copy of data without File objects for localStorage
    const dataToSave = { ...data };
    
    // Remove File objects as they can't be serialized and cause quota issues
    delete dataToSave.document;
    delete dataToSave.addressProof;
    delete dataToSave.incomeProof;
    
    const success = safeSetItem(`onboarding_${uid}`, JSON.stringify(dataToSave));
    
    if (!success) {
      console.warn('Failed to save onboarding data to localStorage');
    }
  } catch (error) {
    console.error('Error saving onboarding data:', error);
  }
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  data: loadDataFromStorage(), // Load data immediately on store initialization
  isLoaded: true, // Mark as loaded since we load synchronously
  
  setField: (field, value) => {
    set((state) => {
      const newData = {
        ...state.data,
        [field]: value,
      };
      
      // Only auto-save non-File fields to localStorage
      // File objects will be handled in memory only
      if (!(value instanceof File)) {
        saveDataToStorage(newData);
      }
      
      return { data: newData };
    });
  },
  
  reset: () => {
    const resetData = { submitted: false };
    set({ data: resetData, isLoaded: true });
    saveDataToStorage(resetData);
  },
  
  markSubmitted: () => {
    set((state) => {
      const newData = {
        ...state.data,
        submitted: true,
      };
      saveDataToStorage(newData);
      return { data: newData };
    });
  },
  
  loadFromStorage: () => {
    const loadedData = loadDataFromStorage();
    set({ data: loadedData, isLoaded: true });
  },
  
  saveToStorage: () => {
    const { data } = get();
    saveDataToStorage(data);
  },
}));