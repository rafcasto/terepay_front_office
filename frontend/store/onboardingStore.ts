import { create } from 'zustand';
import { safeSetItem } from '@/lib/utils/storageUtils';
import { OnboardingService } from '@/lib/services/onboardingService';
import { Step1Data, Step2Data,Step3Data,Step4Data,Step5Data,Step6Data } from '@/types/onboarding';

interface OnboardingData {
  // Personal Information (Step 1)
  fullName?: string;
  dob?: string;
  address?: string;
  email?: string;
  phoneNumber?: string;
  nzResidencyStatus?: 'citizen' | 'permanent_resident' | 'temporary_resident' | 'work_visa' | 'student_visa';
  taxNumber?: string;
  
  // Employment & Income (Step 2)
  employmentType?: 'full_time' | 'part_time' | 'self_employed' | 'contract' | 'casual' | 'unemployed' | 'retired' | 'student';
  employer?: string;
  jobTitle?: string;
  employmentDuration?: 'less_than_3_months' | '3_to_6_months' | '6_months_to_1_year' | '1_to_2_years' | '2_to_5_years' | 'more_than_5_years';
  monthlyIncome?: number;
  otherIncome?: number;
  
  // Expenses & Obligations (Step 3)
  rent?: number;
  monthlyExpenses?: number;
  debts?: number;
  dependents?: number;
  
  
  // Assets & Financial Profile (Step 4) - FIXED TYPES
  // Assets & Financial Profile (Step 4)
  savings?: number;
  assets?: number;
  sourceOfFunds?: string;
  expectedAccountActivity?: string;
  isPoliticallyExposed?: boolean;
  
  // Loan Request (Step 5)
  loanAmount?: number;
  loanPurpose?: string;
  loanTerm?: string;
  
  // NZ Compliance & KYC (Files stored in memory only) (Step 6)
  document?: File | undefined;
  addressProof?: File | undefined;
  incomeProof?: File | undefined;
  
   
  // Responsible Lending Declarations
  understandsTerms?: boolean;
  canAffordRepayments?: boolean;
  hasReceivedAdvice?: boolean;
  
  // Submission tracking
  submitted: boolean;
  
  // Backend sync status - Make these required with defaults
  stepCompleted?: number;        // ← ADD THIS
  isCompleted?: boolean;         // ← ADD THIS
  isSyncing: boolean;
  lastSyncedAt?: string;
  syncError?: string;
}

