import { apiClient } from '@/lib/firebase/api';
import { 
  Step1ApiData, 
  Step1ResponseData, 
  OnboardingStatusData
} from '@/types/onboarding';

// Domain model (for your components)
export interface Step1Data {
  fullName: string;
  dob: string;
  address: string;
  email: string;
  phoneNumber: string;
  nzResidencyStatus: 'citizen' | 'permanent_resident' | 'temporary_resident' | 'work_visa' | 'student_visa';
  taxNumber?: string;
}

export interface OnboardingStatus {
  stepCompleted: number;
  isCompleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SavedStep1Data extends Step1Data {
  stepCompleted: number;
  isCompleted: boolean;
}

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