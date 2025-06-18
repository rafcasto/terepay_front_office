// Base types for API compatibility
export interface ApiCompatible {
    [key: string]: string | number | boolean | null | undefined;
  }
  
  // Step 1 interfaces with proper API compatibility
  export interface Step1ApiData extends ApiCompatible {
    fullName: string;
    dob: string;
    address: string;
    email: string;
    phoneNumber: string;
    nzResidencyStatus: 'citizen' | 'permanent_resident' | 'temporary_resident' | 'work_visa' | 'student_visa';
    taxNumber?: string;
  }
  
  export interface Step1ResponseData extends Step1ApiData {
    id?: number;
    firebase_uid?: string;
    stepCompleted: number;
    isCompleted: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  export interface OnboardingStatusData extends ApiCompatible {
    stepCompleted: number;
    isCompleted: boolean;
    created_at?: string;
    updated_at?: string;
  }
  
  // Utility type to ensure API compatibility
  export type ToApiData<T> = {
    [K in keyof T]: T[K] extends string | number | boolean | null | undefined 
      ? T[K] 
      : T[K] extends object 
        ? ToApiData<T[K]> 
        : never;
  } & ApiCompatible;