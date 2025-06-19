import { apiClient } from '@/lib/firebase/api';
import { 
  Step1Data,
  Step1ApiData,
  Step1ResponseData,
  Step2Data,
  Step2ApiData,
  Step2ResponseData,
  OnboardingStatusData,
  OnboardingStatus,
  SavedStep1Data,
  SavedStep2Data
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
}