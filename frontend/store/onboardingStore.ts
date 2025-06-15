import { create } from 'zustand';

interface OnboardingData {
  fullName?: string;
  dob?: string;
  address?: string;
  email?: string;
  employer?: string;
  jobTitle?: string;
  income?: number;
  rent?: number;
  debts?: number;
  monthlyIncome?:number;
  dependents?: number;
  savings?: number;
  assets?: string;
  loanAmount?: number;
  loanPurpose?: string;
  loanTerm?: string;
  document?: File | null;
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
