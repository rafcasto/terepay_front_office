'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step4Schema, Step4FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';
import { useOnboardingPersistence } from '@/lib/hooks/useOnboardingPersistence';
import { Skeleton } from '@/components/ui/Skeleton';
import { StepLoadingState } from './StepLoadingStates';
import { useState, useEffect } from 'react';

export default function Step4() {
  const { data, setField, saveStep4ToBackend } = useOnboardingStore();
  const [isSaving, setIsSaving] = useState(false);
  
  // Load saved data and handle backend sync - SAME AS STEP 2
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
  } = useForm<Step4FormData>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      savings: undefined,
      assets: undefined,
      sourceOfFunds: undefined,
      expectedAccountActivity: undefined,
      isPoliticallyExposed: false,
    },
    mode: 'onBlur'  
  });

  // Watch form values for real-time updates - SAME AS STEP 2
  const formValues = watch();

  // Update form when store data changes - SAME AS STEP 2
  useEffect(() => {
    if (isLoaded && !isSyncing) {
      const storeData = {
        savings: data.savings || undefined,
        assets: data.assets || undefined,
        sourceOfFunds: data.sourceOfFunds as Step4FormData['sourceOfFunds'] || undefined,
        expectedAccountActivity: data.expectedAccountActivity as Step4FormData['expectedAccountActivity'] || undefined,
        isPoliticallyExposed: data.isPoliticallyExposed || false,
      };

      reset(storeData);
      console.log('Step 4 form reset with store data:', storeData);
    }
  }, [data, isLoaded, isSyncing, reset]);

  // Update store when form values change - SAME AS STEP 2
  const updateField = (field: keyof Step4FormData, value: Step4FormData[typeof field]) => {
    setField(field, value);
    setValue(field, value);
  };

  // Handle continue button - SAME PATTERN AS STEP 2
  const handleContinue = async () => {
    setIsSaving(true);

    try {
      // Get current form values
      const currentValues = formValues as Step4FormData;
      
      // Update store with current form data
      Object.entries(currentValues).forEach(([key, value]) => {
        setField(key as keyof Step4FormData, value);
      });

      // Save to backend
      await saveStep4ToBackend();
      
      // Navigate to next step on success
      if (typeof window !== 'undefined') {
        window.location.href = '/onboarding/5';
      }
      
    } catch (error) {
      console.error('Continue error:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state - SAME AS STEP 2
  if (isInitializing || !isLoaded) {
    return <StepLoadingState step={4} />;
  }

  // Show initialization error - SAME AS STEP 2
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

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Assets & Financial Profile</h2>
        <p className="text-sm text-gray-600 mb-4">Information about your assets and financial profile helps us understand your overall financial position.</p>
      </div>

      {/* Sync Status - SAME AS STEP 2 */}
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
              <Skeleton className="h-4 w-4 mr-2" variant="circular" />
            )}
            <span className={`text-sm ${
              syncError ? 'text-red-700' : isSyncing ? 'text-blue-700' : 'text-green-700'
            }`}>
              {syncError ? `Sync error: ${syncError}` : 
               isSyncing ? 'Saving...' : 
               `Last saved: ${lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Unknown'}`}
            </span>
          </div>
        </div>
      )}

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
            Total Value of Assets
          </label>
          <Input
            {...register('assets', {
              onChange: (e) => updateField('assets', parseFloat(e.target.value) || undefined),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="0"
            max="10000000"
            step="1000"
            error={errors.assets?.message}
          />
          <p className="text-xs text-gray-500 mt-1">Car, property, valuables, etc.</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">AML/KYC Information</h3>
        <p className="text-sm text-gray-600">The following information is required under New Zealand&apos;s Anti-Money Laundering and Countering Financing of Terrorism Act.</p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source of Funds *
          </label>
          <select
            {...register('sourceOfFunds', {
              onChange: (e) => updateField('sourceOfFunds', e.target.value)
            })}
            className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer transition-colors ${
              errors.sourceOfFunds ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select source of funds</option>
            <option value="employment">Employment Income</option>
            <option value="business">Business Income</option>
            <option value="investments">Investment Returns</option>
            <option value="savings">Personal Savings</option>
            <option value="inheritance">Inheritance</option>
            <option value="gift">Gift from Family</option>
            <option value="pension">Pension/Superannuation</option>
            <option value="benefits">Government Benefits</option>
            <option value="other">Other (will require explanation)</option>
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
            className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer transition-colors ${
              errors.expectedAccountActivity ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select expected activity</option>
            <option value="low">Low (occasional small transactions)</option>
            <option value="medium">Medium (regular moderate transactions)</option>
            <option value="high">High (frequent or large transactions)</option>
          </select>
          {errors.expectedAccountActivity && (
            <p className="mt-1 text-sm text-red-600">{errors.expectedAccountActivity.message}</p>
          )}
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              {...register('isPoliticallyExposed', {
                onChange: (e) => updateField('isPoliticallyExposed', e.target.checked)
              })}
              type="checkbox"
              className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
            />
          </div>
          <div className="ml-3 text-sm">
            <label className="font-medium text-gray-700">
              I am a Politically Exposed Person (PEP)
            </label>
            <p className="text-gray-500">
              This includes politicians, senior government officials, judicial officers, military officers, or immediate family members of such persons.
            </p>
          </div>
        </div>
      </div>

      <Navigation 
        step={4}
        isValid={isValid && isLoaded}
        isLoading={isSaving || isSyncing}
        onSubmit={handleContinue}
      />
    </div>
  );
}