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
}

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  data: {
    submitted: false,
  },
  setField: (field, value) => set((state) => ({
    data: {
      ...state.data,
      [field]: value,
    },
  })),
  reset: () => set({ data: { submitted: false } }),
  markSubmitted: () => set((state) => ({
    data: {
      ...state.data,
      submitted: true,
    },
  })),
}));