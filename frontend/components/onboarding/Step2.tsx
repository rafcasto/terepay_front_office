'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step2Schema, Step2FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';
import { useOnboardingPersistence } from '@/lib/hooks/useOnboardingPersistence';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useState, useEffect } from 'react';

export default function Step2() {
  const { data, setField, saveStep2ToBackend } = useOnboardingStore();
  const [isSaving, setIsSaving] = useState(false);
  
  // Load saved data and handle backend sync - SAME AS STEP 1
  const { 
    isLoaded, 
    isInitializing, 
    initError, 
    isSyncing = false,
    syncError = null,
    lastSyncedAt
  } = useOnboardingPersistence();

  const {
    register,
    formState: { errors, isValid },
    setValue,
    watch,
    reset
  } = useForm<Step2FormData>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      employmentType: undefined,
      employer: '',
      jobTitle: '',
      employmentDuration: '',
      monthlyIncome: undefined,
      otherIncome: 0,
    },
    mode: 'onBlur'  
  });

  // Watch form values for real-time updates - SAME AS STEP 1
  const formValues = watch();

  // Update form when store data changes - SAME AS STEP 1
  useEffect(() => {
    if (isLoaded && !isSyncing) {
      const storeData = {
        employmentType: data.employmentType || undefined,
        employer: data.employer || '',
        jobTitle: data.jobTitle || '',
        employmentDuration: data.employmentDuration || '',
        monthlyIncome: data.monthlyIncome || undefined,
        otherIncome: data.otherIncome || 0,
      };

      reset(storeData);
      console.log('Step 2 form reset with store data:', storeData);
    }
  }, [data, isLoaded, isSyncing, reset]);

  // Update store when form values change - SAME AS STEP 1
  const updateField = (field: keyof Step2FormData, value: Step2FormData[typeof field]) => {
    setField(field, value);
    setValue(field, value);
  };

  // Handle continue button - SAME PATTERN AS STEP 1
  const handleContinue = async () => {
    setIsSaving(true);

    try {
      // Get current form values
      const currentValues = formValues as Step2FormData;
      
      // Update store with current form data
      Object.entries(currentValues).forEach(([key, value]) => {
        setField(key as keyof Step2FormData, value);
      });

      // Save to backend
      await saveStep2ToBackend();
      
      // Navigate to next step on success
      if (typeof window !== 'undefined') {
        window.location.href = '/onboarding/3';
      }
      
    } catch (error) {
      console.error('Continue error:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state - SAME AS STEP 1
  if (isInitializing || !isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading onboarding data...</p>
        </div>
      </div>
    );
  }

  // Show initialization error - SAME AS STEP 1
  if (initError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Initialization Error</h3>
          <p className="text-red-700 text-sm mt-1">{initError}</p>
        </div>
      </div>
    );
  }

  const employmentType = watch('employmentType');
  const isEmployed = employmentType && !['unemployed', 'retired'].includes(employmentType);

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Employment & Income</h2>
        <p className="text-sm text-gray-600 mb-4">This information helps us assess your ability to repay and comply with responsible lending requirements.</p>
      </div>

      {/* Sync Status - SAME AS STEP 1 */}
      {(isSyncing || syncError || lastSyncedAt) && (
        <div className={`p-3 rounded-lg border ${
          syncError 
            ? 'bg-red-50 border-red-200' 
            : isSyncing 
              ? 'bg-blue-50 border-blue-200'
              : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-center space-x-2">
            {isSyncing && (
              <LoadingSpinner size="sm" />
            )}
            <span className={`text-sm ${
              syncError ? 'text-red-700' : isSyncing ? 'text-blue-700' : 'text-green-700'
            }`}>
              {syncError ? `Sync error: ${syncError}` : 
               isSyncing ? 'Saving...' : 
               `Last saved: ${lastSyncedAt ? new Date(lastSyncedAt).toLocaleString() : 'Unknown'}`}
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Employment Type *
        </label>
        <select
          {...register('employmentType', {
            onChange: (e) => updateField('employmentType', e.target.value || undefined)
          })}
          className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer transition-colors ${
            errors.employmentType ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select employment type</option>
          <option value="full_time">Full-time Employee</option>
          <option value="part_time">Part-time Employee</option>
          <option value="self_employed">Self-employed</option>
          <option value="unemployed">Unemployed</option>
          <option value="retired">Retired</option>
        </select>
        {errors.employmentType && (
          <p className="mt-1 text-sm text-red-600">{errors.employmentType.message}</p>
        )}
      </div>

      {isEmployed && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employer Name *
              </label>
              <Input
                {...register('employer', {
                  onChange: (e) => updateField('employer', e.target.value)
                })}
                placeholder="Company or employer name"
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Duration *
            </label>
            <select
              {...register('employmentDuration', {
                onChange: (e) => updateField('employmentDuration', e.target.value || undefined)
              })}
              className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer transition-colors ${
                errors.employmentDuration ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select duration</option>
              <option value="less_than_3_months">Less than 3 months</option>
              <option value="3_to_6_months">3-6 months</option>
              <option value="6_months_to_1_year">6 months - 1 year</option>
              <option value="1_to_2_years">1-2 years</option>
              <option value="2_to_5_years">2-5 years</option>
              <option value="more_than_5_years">More than 5 years</option>
            </select>
            {errors.employmentDuration && (
              <p className="mt-1 text-sm text-red-600">{errors.employmentDuration.message}</p>
            )}
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Income *
          </label>
          <Input
            {...register('monthlyIncome', {
              onChange: (e) => updateField('monthlyIncome', parseFloat(e.target.value) || undefined),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="0"
            max="50000"
            step="100"
            error={errors.monthlyIncome?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other Income
          </label>
          <Input
            {...register('otherIncome', {
              onChange: (e) => updateField('otherIncome', parseFloat(e.target.value) || 0),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="0"
            max="50000"
            step="100"
            error={errors.otherIncome?.message}
          />
        </div>
      </div>

      {/* Continue Button - SAME AS STEP 1 */}
      <Navigation 
        step={2} 
        isValid={isValid}
        isLoading={isSaving || isSyncing}
        onSubmit={handleContinue}
      />
    </div>
  );
}