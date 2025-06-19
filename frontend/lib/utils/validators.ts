import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  displayName: z.string().min(2, 'Display name must be at least 2 characters').optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const step1Schema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  address: z.string().min(10, 'Please provide a complete address'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(1, 'Mobile number is required'),
  nzResidencyStatus: z.enum(['citizen', 'permanent_resident', 'temporary_resident', 'work_visa','student_visa'], {
    required_error: 'Residency status is required'
  }),
  taxNumber: z.string().optional(),
}).strict(); // Add strict() to prevent extra properties

export type Step1FormData = z.infer<typeof step1Schema>;

// Type guard to ensure data is API compatible
export function isStep1ApiCompatible(data: unknown): data is Step1FormData {
  return step1Schema.safeParse(data).success;
}

// Fixed Step 2: Employment & Income Schema
export const step2Schema = z.object({
  employmentType: z.enum(['full_time', 'part_time', 'self_employed','contract','casual', 'unemployed', 'retired','student'], {
    required_error: 'Employment type is required'
  }),
  employer: z.string().optional(),
  jobTitle: z.string().optional(),
  employmentDuration: z.string().optional(),
  monthlyIncome: z.number().min(0, 'Income cannot be negative').optional(),
  otherIncome: z.number().min(0, 'Income cannot be negative').optional(),
}).superRefine((data, ctx) => {
  // If employed (not unemployed or retired), require employment details
  if (data.employmentType && !['unemployed', 'retired'].includes(data.employmentType)) {
    if (!data.employer || data.employer.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employer name is required for employed individuals",
        path: ["employer"]
      });
    }
    
    if (!data.jobTitle || data.jobTitle.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Job title is required for employed individuals",
        path: ["jobTitle"]
      });
    }
    
    if (!data.employmentDuration || data.employmentDuration.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Employment duration is required for employed individuals",
        path: ["employmentDuration"]
      });
    }
    
    if (!data.monthlyIncome || data.monthlyIncome <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Monthly income is required for employed individuals",
        path: ["monthlyIncome"]
      });
    }
  }
  
  // If unemployed or retired, require other income field to be filled (can be 0)
  if (data.employmentType && ['unemployed', 'retired'].includes(data.employmentType)) {
    if (data.otherIncome === undefined || data.otherIncome === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Please enter your monthly income amount (enter 0 if no income)`,
        path: ["otherIncome"]
      });
    }
  }
});

export type Step2FormData = z.infer<typeof step2Schema>;

// Type guard to ensure Step 2 data is API compatible
export function isStep2ApiCompatible(data: unknown): data is Step2FormData {
  return step2Schema.safeParse(data).success;
}

// Step 3: Monthly Expenses Schema
export const step3Schema = z.object({
  rent: z.number().min(0, 'Amount cannot be negative').max(10000, 'Please enter a realistic amount'),
  monthlyExpenses: z.number().min(0, 'Amount cannot be negative').max(20000, 'Please enter a realistic amount'),
  debts: z.number().min(0, 'Amount cannot be negative').max(500000, 'Please enter a realistic amount'),
  dependents: z.number().min(0, 'Cannot be negative').max(10, 'Please enter a valid number'),
});


export type Step3FormData = z.infer<typeof step3Schema>;

// Step 4: Assets & Financial Profile Schema
export const step4Schema = z.object({
  savings: z.number().min(0, 'Amount cannot be negative').max(10000000, 'Please enter a realistic amount').optional(),
  assets: z.string().optional(),
  sourceOfFunds: z.enum([
    'employment', 'business', 'investments', 'benefits', 
    'pension', 'family', 'savings', 'other'
  ], {
    required_error: 'Source of funds is required for compliance'
  }),
  expectedAccountActivity: z.enum(['low', 'medium', 'high'], {
    required_error: 'Expected account activity level is required'
  }),
  isPoliticallyExposed: z.boolean().optional(),
});

export type Step4FormData = z.infer<typeof step4Schema>;

// Step 5: Loan Request Schema
export const step5Schema = z.object({
  loanAmount: z.number().min(100, 'Minimum loan amount is $100').max(2000, 'Maximum loan amount is $2,000'),
  loanPurpose: z.string().min(10, 'Please provide more detail about the loan purpose'),
  loanTerm: z.string().optional(),
  understandsTerms: z.boolean().refine(val => val === true, 'You must acknowledge understanding the loan terms'),
  canAffordRepayments: z.boolean().refine(val => val === true, 'You must confirm you can afford the repayments'),
  hasReceivedAdvice: z.boolean().refine(val => val === true, 'You must acknowledge the financial advice requirement'),
});

export type Step5FormData = z.infer<typeof step5Schema>;

// Add this to your validators.ts file after step5Schema

// Step 6: Document Upload Schema (we'll validate files in the component)
export const step6Schema = z.object({
  // File validation will be done in the component since Zod can't validate File objects directly
  documentsUploaded: z.boolean().refine(val => val === true, 'Required documents must be uploaded'),
});

export type Step6FormData = z.infer<typeof step6Schema>;