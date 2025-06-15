// File: components/onboarding/Step1.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step1Schema, Step1FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';
import { useOnboardingPersistence } from '@/lib/hooks/useOnboardingPersistence';

export default function Step1() {
  const { data, setField } = useOnboardingStore();
  
  // Load saved data on component mount
  useOnboardingPersistence();

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

  // Update store when form values change (auto-saves to localStorage)
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
            Full Name *
          </label>
          <Input
            {...register('fullName', {
              onChange: (e) => updateField('fullName', e.target.value)
            })}
            placeholder="Enter your full name"
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
          Current Address *
        </label>
        <Input
          {...register('address', {
            onChange: (e) => updateField('address', e.target.value)
          })}
          placeholder="Enter your complete address"
          error={errors.address?.message}
        />
        <p className="text-xs text-gray-500 mt-1">
          Include street number, street name, suburb, city, and postcode
        </p>
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
            placeholder="+64 21 123 4567"
            error={errors.phoneNumber?.message}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Zealand Residency Status *
          </label>
          <select
            {...register('nzResidencyStatus', {
              onChange: (e) => updateField('nzResidencyStatus', e.target.value as Step1FormData['nzResidencyStatus'])
            })}
            className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer ${
              errors.nzResidencyStatus ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select residency status</option>
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
            placeholder="123-456-789"
            error={errors.taxNumber?.message}
          />
          <p className="text-xs text-gray-500 mt-1">
            Required for loan approval if you have one
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Data Protection
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Your personal information is protected under the Privacy Act 2020 and will only be used for loan assessment and compliance purposes.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Navigation step={1} isValid={isValid} />
    </div>
  );
}