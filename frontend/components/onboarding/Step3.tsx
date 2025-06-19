'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step3Schema, Step3FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';
import { useOnboardingPersistence } from '@/lib/hooks/useOnboardingPersistence';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useState, useEffect } from 'react';

export default function Step3() {
  const { data, setField, saveStep3ToBackend } = useOnboardingStore();
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
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      rent: undefined,
      monthlyExpenses: undefined,
      debts: undefined,
      dependents: 0,
    },
    mode: 'onBlur'  
  });

  // Watch form values for real-time updates - SAME AS STEP 2
  const formValues = watch();

  // Update form when store data changes - SAME AS STEP 2
  useEffect(() => {
    if (isLoaded && !isSyncing) {
      const storeData = {
        rent: data.rent || undefined,
        monthlyExpenses: data.monthlyExpenses || undefined,
        debts: data.debts || undefined,
        dependents: data.dependents || 0,
      };

      reset(storeData);
      console.log('Step 3 form reset with store data:', storeData);
    }
  }, [data, isLoaded, isSyncing, reset]);

  // Update store when form values change - SAME AS STEP 2
  const updateField = (field: keyof Step3FormData, value: Step3FormData[typeof field]) => {
    setField(field, value);
    setValue(field, value);
  };

  // Handle continue button - SAME PATTERN AS STEP 2
  const handleContinue = async () => {
    setIsSaving(true);

    try {
      // Get current form values
      const currentValues = formValues as Step3FormData;
      
      // Update store with current form data
      Object.entries(currentValues).forEach(([key, value]) => {
        setField(key as keyof Step3FormData, value);
      });

      // Save to backend
      await saveStep3ToBackend();
      
      console.log('Step 3 data saved successfully, navigating to step 4');
      
      // Navigate to next step
      if (typeof window !== 'undefined') {
        window.location.href = '/onboarding/4';
      }
    } catch (error) {
      console.error('Failed to save Step 3 data:', error);
      // Error will be shown via syncError from the store
      throw error; // Re-throw to prevent navigation
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading spinner during initialization OR while syncing initially - SAME AS STEP 2
  if (isInitializing || (isSyncing && !isLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show initialization error - SAME AS STEP 2
  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Initialization Error</h3>
            <p className="text-red-600">{initError}</p>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Don't render form until data is loaded to prevent empty field flash
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Monthly Expenses & Obligations</h2>
        <p className="text-sm text-gray-600 mb-4">We need to understand your financial commitments to ensure you can afford loan repayments.</p>
      </div>

      {/* Sync status indicators - SAME AS STEP 2 */}
      {isSyncing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center">
            <LoadingSpinner className="w-4 h-4 mr-2" />
            <span className="text-sm text-blue-700">Syncing your data...</span>
          </div>
        </div>
      )}

      {syncError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-red-700">{syncError}</span>
          </div>
        </div>
      )}

      {lastSyncedAt && !isSyncing && !syncError && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center">
            <svg className="h-4 w-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-green-700">Data synchronized successfully</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Rent/Mortgage *
          </label>
          <Input
            {...register('rent', {
              onChange: (e) => updateField('rent', parseFloat(e.target.value) || 0),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="0"
            max="10000"
            step="50"
            error={errors.rent?.message}
          />
          <p className="text-xs text-gray-500 mt-1">Housing costs including utilities if applicable</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other Monthly Expenses *
          </label>
          <Input
            {...register('monthlyExpenses', {
              onChange: (e) => updateField('monthlyExpenses', parseFloat(e.target.value) || 0),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="0"
            max="20000"
            step="50"
            error={errors.monthlyExpenses?.message}
          />
          <p className="text-xs text-gray-500 mt-1">Food, transport, insurance, phone, entertainment, etc.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Existing Debts & Loans *
          </label>
          <Input
            {...register('debts', {
              onChange: (e) => updateField('debts', parseFloat(e.target.value) || 0),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="0"
            max="500000"
            step="100"
            error={errors.debts?.message}
          />
          <p className="text-xs text-gray-500 mt-1">Credit cards, personal loans, car loans, etc.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Dependents *
          </label>
          <select
            {...register('dependents', {
              onChange: (e) => updateField('dependents', parseInt(e.target.value)),
              valueAsNumber: true
            })}
            className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer transition-colors ${
              errors.dependents ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="0">0 dependents</option>
            <option value="1">1 dependent</option>
            <option value="2">2 dependents</option>
            <option value="3">3 dependents</option>
            <option value="4">4 dependents</option>
            <option value="5">5+ dependents</option>
          </select>
          {errors.dependents && (
            <p className="mt-1 text-sm text-red-600">{errors.dependents.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Children or other family members you financially support</p>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Important for Assessment
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Be accurate with your expenses. This information helps us ensure you can comfortably afford loan repayments under the Credit Contracts and Consumer Finance Act (CCCFA).
              </p>
            </div>
          </div>
        </div>
      </div>

      <Navigation 
        step={3}
        isValid={isValid && isLoaded}
        isLoading={isSaving || isSyncing}
        onSubmit={handleContinue}
      />
    </div>
  );
}