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

// Step 3 interfaces with proper API compatibility
export interface Step3ApiData extends ApiCompatible {
  rent: number;
  monthlyExpenses: number;
  debts: number;
  dependents: number;
}

export interface Step3ResponseData extends Step3ApiData {
  id?: number;
  firebase_uid?: string;
  stepCompleted: number;
  isCompleted: boolean;
  created_at?: string;
  updated_at?: string;
}

// Domain model interface for Step 3 (for frontend components)
export interface Step3Data {
  rent: number;
  monthlyExpenses: number;
  debts: number;
  dependents: number;
}

// Extended data interface with backend metadata
export interface SavedStep3Data extends Step3Data {
  stepCompleted: number;
  isCompleted: boolean;
}

// Type guard for Step 3 API data validation
export function isStep3ApiData(data: unknown): data is Step3ApiData {
  if (!data || typeof data !== 'object') return false;
  
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.rent === 'number' &&
    typeof obj.monthlyExpenses === 'number' &&
    typeof obj.debts === 'number' &&
    typeof obj.dependents === 'number' &&
    obj.rent >= 0 && obj.rent <= 10000 &&
    obj.monthlyExpenses >= 0 && obj.monthlyExpenses <= 20000 &&
    obj.debts >= 0 && obj.debts <= 500000 &&
    obj.dependents >= 0 && obj.dependents <= 10
  );
}

// Step 4 interfaces with proper API compatibility
export interface Step4ApiData extends ApiCompatible {
  savings?: number;
  assets?: number;
  sourceOfFunds: string;
  expectedAccountActivity: string;
  isPoliticallyExposed: boolean;
}

export interface Step4ResponseData extends Step4ApiData {
  id?: number;
  firebase_uid?: string;
  stepCompleted: number;
  isCompleted: boolean;
  created_at?: string;
  updated_at?: string;
}

// Domain model interface for Step 4 (for frontend components)
export interface Step4Data {
  savings?: number;
  assets?: number;
  sourceOfFunds: string;
  expectedAccountActivity: string;
  isPoliticallyExposed: boolean;
}

// Extended data interface with backend metadata
export interface SavedStep4Data extends Step4Data {
  stepCompleted: number;
  isCompleted: boolean;
}

// Add Step 5 types
export interface Step5Data {
  loanAmount?: number;
  loanPurpose: string;
  loanTerm?: string;
  understandsTerms: boolean;
  canAffordRepayments: boolean;
  hasReceivedAdvice: boolean;
}

export interface Step5ApiData extends ApiCompatible{
  loanAmount?: number;
  loanPurpose: string;
  loanTerm?: string;
  understandsTerms: boolean;
  canAffordRepayments: boolean;
  hasReceivedAdvice: boolean;
}

export interface Step5ResponseData {
  loanAmount?: number;
  loanPurpose?: string;
  loanTerm?: string;
  understandsTerms: boolean;
  canAffordRepayments: boolean;
  hasReceivedAdvice: boolean;
  stepCompleted: number;
  isCompleted: boolean;
}

export interface SavedStep5Data extends Step5Data {
  stepCompleted: number;
  isCompleted: boolean;
}

// Step 6 interfaces - API Compatible with flattened structure
export interface Step6Data {
  identityDocumentName?: string;
  identityDocumentSize?: number;
  identityDocumentType?: string;
  identityDocumentUploadedAt?: string;
  addressProofName?: string;
  addressProofSize?: number;
  addressProofType?: string;
  addressProofUploadedAt?: string;
  incomeProofName?: string;
  incomeProofSize?: number;
  incomeProofType?: string;
  incomeProofUploadedAt?: string;
}

export interface Step6ApiData extends ApiCompatible {
  identityDocumentName?: string;
  identityDocumentSize?: number;
  identityDocumentType?: string;
  identityDocumentUploadedAt?: string;
  addressProofName?: string;
  addressProofSize?: number;
  addressProofType?: string;
  addressProofUploadedAt?: string;
  incomeProofName?: string;
  incomeProofSize?: number;
  incomeProofType?: string;
  incomeProofUploadedAt?: string;
}

export interface Step6ResponseData extends Step6ApiData {
  id?: number;
  firebase_uid?: string;
  stepCompleted: number;
  isCompleted: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SavedStep6Data extends Step6Data {
  stepCompleted: number;
  isCompleted: boolean;
}