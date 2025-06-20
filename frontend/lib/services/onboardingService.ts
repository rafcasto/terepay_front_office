import { apiClient } from '@/lib/firebase/api';
import { 
  Step1Data,
  Step1ApiData,
  Step1ResponseData,
  Step2Data,
  Step2ApiData,
  Step2ResponseData,
  Step3Data,
  Step3ApiData,
  Step4Data,
  Step4ApiData,
  Step5ApiData,
  Step5Data,
  Step6Data,
  Step6ApiData,
  Step6ResponseData,
  Step5ResponseData,
  Step4ResponseData,
  Step3ResponseData,
  OnboardingStatusData,
  OnboardingStatus,
  SavedStep1Data,
  SavedStep2Data,
  SavedStep3Data,
  SavedStep4Data,
  SavedStep5Data,
  SavedStep6Data
} from '@/types/onboarding';







export class OnboardingService {
  /**
   * Initialize onboarding tables (call this once when app starts)
   */
  static async initializeOnboarding(): Promise<void> {
    try {
      await apiClient.post('/api/onboarding/initialize');
    } catch (error) {
      console.error('Failed to initialize onboarding:', error);
      throw error;
    }
  }

  /**
   * Convert domain model to API format
   */
  private static toApiFormat(data: Step1Data): Step1ApiData {
    return {
      fullName: data.fullName,
      dob: data.dob,
      address: data.address,
      email: data.email,
      phoneNumber: data.phoneNumber,
      nzResidencyStatus: data.nzResidencyStatus,
      ...(data.taxNumber && { taxNumber: data.taxNumber }),
    };
  }

  /**
   * Convert API response to domain model
   */
  private static fromApiFormat(data: Step1ResponseData): SavedStep1Data {
    return {
      fullName: data.fullName,
      dob: data.dob,
      address: data.address,
      email: data.email,
      phoneNumber: data.phoneNumber,
      nzResidencyStatus: data.nzResidencyStatus,
      taxNumber: data.taxNumber,
      stepCompleted: data.stepCompleted,
      isCompleted: data.isCompleted,
    };
  }

  /**
   * Save Step 1 data to the backend
   */
  static async saveStep1Data(data: Step1Data): Promise<SavedStep1Data> {
    try {
      const apiData = this.toApiFormat(data);
      
      const response = await apiClient.post<Step1ResponseData, Step1ApiData>(
        '/api/onboarding/step1', 
        apiData
      );
      
      return this.fromApiFormat(response);
    } catch (error) {
      console.error('Failed to save Step 1 data:', error);
      throw error;
    }
  }
  
  // Step 2 Methods
  /**
   * Convert Step 2 domain model to API format
   */
  private static toStep2ApiFormat(data: Step2Data): Step2ApiData {
    return {
      employmentType: data.employmentType,
      ...(data.employer && { employer: data.employer }),
      ...(data.jobTitle && { jobTitle: data.jobTitle }),
      ...(data.employmentDuration && { employmentDuration: data.employmentDuration }),
      ...(data.monthlyIncome !== undefined && { monthlyIncome: data.monthlyIncome }),
      ...(data.otherIncome !== undefined && { otherIncome: data.otherIncome }),
    };
  }
   /**
   * Convert Step 2 API response to domain model
   */
   private static fromStep2ApiFormat(data: Step2ResponseData): SavedStep2Data {
    return {
      employmentType: data.employmentType as Step2Data['employmentType'],
      employer: data.employer,
      jobTitle: data.jobTitle,
      employmentDuration: data.employmentDuration,
      monthlyIncome: data.monthlyIncome,
      otherIncome: data.otherIncome,
      stepCompleted: data.stepCompleted,
      isCompleted: data.isCompleted,
    };
  }

  static async saveStep2Data(data: Step2Data): Promise<SavedStep2Data> {
    try {
      const apiData = this.toStep2ApiFormat(data);
      
      const response = await apiClient.post<Step2ResponseData, Step2ApiData>(
        '/api/onboarding/step2', 
        apiData
      );
      
      return this.fromStep2ApiFormat(response);
    } catch (error) {
      console.error('Failed to save Step 2 data:', error);
      throw error;
    }
  }

  /**
   * Get Step 1 data from the backend
   */
  static async getStep1Data(): Promise<SavedStep1Data | null> {
    try {
      const response = await apiClient.get<Step1ResponseData>('/api/onboarding/step1');
      
      if (!response) {
        return null;
      }
      
      return this.fromApiFormat(response);
    } catch (error) {
      console.error('Failed to get Step 1 data:', error);
      // Return null if no data found (user hasn't started onboarding)
      if (error instanceof Error && error.message.includes('No Step 1 data found')) {
        return null;
      }
      throw error;
    }
  }

