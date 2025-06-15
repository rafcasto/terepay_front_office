import { create } from 'zustand';

interface OnboardingData {
  // Personal Information (Enhanced for NZ)
  fullName?: string;
  dob?: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
  nzResidencyStatus?: 'citizen' | 'permanent_resident' | 'temporary_resident' | 'other';
  taxNumber?: string; // IRD number for NZ
  
  // Employment Info
  employer?: string;
  jobTitle?: string;
  monthlyIncome?: number;
  employmentType?: 'full_time' | 'part_time' | 'self_employed' | 'unemployed' | 'retired';
  employmentDuration?: string;
  
  // Financial Information (Enhanced for responsible lending)
  rent?: number;
  debts?: number;
  dependents?: number;
  savings?: number;
  assets?: string;
  
  // Enhanced Financial Assessment for CCCFA compliance
  monthlyExpenses?: number;
  otherIncome?: number;
  existingLoans?: number;
  creditCardDebt?: number;
  
  // Loan Request
  loanAmount?: number;
  loanPurpose?: string;
  loanTerm?: string;
  
  // NZ Compliance & KYC
  document?: File | null;
  addressProof?: File | null;
  incomeProof?: File | null;
  
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
  setField: (field: keyof OnboardingData, value: any) => void;
  reset: () => void;
  markSubmitted: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

// Helper function to get current user ID
const getCurrentUserId = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    const authUser = localStorage.getItem('firebase:authUser');
    if (authUser) {
      const parsed = JSON.parse(authUser);
      return parsed?.uid || null;
    }
  } catch (error) {
    console.error('Error getting user ID:', error);
  }
  return null;
};

// Helper function to load data from localStorage
const loadDataFromStorage = (): OnboardingData => {
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
  const uid = getCurrentUserId();
  if (!uid) return;
  
  try {
    localStorage.setItem(`onboarding_${uid}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving onboarding data:', error);
  }
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  data: { submitted: false },
  
  setField: (field, value) => {
    set((state) => {
      const newData = {
        ...state.data,
        [field]: value,
      };
      // Auto-save to localStorage whenever data changes
      saveDataToStorage(newData);
      return { data: newData };
    });
  },
  
  reset: () => {
    const resetData = { submitted: false };
    set({ data: resetData });
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
    set({ data: loadedData });
  },
  
  saveToStorage: () => {
    const { data } = get();
    saveDataToStorage(data);
  },
}));