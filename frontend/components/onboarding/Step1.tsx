// File: components/onboarding/Step1.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step1Schema, Step1FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';

export default function Step1() {
  const { data, setField } = useOnboardingStore();

  const {
    register,
    
    formState: { errors, isValid },
    setValue
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: data.fullName || '',
      dob: data.dob || '',
      address: data.address || '',
      email: data.email || '',
      phoneNumber: data.phoneNumber || '',
      nzResidencyStatus: data.nzResidencyStatus || undefined,
      taxNumber: data.taxNumber || '',
    },
    mode: 'onBlur'
  });

  // Update store when form values change
  const updateField = (field: keyof Step1FormData, value: Step1FormData[typeof field]) => {
    setField(field, value);
    setValue(field, value);
  };



  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Personal Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          We collect this information to comply with New Zealand&apos;s Anti-Money Laundering and Countering Financing of Terrorism Act 2009.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Legal Name *
          </label>
          <Input
            {...register('fullName', {
              onChange: (e) => updateField('fullName', e.target.value)
            })}
            placeholder="As per your NZ ID document"
            error={errors.fullName?.message}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <Input
            {...register('dob', {
              onChange: (e) => updateField('dob', e.target.value)
            })}
            type="date"
            error={errors.dob?.message}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Residential Address *
        </label>
        <Input
          {...register('address', {
            onChange: (e) => updateField('address', e.target.value)
          })}
          placeholder="Full address including postcode"
          error={errors.address?.message}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <Input
            {...register('email', {
              onChange: (e) => updateField('email', e.target.value)
            })}
            type="email"
            placeholder="your.email@example.com"
            error={errors.email?.message}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number *
          </label>
          <Input
            {...register('phoneNumber', {
              onChange: (e) => updateField('phoneNumber', e.target.value)
            })}
            type="tel"
            placeholder="+64 21 XXX XXXX"
            error={errors.phoneNumber?.message}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          NZ Residency Status *
        </label>
        <select
          {...register('nzResidencyStatus', {
            onChange: (e) => updateField('nzResidencyStatus', e.target.value)
          })}
          className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer transition-colors ${
            errors.nzResidencyStatus ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select your residency status</option>
          <option value="citizen">New Zealand Citizen</option>
          <option value="permanent_resident">Permanent Resident</option>
          <option value="temporary_resident">Temporary Resident</option>
          <option value="other">Other</option>
        </select>
        {errors.nzResidencyStatus && (
          <p className="mt-1 text-sm text-red-600">{errors.nzResidencyStatus.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          IRD Number (optional)
        </label>
        <Input
          {...register('taxNumber', {
            onChange: (e) => updateField('taxNumber', e.target.value)
          })}
          placeholder="XXX-XXX-XXX"
          error={errors.taxNumber?.message}
        />
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              Why we need this information
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                As a registered Financial Service Provider in New Zealand, we are required by law to verify your identity and assess your financial situation to ensure responsible lending practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Use Navigation component with validation */}
      <Navigation step={1} isValid={isValid} /></div>
  );
}