  static async getStep2Data(): Promise<SavedStep2Data | null> {
    try {
      const response = await apiClient.get<Step2ResponseData>('/api/onboarding/step2');
      
      if (!response) {
        return null;
      }
      
      return this.fromStep2ApiFormat(response);
    } catch (error) {
      console.error('Failed to get Step 2 data:', error);
      // Return null if no data found (user hasn't started step 2)
      if (error instanceof Error && error.message.includes('No Step 2 data found')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get user's onboarding status
   */
  static async getOnboardingStatus(): Promise<OnboardingStatus> {
    try {
      const response = await apiClient.get<OnboardingStatusData>('/api/onboarding/status');
      
      return {
        stepCompleted: response.stepCompleted,
        isCompleted: response.isCompleted,
        created_at: response.created_at,
        updated_at: response.updated_at,
      };
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      throw error;
    }
  }

  // Add these methods to your frontend/lib/services/onboardingService.ts file

/**
 * Convert Step 3 domain model to API format
 */
private static toStep3ApiFormat(data: Step3Data): Step3ApiData {
  return {
    rent: data.rent,
    monthlyExpenses: data.monthlyExpenses,
    debts: data.debts,
    dependents: data.dependents,
  };
}

  /**
   * Convert Step 3 API response to domain model
   */
  private static fromStep3ApiFormat(data: Step3ResponseData): SavedStep3Data {
    return {
      rent: data.rent,
      monthlyExpenses: data.monthlyExpenses,
      debts: data.debts,
      dependents: data.dependents,
      stepCompleted: data.stepCompleted,
      isCompleted: data.isCompleted,
    };
  }

  /**
   * Save Step 3 data to the backend
   */
  static async saveStep3Data(data: Step3Data): Promise<SavedStep3Data> {
    try {
      const apiData = this.toStep3ApiFormat(data);
      
      const response = await apiClient.post<Step3ResponseData, Step3ApiData>(
        '/api/onboarding/step3',
        apiData
      );
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      return this.fromStep3ApiFormat(response);
    } catch (error) {
      console.error('Failed to save Step 3 data:', error);
      throw error;
    }
  }

  /**
   * Get Step 3 data from the backend
   */
  static async getStep3Data(): Promise<SavedStep3Data | null> {
    try {
      const response = await apiClient.get<Step3ResponseData>('/api/onboarding/step3');
      
      if (!response) {
        return null;
      }
      
      return this.fromStep3ApiFormat(response);
    } catch (error) {
      console.error('Failed to get Step 3 data:', error);
      // Return null if no data found (user hasn't started step 3)
      if (error instanceof Error && error.message.includes('No Step 3 data found')) {
        return null;
      }
      throw error;
    }
  }

 // Step 4 Methods
// Add Step4Data, Step4ApiData, Step4ResponseData, SavedStep4Data to your imports

// Step 4 Methods - copy Step 2 pattern exactly
/**
 * Convert Step 4 domain model to API format
 */
private static toStep4ApiFormat(data: Step4Data): Step4ApiData {
  return {
    savings: data.savings,
    assets: data.assets,
    sourceOfFunds: data.sourceOfFunds,
    expectedAccountActivity: data.expectedAccountActivity,
    isPoliticallyExposed: data.isPoliticallyExposed,
  };
}

/**
 * Convert Step 4 API response to domain model
 */
private static fromStep4ApiFormat(data: Step4ResponseData): SavedStep4Data {
  return {
    savings: data.savings,
    assets: data.assets,
    sourceOfFunds: data.sourceOfFunds,
    expectedAccountActivity: data.expectedAccountActivity,
    isPoliticallyExposed: data.isPoliticallyExposed,
    stepCompleted: data.stepCompleted,
    isCompleted: data.isCompleted,
  };
}

static async saveStep4Data(data: Step4Data): Promise<SavedStep4Data> {
  try {
    const apiData = this.toStep4ApiFormat(data);
    
    const response = await apiClient.post<Step4ResponseData, Step4ApiData>(
      '/api/onboarding/step4', 
      apiData
    );
    
    return this.fromStep4ApiFormat(response);
  } catch (error) {
    console.error('Failed to save Step 4 data:', error);
    throw error;
  }
}

static async getStep4Data(): Promise<SavedStep4Data | null> {
  try {
    const response = await apiClient.get<Step4ResponseData>('/api/onboarding/step4');
    
    if (!response) {
      return null;
    }
    
    return this.fromStep4ApiFormat(response);
  } catch (error) {
    console.error('Failed to get Step 4 data:', error);
    if (error instanceof Error && error.message.includes('No Step 4 data found')) {
      return null;
    }
    throw error;
  }
}

/**
 * Convert Step 5 domain model to API format
 */
private static toStep5ApiFormat(data: Step5Data): Step5ApiData {
  return {
    loanAmount: data.loanAmount,
    loanPurpose: data.loanPurpose,
    loanTerm: data.loanTerm,
    understandsTerms: data.understandsTerms,
    canAffordRepayments: data.canAffordRepayments,
    hasReceivedAdvice: data.hasReceivedAdvice,
  };
}

/**
 * Convert Step 5 API response to domain model
 */
private static fromStep5ApiFormat(data: Step5ResponseData): SavedStep5Data {
  return {
    loanAmount: data.loanAmount,
    loanPurpose: data.loanPurpose || '',
    loanTerm: data.loanTerm,
    understandsTerms: data.understandsTerms,
    canAffordRepayments: data.canAffordRepayments,
    hasReceivedAdvice: data.hasReceivedAdvice,
    stepCompleted: data.stepCompleted,
    isCompleted: data.isCompleted,
  };
}

/**
 * Save Step 5 data to the backend
 */
static async saveStep5Data(data: Step5Data): Promise<SavedStep5Data> {
  try {
    const apiData = this.toStep5ApiFormat(data);
    
    const response = await apiClient.post<Step5ResponseData, Step5ApiData>(
      '/api/onboarding/step5',
      apiData
    );
    
    if (!response) {
      throw new Error('No response received from server');
    }
    
    return this.fromStep5ApiFormat(response);
  } catch (error) {
    console.error('Failed to save Step 5 data:', error);
    throw error;
  }
}

/**
 * Get Step 5 data from the backend
 */
static async getStep5Data(): Promise<SavedStep5Data | null> {
  try {
    const response = await apiClient.get<Step5ResponseData>('/api/onboarding/step5');
    
    if (!response) {
      return null;
    }
    
    return this.fromStep5ApiFormat(response);
  } catch (error) {
    console.error('Failed to get Step 5 data:', error);
    // Return null if no data found (user hasn't started step 5)
    if (error instanceof Error && error.message.includes('No Step 5 data found')) {
      return null;
    }
    throw error;
  }
}

// Step 6 Methods - API Compatible
private static toStep6ApiFormat(data: Step6Data): Step6ApiData {
  return {
    identityDocumentName: data.identityDocumentName,
    identityDocumentSize: data.identityDocumentSize,
    identityDocumentType: data.identityDocumentType,
    identityDocumentUploadedAt: data.identityDocumentUploadedAt,
    addressProofName: data.addressProofName,
    addressProofSize: data.addressProofSize,
    addressProofType: data.addressProofType,
    addressProofUploadedAt: data.addressProofUploadedAt,
    incomeProofName: data.incomeProofName,
    incomeProofSize: data.incomeProofSize,
    incomeProofType: data.incomeProofType,
    incomeProofUploadedAt: data.incomeProofUploadedAt,
  };
}

private static fromStep6ApiFormat(data: Step6ResponseData): SavedStep6Data {
  return {
    identityDocumentName: data.identityDocumentName,
    identityDocumentSize: data.identityDocumentSize,
    identityDocumentType: data.identityDocumentType,
    identityDocumentUploadedAt: data.identityDocumentUploadedAt,
    addressProofName: data.addressProofName,
    addressProofSize: data.addressProofSize,
    addressProofType: data.addressProofType,
    addressProofUploadedAt: data.addressProofUploadedAt,
    incomeProofName: data.incomeProofName,
    incomeProofSize: data.incomeProofSize,
    incomeProofType: data.incomeProofType,
    incomeProofUploadedAt: data.incomeProofUploadedAt,
    stepCompleted: data.stepCompleted,
    isCompleted: data.isCompleted,
  };
}

static async saveStep6Data(data: Step6Data): Promise<SavedStep6Data> {
  try {
    const apiData = this.toStep6ApiFormat(data);
    
    const response = await apiClient.post<Step6ResponseData, Step6ApiData>(
      '/api/onboarding/step6', 
      apiData
    );
    
    return this.fromStep6ApiFormat(response);
  } catch (error) {
    console.error('Failed to save Step 6 data:', error);
    throw error;
  }
}

static async getStep6Data(): Promise<SavedStep6Data | null> {
  try {
    const response = await apiClient.get<Step6ResponseData>('/api/onboarding/step6');
    
    if (!response) {
      return null;
    }
    
    return this.fromStep6ApiFormat(response);
  } catch (error) {
    console.error('Failed to get Step 6 data:', error);
    if (error instanceof Error && error.message.includes('No Step 6 data found')) {
      return null;
    }
    throw error;
  }
}
 
}