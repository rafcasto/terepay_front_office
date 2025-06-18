'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step1Schema, Step1FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';
import { useOnboardingPersistence } from '@/lib/hooks/useOnboardingPersistence';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useState, useEffect } from 'react';

export default function Step1() {
  const { data, setField, saveStep1ToBackend } = useOnboardingStore();
  const [isSaving, setIsSaving] = useState(false);
  
  // Load saved data and handle backend sync
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
  } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: '',
      dob: '',
      address: '',
      email: '',
      phoneNumber: '',
      nzResidencyStatus: undefined,
      taxNumber: '',
    },
    mode: 'onBlur'
  });

  // Watch form values for real-time updates
  const formValues = watch();

  // Update form when store data changes (from backend load)
  useEffect(() => {
    if (isLoaded && !isSyncing) {
      const storeData = {
        fullName: data.fullName || '',
        dob: data.dob || '',
        address: data.address || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        nzResidencyStatus: data.nzResidencyStatus || undefined,
        taxNumber: data.taxNumber || '',
      };

      // Reset form with store data
      reset(storeData);
      console.log('Form reset with store data:', storeData);
    }
  }, [data, isLoaded, isSyncing, reset]);

  // Update store when form values change (auto-saves to localStorage)
  const updateField = (field: keyof Step1FormData, value: Step1FormData[typeof field]) => {
    setField(field, value);
    setValue(field, value);
  };


  // Handle continue button - auto-saves and navigates
  const handleContinue = async () => {
    setIsSaving(true);

    try {
      // Get current form values
      const currentValues = formValues as Step1FormData;
      
      // Convert to Step1Data format
      
      
      // Update store with current form data
      Object.entries(currentValues).forEach(([key, value]) => {
        setField(key as keyof Step1FormData, value);
      });

      // Save to backend
      await saveStep1ToBackend();
      
      // Navigate to next step on success
      if (typeof window !== 'undefined') {
        window.location.href = '/onboarding/2';
      }
      
    } catch (error) {
      console.error('Continue error:', error);
      // Error will be shown by the store's sync status
      throw error; // Re-throw so Navigation knows there was an error
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while initializing
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

  // Show initialization error
  if (initError) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Initialization Error</h3>
          <p className="text-red-700 text-sm mt-1">{initError}</p>
          <p className="text-red-600 text-xs mt-2">
            You can still fill out the form, but data won&apos;t be saved to the server.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Personal Information</h2>
        <p className="text-sm text-gray-600 mb-4">
          We collect this information to comply with New Zealand&apos;s Anti-Money Laundering and Countering Financing of Terrorism Act 2009.
        </p>
      </div>

      {/* Sync Status Display */}
      {(isSyncing || syncError || lastSyncedAt) && (
        <div className={`p-3 rounded-lg border ${
          syncError 
            ? 'bg-red-50 border-red-200' 
            : isSyncing 
              ? 'bg-blue-50 border-blue-200'
              : 'bg-green-50 border-green-200'
        }`}>
          {isSyncing && (
            <div className="flex items-center text-blue-700 text-sm">
              <LoadingSpinner size="sm" className="mr-2" />
              Syncing data with server...
            </div>
          )}
          {syncError && (
            <div className="text-red-700 text-sm">
              <p className="font-medium">⚠️ Sync Error:</p>
              <p className="mt-1">{syncError}</p>
            </div>
          )}
          {lastSyncedAt && !isSyncing && !syncError && (
            <p className="text-green-700 text-sm">
              ✅ Last synced: {new Date(lastSyncedAt).toLocaleString()}
            </p>
          )}
        </div>
      )}

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
            disabled={isSaving || isSyncing}
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
            disabled={isSaving || isSyncing}
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
          disabled={isSaving || isSyncing}
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
            disabled={isSaving || isSyncing}
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
            disabled={isSaving || isSyncing}
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
            className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              errors.nzResidencyStatus ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={isSaving || isSyncing}
          >
            <option value="">Select your status</option>
            <option value="citizen">New Zealand Citizen</option>
            <option value="permanent_resident">Permanent Resident</option>
            <option value="temporary_resident">Temporary Resident</option>
            <option value="work_visa">Work Visa Holder</option>
            <option value="student_visa">Student Visa Holder</option>
          </select>
          {errors.nzResidencyStatus && (
            <p className="text-red-500 text-xs mt-1">{errors.nzResidencyStatus.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IRD Number (Optional)
          </label>
          <Input
            {...register('taxNumber', {
              onChange: (e) => updateField('taxNumber', e.target.value)
            })}
            placeholder="123-456-789"
            error={errors.taxNumber?.message}
            disabled={isSaving || isSyncing}
          />
          <p className="text-xs text-gray-500 mt-1">
            Your New Zealand tax number if you have one
          </p>
        </div>
      </div>

      {/* Simple Navigation - auto-saves on continue */}
      <Navigation 
        step={1} 
        isValid={isValid}
        isLoading={isSaving || isSyncing}
        onSubmit={handleContinue}
      />
    </div>
  );
}