interface OnboardingStore {
  data: OnboardingData;
  isLoaded: boolean;
  setField: (field: keyof OnboardingData, value: any) => void;
  saveStep1ToBackend: () => Promise<void>;
  saveStep2ToBackend: () => Promise<void>;
  saveStep3ToBackend: () =>  Promise<void>;
  saveStep4ToBackend: () =>  Promise<void>;
  saveStep5ToBackend: () => Promise<void>;  
  saveStep6ToBackend:() => Promise<void>;  
  loadStep1FromBackend: () => Promise<void>;
  loadStep2FromBackend: () => Promise<void>;
  loadStep3FromBackend: () => Promise<void>;
  loadStep4FromBackend: () => Promise<void>;
  loadStep5FromBackend: () => Promise<void>;
  loadStep6FromBackend:() => Promise<void>;
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

// Helper function to load data from localStorage with defaults
const loadDataFromStorage = (): OnboardingData => {
  const defaultData: OnboardingData = { 
    submitted: false, 
    isSyncing: false,
    lastSyncedAt: undefined,
    syncError: undefined
  };
  
  if (typeof window === 'undefined') return defaultData;
  
  const uid = getCurrentUserId();
  if (!uid) return defaultData;
  
  try {
    const saved = localStorage.getItem(`onboarding_${uid}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { 
        ...defaultData, 
        ...parsed,
        // Ensure sync properties have correct defaults
        isSyncing: false, // Always false when loading from storage
        syncError: undefined // Clear any old sync errors
      };
    }
  } catch (error) {
    console.error('Error loading onboarding data:', error);
  }
  return defaultData;
};

// Helper function to save data to localStorage
const saveDataToStorage = (data: OnboardingData): void => {
  if (typeof window === 'undefined') return;
  
  const uid = getCurrentUserId();
  if (!uid) return;
  
  try {
    // Use destructuring to exclude properties instead of delete
    const {
      document: _document,
      addressProof: _addressProof,
      incomeProof: _incomeProof,
      isSyncing: _isSyncing,
      syncError: _syncError,
      ...dataToSave
    } = data;
    
    const success = safeSetItem(`onboarding_${uid}`, JSON.stringify(dataToSave));
    
    if (!success) {
      console.warn('Failed to save onboarding data to localStorage');
    }
  } catch (error) {
    console.error('Error saving onboarding data:', error);
  }
};

export const useOnboardingStore = create<OnboardingStore>((set, get) => ({
  data: loadDataFromStorage(),
  isLoaded: true,
  
  setField: (field, value) => {
    set((state) => {
      const newData = {
        ...state.data,
        [field]: value,
      };
      
      // Only auto-save non-File fields to localStorage
      if (!(value instanceof File)) {
        saveDataToStorage(newData);
      }
      
      return { data: newData };
    });
  },

  saveStep1ToBackend: async () => {
    const { data } = get();
    
    // Extract Step 1 fields
    const step1Data: Step1Data = {
      fullName: data.fullName || '',
      dob: data.dob || '',
      address: data.address || '',
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      nzResidencyStatus: data.nzResidencyStatus || 'citizen',
      taxNumber: data.taxNumber || undefined,
    };

    // Validate required fields
    const requiredFields: Array<keyof Step1Data> = [
      'fullName', 'dob', 'address', 'email', 'phoneNumber', 'nzResidencyStatus'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = step1Data[field];
      return !value || (typeof value === 'string' && value.trim().length === 0);
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    set((state) => ({
      data: { 
        ...state.data, 
        isSyncing: true, 
        syncError: undefined 
      }
    }));

    try {
      const savedData = await OnboardingService.saveStep1Data(step1Data);
      
      set((state) => ({
        data: {
          ...state.data,
          ...savedData,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
          syncError: undefined,
        }
      }));

      // Also save to localStorage after successful backend save
      saveDataToStorage(get().data);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
      set((state) => ({
        data: {
          ...state.data,
          isSyncing: false,
          syncError: errorMessage,
        }
      }));
      throw error;
    }
  },
  saveStep2ToBackend: async () => {
    const { data } = get();
    
    // Extract Step 2 fields - same pattern as Step 1
    const step2Data: Step2Data = {
      employmentType: data.employmentType || 'unemployed',
      employer: data.employer || undefined,
      jobTitle: data.jobTitle || undefined,
      employmentDuration: data.employmentDuration || undefined,
      monthlyIncome: data.monthlyIncome || undefined,
      otherIncome: data.otherIncome || undefined,
    };
  
    // Validate required fields - same pattern as Step 1
    if (!step2Data.employmentType) {
      throw new Error('Employment type is required');
    }
  
    set((state) => ({
      data: { 
        ...state.data, 
        isSyncing: true, 
        syncError: undefined 
      }
    }));
  
    try {
      const savedData = await OnboardingService.saveStep2Data(step2Data);
      
      set((state) => ({
        data: {
          ...state.data,
          ...savedData,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
          syncError: undefined,
        }
      }));
  
      // Also save to localStorage after successful backend save
      saveDataToStorage(get().data);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
      set((state) => ({
        data: {
          ...state.data,
          isSyncing: false,
          syncError: errorMessage,
        }
      }));
      throw error;
    }
  },
  saveStep3ToBackend: async () => {
    const { data } = get();
    
    // Extract Step 3 fields
    const step3Data: Step3Data = {
      rent: data.rent || 0,
      monthlyExpenses: data.monthlyExpenses || 0,
      debts: data.debts || 0,
      dependents: data.dependents || 0,
    };
  
    // Validate required fields
    const requiredFields: Array<keyof Step3Data> = [
      'rent', 'monthlyExpenses', 'debts', 'dependents'
    ];
    
    const missingFields = requiredFields.filter(field => {
      const value = step3Data[field];
      return value === undefined || value === null;
    });
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
  
    // Validate ranges
    if (step3Data.rent < 0 || step3Data.rent > 10000) {
      throw new Error('Rent must be between 0 and 10,000');
    }
    if (step3Data.monthlyExpenses < 0 || step3Data.monthlyExpenses > 20000) {
      throw new Error('Monthly expenses must be between 0 and 20,000');
    }
    if (step3Data.debts < 0 || step3Data.debts > 500000) {
      throw new Error('Debts must be between 0 and 500,000');
    }
    if (step3Data.dependents < 0 || step3Data.dependents > 10) {
      throw new Error('Dependents must be between 0 and 10');
    }
  
    set((state) => ({
      data: { 
        ...state.data, 
        isSyncing: true, 
        syncError: undefined 
      }
    }));
  
    try {
      const savedData = await OnboardingService.saveStep3Data(step3Data);
      
      set((state) => ({
        data: {
          ...state.data,
          rent: savedData.rent,
          monthlyExpenses: savedData.monthlyExpenses,
          debts: savedData.debts,
          dependents: savedData.dependents,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
          syncError: undefined,
        }
      }));
  
      // Also save to localStorage after successful backend save
      saveDataToStorage(get().data);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
      set((state) => ({
        data: {
          ...state.data,
          isSyncing: false,
          syncError: errorMessage,
        }
      }));
      
      throw error;
    }
  },
  
  loadStep3FromBackend: async () => {
    set((state) => ({
      data: { 
        ...state.data, 
        isSyncing: true, 
        syncError: undefined 
      }
    }));
  
    try {
      console.log('Loading Step 3 data from backend...');
      const backendData = await OnboardingService.getStep3Data();
      
      if (backendData) {
        console.log('Backend Step 3 data received:', backendData);
        set((state) => ({
          data: {
            ...state.data,
            rent: backendData.rent,
            monthlyExpenses: backendData.monthlyExpenses,
            debts: backendData.debts,
            dependents: backendData.dependents,
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
            syncError: undefined,
          }
        }));
  
        // Save to localStorage after successful load
        saveDataToStorage(get().data);
        console.log('Store updated with backend Step 3 data');
      } else {
        console.log('No backend Step 3 data found, keeping local data');
        set((state) => ({
          data: { 
            ...state.data, 
            isSyncing: false, 
            syncError: undefined 
          }
        }));
      }
      
    } catch (error) {
      console.error('Failed to load Step 3 from backend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      set((state) => ({
        data: {
          ...state.data,
          isSyncing: false,
          syncError: errorMessage,
        }
      }));
      
      // Don't throw error here - we can still use local data
    }
  },

  loadStep1FromBackend: async () => {
    set((state) => ({
      data: { 
        ...state.data, 
        isSyncing: true, 
        syncError: undefined 
      }
    }));

    try {
      console.log('Loading Step 1 data from backend...');
      const backendData = await OnboardingService.getStep1Data();
      
      if (backendData) {
        console.log('Backend data received:', backendData);
        set((state) => ({
          data: {
            ...state.data,
            fullName: backendData.fullName,
            dob: backendData.dob,
            address: backendData.address,
            email: backendData.email,
            phoneNumber: backendData.phoneNumber,
            nzResidencyStatus: backendData.nzResidencyStatus,
            taxNumber: backendData.taxNumber,
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
            syncError: undefined,
          }
        }));

        // Save to localStorage after successful load
        saveDataToStorage(get().data);
        console.log('Store updated with backend data');
      } else {
        console.log('No backend data found, keeping local data');
        // No backend data found, keep local data
        set((state) => ({
          data: { 
            ...state.data, 
            isSyncing: false, 
            syncError: undefined 
          }
        }));
      }
      
    } catch (error) {
      console.error('Failed to load from backend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      set((state) => ({
        data: {
          ...state.data,
          isSyncing: false,
          syncError: errorMessage,
        }
      }));
      
      // Don't throw error here - we can still use local data
    }
  },
  loadStep2FromBackend: async () => {
    set((state) => ({
      data: { 
        ...state.data, 
        isSyncing: true, 
        syncError: undefined 
      }
    }));
  
    try {
      console.log('Loading Step 2 data from backend...');
      const backendData = await OnboardingService.getStep2Data();
      
      if (backendData) {
        console.log('Backend Step 2 data received:', backendData);
        set((state) => ({
          data: {
            ...state.data,
            employmentType: backendData.employmentType,
            employer: backendData.employer,
            jobTitle: backendData.jobTitle,
            employmentDuration: backendData.employmentDuration,
            monthlyIncome: backendData.monthlyIncome,
            otherIncome: backendData.otherIncome,
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
            syncError: undefined,
          }
        }));
  
        // Save to localStorage after successful load
        saveDataToStorage(get().data);
        console.log('Store updated with backend Step 2 data');
      } else {
        console.log('No backend Step 2 data found, keeping local data');
        set((state) => ({
          data: { 
            ...state.data, 
            isSyncing: false, 
            syncError: undefined 
          }
        }));
      }
      
    } catch (error) {
      console.error('Failed to load Step 2 from backend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      set((state) => ({
        data: {
          ...state.data,
          isSyncing: false,
          syncError: errorMessage,
        }
      }));
      
      // Don't throw error here - we can still use local data
    }
  },
  // Add these methods to your frontend/store/onboardingStore.ts

  saveStep4ToBackend: async () => {
    const { data } = get();
    
    // Extract Step 4 fields - same pattern as Step 2
    const step4Data: Step4Data = {
      savings: data.savings || undefined,
      assets: data.assets || undefined,
      sourceOfFunds: data.sourceOfFunds || '',
      expectedAccountActivity: data.expectedAccountActivity || '',
      isPoliticallyExposed: data.isPoliticallyExposed || false,
    };
  
    set((state) => ({
      data: { 
        ...state.data, 
        isSyncing: true, 
        syncError: undefined 
      }
    }));
  
    try {
      const savedData = await OnboardingService.saveStep4Data(step4Data);
      
      set((state) => ({
        data: {
          ...state.data,
          ...savedData,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
          syncError: undefined,
        }
      }));
  
      // Also save to localStorage after successful backend save
      saveDataToStorage(get().data);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save data';
      set((state) => ({
        data: {
          ...state.data,
          isSyncing: false,
          syncError: errorMessage,
        }
      }));
      throw error;
    }
  },
  
  loadStep4FromBackend: async () => {
    set((state) => ({
      data: { 
        ...state.data, 
        isSyncing: true, 
        syncError: undefined 
      }
    }));
  
    try {
      console.log('Loading Step 4 data from backend...');
      const backendData = await OnboardingService.getStep4Data();
      
      if (backendData) {
        console.log('Backend Step 4 data received:', backendData);
        set((state) => ({
          data: {
            ...state.data,
            savings: backendData.savings,
            assets: backendData.assets,
            sourceOfFunds: backendData.sourceOfFunds,
            expectedAccountActivity: backendData.expectedAccountActivity,
            isPoliticallyExposed: backendData.isPoliticallyExposed,
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
            syncError: undefined,
          }
        }));
  
        // Save to localStorage after successful load
        saveDataToStorage(get().data);
        console.log('Store updated with backend Step 4 data');
      } else {
        console.log('No backend Step 4 data found, keeping local data');
        set((state) => ({
          data: { 
            ...state.data, 
            isSyncing: false, 
            syncError: undefined 
          }
        }));
      }
      
    } catch (error) {
      console.error('Failed to load Step 4 from backend:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load data';
      set((state) => ({
        data: {
          ...state.data,
          isSyncing: false,
          syncError: errorMessage,
        }
      }));
      
      // Don't throw error here - we can still use local data
    }
  },
  saveStep5ToBackend: async () => {
    const state = get();
    if (!state.data.loanAmount || !state.data.loanPurpose) {
      throw new Error('Step 5 required fields missing');
    }

    set({ data: { ...state.data, isSyncing: true } });

    try {
      const step5Data: Step5Data = {
        loanAmount: state.data.loanAmount!,
        loanPurpose: state.data.loanPurpose!,
        loanTerm: state.data.loanTerm,
        understandsTerms: state.data.understandsTerms || false,
        canAffordRepayments: state.data.canAffordRepayments || false,
        hasReceivedAdvice: state.data.hasReceivedAdvice || false,
      };

      const savedData = await OnboardingService.saveStep5Data(step5Data);
      
      set({
        data: {
          ...state.data,
          ...savedData,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
          syncError: undefined,
        }
      });

      // Save to localStorage backup
      state.saveToStorage();
      
    } catch (error) {
      console.error('Failed to save Step 5 to backend:', error);
      set({
        data: {
          ...state.data,
          isSyncing: false,
          syncError: error instanceof Error ? error.message : 'Unknown error',
        }
      });
      throw error;
    }
  },

  loadStep5FromBackend: async () => {
    const state = get();
    set({ data: { ...state.data, isSyncing: true } });

    try {
      const savedData = await OnboardingService.getStep5Data();
      
      if (savedData) {
        set({
          data: {
            ...state.data,
            ...savedData,
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
            syncError: undefined,
          }
        });
      } else {
        set({
          data: {
            ...state.data,
            isSyncing: false,
            lastSyncedAt: new Date().toISOString(),
            syncError: undefined,
          }
        });
      }
    } catch (error) {
      console.error('Failed to load Step 5 from backend:', error);
      set({
        data: {
          ...state.data,
          isSyncing: false,
          syncError: error instanceof Error ? error.message : 'Unknown error',
        }
      });
    }
  },
  // Add to the store implementation
saveStep6ToBackend: async () => {
  const state = get();
  
  try {
    set((state) => ({
      ...state,
      data: { ...state.data, isSyncing: true, syncError: undefined }
    }));

    // Create flattened document metadata
    const documentData: Step6Data = {};
    
    if (state.data.document) {
      documentData.identityDocumentName = state.data.document.name;
      documentData.identityDocumentSize = state.data.document.size;
      documentData.identityDocumentType = state.data.document.type;
      documentData.identityDocumentUploadedAt = new Date().toISOString();
    }
    
    if (state.data.addressProof) {
      documentData.addressProofName = state.data.addressProof.name;
      documentData.addressProofSize = state.data.addressProof.size;
      documentData.addressProofType = state.data.addressProof.type;
      documentData.addressProofUploadedAt = new Date().toISOString();
    }
    
    if (state.data.incomeProof) {
      documentData.incomeProofName = state.data.incomeProof.name;
      documentData.incomeProofSize = state.data.incomeProof.size;
      documentData.incomeProofType = state.data.incomeProof.type;
      documentData.incomeProofUploadedAt = new Date().toISOString();
    }

    const savedData = await OnboardingService.saveStep6Data(documentData);

    set((state) => ({
      ...state,
      data: {
        ...state.data,
        stepCompleted: Math.max(state.data.stepCompleted || 0, savedData.stepCompleted),
        isCompleted: savedData.isCompleted,
        isSyncing: false,
        lastSyncedAt: new Date().toISOString(),
        syncError: undefined
      }
    }));

    get().saveToStorage();
  } catch (error) {
    console.error('Failed to save Step 6 to backend:', error);
    set((state) => ({
      ...state,
      data: {
        ...state.data,
        isSyncing: false,
        syncError: error instanceof Error ? error.message : 'Unknown error occurred'
      }
    }));
    throw error;
  }
},

loadStep6FromBackend: async () => {
  try {
    const savedData = await OnboardingService.getStep6Data();
    
    if (savedData) {
      set((state) => ({
        ...state,
        data: {
          ...state.data,
          // Note: We only store metadata, not the actual files
          stepCompleted: Math.max(state.data.stepCompleted || 0, savedData.stepCompleted),
          isCompleted: savedData.isCompleted,
          lastSyncedAt: new Date().toISOString()
        }
      }));
      
      get().saveToStorage();
    }
  } catch (error) {
    console.error('Failed to load Step 6 from backend:', error);
    throw error;
  }
},
  reset: () => {
    const resetData: OnboardingData = { 
      submitted: false, 
      isSyncing: false,
      lastSyncedAt: undefined,
      syncError: undefined
    };
    set({ data: resetData });
    const uid = getCurrentUserId();
    if (uid && typeof window !== 'undefined') {
      localStorage.removeItem(`onboarding_${uid}`);
    }
  },

  markSubmitted: () => {
    set((state) => {
      const newData = { ...state.data, submitted: true };
      saveDataToStorage(newData);
      return { data: newData };
    });
  },

  loadFromStorage: () => {
    const data = loadDataFromStorage();
    set({ data, isLoaded: true });
  },

  saveToStorage: () => {
    const { data } = get();
    saveDataToStorage(data);
  },
}));