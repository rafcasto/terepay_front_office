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

// Step 2 interfaces with proper API compatibility
export interface Step2ApiData extends ApiCompatible {
  employmentType: 'full_time' | 'part_time' | 'self_employed' | 'contract' | 'casual' | 'unemployed' | 'retired' | 'student';
  employer?: string;
  jobTitle?: string;
  employmentDuration?: 'less_than_3_months' | '3_to_6_months' | '6_months_to_1_year' | '1_to_2_years' | '2_to_5_years' | 'more_than_5_years';
  monthlyIncome?: number;
  otherIncome?: number;
}

export interface Step2ResponseData extends Step2ApiData {
  id?: number;
  firebase_uid?: string;
  stepCompleted: number;
  isCompleted: boolean;
  created_at?: string;
  updated_at?: string;
}

// Status interfaces
export interface OnboardingStatusData extends ApiCompatible {
  stepCompleted: number;
  isCompleted: boolean;
  created_at?: string;
  updated_at?: string;
}

// Domain model interfaces (for frontend components)
export interface Step1Data {
  fullName: string;
  dob: string;
  address: string;
  email: string;
  phoneNumber: string;
  nzResidencyStatus: 'citizen' | 'permanent_resident' | 'temporary_resident' | 'work_visa' | 'student_visa';
  taxNumber?: string;
}

export interface Step2Data {
  employmentType: 'full_time' | 'part_time' | 'self_employed' | 'contract' | 'casual' | 'unemployed' | 'retired' | 'student';
  employer?: string;
  jobTitle?: string;
  employmentDuration?: 'less_than_3_months' | '3_to_6_months' | '6_months_to_1_year' | '1_to_2_years' | '2_to_5_years' | 'more_than_5_years';
  monthlyIncome?: number;
  otherIncome?: number;
}

export interface OnboardingStatus {
  stepCompleted: number;
  isCompleted: boolean;
  created_at?: string;
  updated_at?: string;
}

// Extended data interfaces with backend metadata
export interface SavedStep1Data extends Step1Data {
  stepCompleted: number;
  isCompleted: boolean;
}

export interface SavedStep2Data extends Step2Data {
  stepCompleted: number;
  isCompleted: boolean;
}

// Utility type to ensure API compatibility
export type ToApiData<T> = {
  [K in keyof T]: T[K] extends string | number | boolean | null | undefined 
    ? T[K] 
    : T[K] extends object 
      ? ToApiData<T[K]> 
      : never;
} & ApiCompatible;

// Type guards for runtime validation
export function isStep1ApiData(data: unknown): data is Step1ApiData {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.fullName === 'string' &&
    typeof obj.dob === 'string' &&
    typeof obj.address === 'string' &&
    typeof obj.email === 'string' &&
    typeof obj.phoneNumber === 'string' &&
    typeof obj.nzResidencyStatus === 'string' &&
    ['citizen', 'permanent_resident', 'temporary_resident', 'work_visa', 'student_visa'].includes(obj.nzResidencyStatus as string) &&
    (obj.taxNumber === undefined || typeof obj.taxNumber === 'string')
  );
}

export function isStep2ApiData(data: unknown): data is Step2ApiData {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.employmentType === 'string' &&
    ['full_time', 'part_time', 'self_employed', 'contract', 'casual', 'unemployed', 'retired', 'student'].includes(obj.employmentType as string) &&
    (obj.employer === undefined || typeof obj.employer === 'string') &&
    (obj.jobTitle === undefined || typeof obj.jobTitle === 'string') &&
    (obj.employmentDuration === undefined || 
      ['less_than_3_months', '3_to_6_months', '6_months_to_1_year', '1_to_2_years', '2_to_5_years', 'more_than_5_years'].includes(obj.employmentDuration as string)) &&
    (obj.monthlyIncome === undefined || typeof obj.monthlyIncome === 'number') &&
    (obj.otherIncome === undefined || typeof obj.otherIncome === 'number')
  );
}