// File: components/onboarding/Step2.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step2Schema, Step2FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';
import { useOnboardingPersistence } from '@/lib/hooks/useOnboardingPersistence';

export default function Step2() {
  const { data, setField } = useOnboardingStore();
  
  // Load saved data on component mount
  useOnboardingPersistence();

  const {
    register,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      employmentType: data.employmentType as Step2FormData['employmentType'] || undefined,
      employer: data.employer || '',
      jobTitle: data.jobTitle || '',
      employmentDuration: data.employmentDuration || '',
      monthlyIncome: data.monthlyIncome || undefined,
      otherIncome: data.otherIncome || undefined,
    },
    mode: 'onBlur'
  });

  const updateField = (field: keyof Step2FormData, value: Step2FormData[typeof field]) => {
    setField(field, value);
    setValue(field, value);
  };

  const employmentType = watch('employmentType');
  const isEmployed = employmentType && !['unemployed', 'retired'].includes(employmentType);
  const needsOtherIncome = ['unemployed', 'retired'].includes(employmentType);

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Employment & Income</h2>
        <p className="text-sm text-gray-600 mb-4">This information helps us assess your ability to repay and comply with responsible lending requirements.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Employment Type *
        </label>
        <select
          {...register('employmentType', {
            onChange: (e) => updateField('employmentType', e.target.value)
          })}
          className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer transition-colors ${
            errors.employmentType ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select employment status</option>
          <option value="full_time">Full-time Employee</option>
          <option value="part_time">Part-time Employee</option>
          <option value="self_employed">Self-employed/Contractor</option>
          <option value="unemployed">Unemployed</option>
          <option value="retired">Retired</option>
        </select>
        {errors.employmentType && (
          <p className="mt-1 text-sm text-red-600">{errors.employmentType.message}</p>
        )}
      </div>

      {/* Show employment fields if employed */}
      {isEmployed && (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4">
          <h3 className="text-lg font-medium text-gray-800">Employment Details</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employer Name *
              </label>
              <Input
                {...register('employer', {
                  onChange: (e) => updateField('employer', e.target.value)
                })}
                placeholder="Your employer's name"
                error={errors.employer?.message}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <Input
                {...register('jobTitle', {
                  onChange: (e) => updateField('jobTitle', e.target.value)
                })}
                placeholder="Your position or role"
                error={errors.jobTitle?.message}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employment Duration *
              </label>
              <select
                {...register('employmentDuration', {
                  onChange: (e) => updateField('employmentDuration', e.target.value)
                })}
                className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer ${
                  errors.employmentDuration ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value="">Select duration</option>
                <option value="less_than_3_months">Less than 3 months</option>
                <option value="3_to_6_months">3-6 months</option>
                <option value="6_to_12_months">6-12 months</option>
                <option value="1_to_2_years">1-2 years</option>
                <option value="more_than_2_years">More than 2 years</option>
              </select>
              {errors.employmentDuration && (
                <p className="mt-1 text-sm text-red-600">{errors.employmentDuration.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Income (after tax) *
              </label>
              <Input
                {...register('monthlyIncome', {
                  onChange: (e) => updateField('monthlyIncome', parseFloat(e.target.value) || 0),
                  valueAsNumber: true
                })}
                type="number"
                placeholder="0.00"
                min="0"
                max="50000"
                step="50"
                error={errors.monthlyIncome?.message}
              />
              <p className="text-xs text-gray-500 mt-1">Your regular take-home pay</p>
            </div>
          </div>
        </div>
      )}

      {/* Show other income fields if unemployed/retired */}
      {needsOtherIncome && (
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Income Source</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Income *
            </label>
            <Input
              {...register('otherIncome', {
                onChange: (e) => updateField('otherIncome', parseFloat(e.target.value) || 0),
                valueAsNumber: true
              })}
              type="number"
              placeholder="0.00"
              min="0"
              max="10000"
              step="50"
              error={errors.otherIncome?.message}
            />
            <p className="text-xs text-blue-600 mt-2">
              Include any government benefits, pension, or other regular income sources.
            </p>
          </div>
        </div>
      )}

      {/* Additional income section for all */}
      {!needsOtherIncome && (
        <div className="border-t border-gray-200 pt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Other Monthly Income (optional)
            </label>
            <Input
              {...register('otherIncome', {
                onChange: (e) => updateField('otherIncome', parseFloat(e.target.value) || 0),
                valueAsNumber: true
              })}
              type="number"
              placeholder="0.00"
              min="0"
              max="10000"
              step="50"
              error={errors.otherIncome?.message}
            />
            <p className="text-xs text-gray-500 mt-1">
              Rental income, investments, side business, etc.
            </p>
          </div>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Responsible Lending
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                We assess your income to ensure any loan we offer is suitable for your financial situation and that you can comfortably afford the repayments.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Navigation step={2} isValid={isValid} />
    </div>
  );
}