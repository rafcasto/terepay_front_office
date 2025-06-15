// File: components/onboarding/Step4.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step4Schema, Step4FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';
import { useOnboardingPersistence } from '@/lib/hooks/useOnboardingPersistence';

export default function Step4() {
  const { data, setField } = useOnboardingStore();
  
  // Load saved data on component mount
  useOnboardingPersistence();

  const {
    register,
    formState: { errors, isValid },
    setValue
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      savings: data.savings || undefined,
      assets: data.assets || '',
      sourceOfFunds: data.sourceOfFunds as Step4FormData['sourceOfFunds'] || undefined,
      expectedAccountActivity: data.expectedAccountActivity as Step4FormData['expectedAccountActivity'] || undefined,
      isPoliticallyExposed: data.isPoliticallyExposed || false,
    },
    mode: 'onBlur'
  });

  const updateField = (field: keyof Step4FormData, value: Step4FormData[typeof field]) => {
    setField(field, value);
    setValue(field, value);
  };

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Assets & Financial Profile</h2>
        <p className="text-sm text-gray-600 mb-4">Information about your assets and financial profile helps us understand your overall financial position.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Savings & Investments
          </label>
          <Input
            {...register('savings', {
              onChange: (e) => updateField('savings', parseFloat(e.target.value) || undefined),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="0"
            max="10000000"
            step="500"
            error={errors.savings?.message}
          />
          <p className="text-xs text-gray-500 mt-1">Bank accounts, KiwiSaver, shares, bonds, term deposits</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Estimated Value of Assets
          </label>
          <Input
            {...register('assets', {
              onChange: (e) => updateField('assets', e.target.value)
            })}
            placeholder="Car, property, valuables, etc."
            error={errors.assets?.message}
          />
          <p className="text-xs text-gray-500 mt-1">Brief description of major assets and their estimated value</p>
        </div>
      </div>

      {/* AML/KYC Compliance Section */}
      <div className="border border-gray-200 rounded-lg p-4 space-y-4">
        <h3 className="text-lg font-medium text-gray-800">Compliance Information</h3>
        <p className="text-sm text-gray-600">Required under Anti-Money Laundering and Countering Financing of Terrorism Act 2009</p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Source of Funds *
          </label>
          <select
            {...register('sourceOfFunds', {
              onChange: (e) => updateField('sourceOfFunds', e.target.value)
            })}
            className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer ${
              errors.sourceOfFunds ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select source of funds</option>
            <option value="employment">Employment/Salary</option>
            <option value="business">Business Income</option>
            <option value="investments">Investment Returns</option>
            <option value="benefits">Government Benefits</option>
            <option value="pension">Pension/Retirement Funds</option>
            <option value="family">Family Support</option>
            <option value="savings">Personal Savings</option>
            <option value="other">Other</option>
          </select>
          {errors.sourceOfFunds && (
            <p className="mt-1 text-sm text-red-600">{errors.sourceOfFunds.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Expected Account Activity *
          </label>
          <select
            {...register('expectedAccountActivity', {
              onChange: (e) => updateField('expectedAccountActivity', e.target.value)
            })}
            className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer ${
              errors.expectedAccountActivity ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select expected activity level</option>
            <option value="low">Low (occasional transactions)</option>
            <option value="medium">Medium (regular transactions)</option>
            <option value="high">High (frequent transactions)</option>
          </select>
          {errors.expectedAccountActivity && (
            <p className="mt-1 text-sm text-red-600">{errors.expectedAccountActivity.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">How often do you expect to use financial services?</p>
        </div>

        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">
            <input
              {...register('isPoliticallyExposed', {
                onChange: (e) => updateField('isPoliticallyExposed', e.target.checked)
              })}
              type="checkbox"
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
            />
          </div>
          <div className="text-sm">
            <label className="font-medium text-gray-700">
              I am a Politically Exposed Person (PEP)
            </label>
            <p className="text-gray-600 mt-1">
              This includes current or former senior political figures, their immediate family members, or close associates. Examples include MPs, mayors, judges, or senior government officials.
            </p>
          </div>
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
              Why We Need This Information
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                This information helps us comply with New Zealand's Anti-Money Laundering laws and assess your overall financial stability. All information is kept strictly confidential.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Navigation step={4} isValid={isValid} />
    </div>
  );
}