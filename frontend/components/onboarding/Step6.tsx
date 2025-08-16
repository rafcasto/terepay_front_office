'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step6Schema, Step6FormData } from '@/lib/utils/validators';
import { Navigation } from './Navigation';
import { StepLoadingState } from './StepLoadingStates';
import { useOnboardingPersistence } from '@/lib/hooks/useOnboardingPersistence';
import { useOnboardingStatus } from '@/lib/hooks/useOnboardingStatus';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Step6 = () => {
  const router = useRouter();
  const { data, setField, saveStep6ToBackend } = useOnboardingStore();
  const [isSaving, setIsSaving] = useState(false);

  const { 
    isLoaded, 
    isInitializing, 
    initError, 
    isSyncing,
    syncError,
    lastSyncedAt
  } = useOnboardingPersistence();

  // File state for the actual File objects (not persisted)
  const [identityDoc, setIdentityDoc] = useState<File | undefined>(undefined);
  const [addressProof, setAddressProof] = useState<File | undefined>(undefined);
  const [incomeProof, setIncomeProof] = useState<File | undefined>(undefined);

  const {
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<Step6FormData>({
    resolver: zodResolver(step6Schema),
    defaultValues: {
      documentsUploaded: false,
      identityDocumentUploaded: false,
      addressProofUploaded: false,
      incomeProofUploaded: false,
    },
    mode: 'onBlur'  
  });

  // Watch form values for real-time updates
  const formValues = watch();

  // Initialize file states from store on mount
  useEffect(() => {
    if (data.document) setIdentityDoc(data.document);
    if (data.addressProof) setAddressProof(data.addressProof);
    if (data.incomeProof) setIncomeProof(data.incomeProof);
  }, [data.document, data.addressProof, data.incomeProof]);

  // Update form when store data changes
  useEffect(() => {
    if (isLoaded && !isSyncing) {
      const hasIdentity = !!identityDoc;
      const hasAddress = !!addressProof;
      const hasIncome = !!incomeProof;
      const allUploaded = hasIdentity && hasAddress && hasIncome;

      const storeData = {
        documentsUploaded: allUploaded,
        identityDocumentUploaded: hasIdentity,
        addressProofUploaded: hasAddress,
        incomeProofUploaded: hasIncome,
      };

      reset(storeData);
      console.log('Step 6 form reset with store data:', storeData);
    }
  }, [identityDoc, addressProof, incomeProof, isLoaded, isSyncing, reset]);

  // Update store when form values change
  const updateField = (field: keyof Step6FormData, value: Step6FormData[typeof field]) => {
    setValue(field, value);
  };

  // File upload handlers
  const handleIdentityUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || undefined;
    setIdentityDoc(file);
    setField('document', file);
    updateField('identityDocumentUploaded', !!file);
    updateDocumentsUploadedStatus(file, addressProof, incomeProof);
  };

  const handleAddressUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || undefined;
    setAddressProof(file);
    setField('addressProof', file);
    updateField('addressProofUploaded', !!file);
    updateDocumentsUploadedStatus(identityDoc, file, incomeProof);
  };

  const handleIncomeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || undefined;
    setIncomeProof(file);
    setField('incomeProof', file);
    updateField('incomeProofUploaded', !!file);
    updateDocumentsUploadedStatus(identityDoc, addressProof, file);
  };

  const updateDocumentsUploadedStatus = (identity?: File, address?: File, income?: File) => {
    const allUploaded = !!identity && !!address && !!income;
    updateField('documentsUploaded', allUploaded);
  };

  // Handle continue button
  const handleContinue = async () => {
    setIsSaving(true);

    try {
      // Get current form values
      const currentValues = formValues as Step6FormData;
      
      // Validate that all documents are uploaded
      if (!identityDoc) {
        throw new Error('Please upload a valid ID document before proceeding.');
      }
      
      if (!addressProof) {
        throw new Error('Please upload proof of address before proceeding.');
      }

      if (!incomeProof) {
        throw new Error('Please upload proof of income before proceeding.');
      }

      // Update store with current form data
      Object.entries(currentValues).forEach(([key, value]) => {
        updateField(key as keyof Step6FormData, value);
      });

      // Save to backend
      await saveStep6ToBackend();
      
      // Mark onboarding as complete in the store
      setField('isCompleted', true);
      
      // Navigate to dashboard on success
      router.push('/dashboard');
      
    } catch (error) {
      console.error('Failed to save Step 6:', error);
      throw error; // Let Navigation component handle the error display
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state or initialization error after all hooks are initialized
  if (isInitializing || !isLoaded) {
    return <StepLoadingState step={6} />;
  }

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
        <h2 className="text-xl font-bold mb-2 text-gray-800">Document Upload</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload the required documents to complete your application. All documents must be clear, current, and in English (or accompanied by certified translations).
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
          <div className="flex items-center space-x-2">
            {isSyncing && (
              <div className="animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full" />
            )}
            <span className={`text-sm ${
              syncError ? 'text-red-700' : isSyncing ? 'text-blue-700' : 'text-green-700'
            }`}>
              {syncError ? `Sync error: ${syncError}` : 
               isSyncing ? 'Saving...' : 
               `Last saved: ${lastSyncedAt ? new Date(lastSyncedAt).toLocaleTimeString() : 'Never'}`}
            </span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Identity Document */}
        <div className="border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Identity Document *</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a clear photo of your government-issued photo ID (passport, driver&apos;s license, or Kiwi Access Card).
          </p>
          
          <div className="mt-2">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleIdentityUpload}
              disabled={isSaving || isSyncing}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          {identityDoc && (
            <div className="mt-2 text-sm text-green-600">
              ✓ {identityDoc.name} uploaded ({Math.round(identityDoc.size / 1024)} KB)
            </div>
          )}
          
          {errors.identityDocumentUploaded && (
            <p className="mt-1 text-sm text-red-600">{errors.identityDocumentUploaded.message}</p>
          )}
          
          <div className="mt-2 text-xs text-gray-500">
            Accepted formats: JPG, PNG, PDF (max 5MB)
          </div>
        </div>

        {/* Address Proof */}
        <div className="border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Proof of Address *</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a recent document showing your current address (utility bill, bank statement, or rates notice - dated within 3 months).
          </p>
          
          <div className="mt-2">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleAddressUpload}
              disabled={isSaving || isSyncing}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          {addressProof && (
            <div className="mt-2 text-sm text-green-600">
              ✓ {addressProof.name} uploaded ({Math.round(addressProof.size / 1024)} KB)
            </div>
          )}
          
          {errors.addressProofUploaded && (
            <p className="mt-1 text-sm text-red-600">{errors.addressProofUploaded.message}</p>
          )}
          
          <div className="mt-2 text-xs text-gray-500">
            Accepted formats: JPG, PNG, PDF (max 5MB)
          </div>
        </div>

        {/* Income Proof */}
        <div className="border border-gray-300 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Proof of Income *</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload recent payslips, benefit statements, or bank statements showing your income (last 2-3 months).
          </p>
          
          <div className="mt-2">
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.pdf"
              onChange={handleIncomeUpload}
              disabled={isSaving || isSyncing}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100
                disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          
          {incomeProof && (
            <div className="mt-2 text-sm text-green-600">
              ✓ {incomeProof.name} uploaded ({Math.round(incomeProof.size / 1024)} KB)
            </div>
          )}
          
          {errors.incomeProofUploaded && (
            <p className="mt-1 text-sm text-red-600">{errors.incomeProofUploaded.message}</p>
          )}
          
          <div className="mt-2 text-xs text-gray-500">
            Accepted formats: JPG, PNG, PDF (max 5MB)
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
              Document Security
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Your documents are encrypted and stored securely. We only use them for identity verification and loan assessment as required by New Zealand law.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Final Declarations</h3>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Before You Submit
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Please review all information for accuracy. Once submitted, changes cannot be made to your application. You will receive a confirmation email with next steps.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p>By submitting this application, I declare that:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>All information provided is true, complete, and accurate</li>
            <li>I understand this is a credit application and will appear on my credit file</li>
            <li>I consent to credit and identity checks being performed</li>
            <li>I have read and agree to the Terms and Conditions and Privacy Policy</li>
            <li>I understand the loan terms and can afford the repayments</li>
          </ul>
        </div>
      </div>

      {/* Validation status for debugging */}
      {errors.documentsUploaded && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">
            ⚠️ {errors.documentsUploaded.message}
          </p>
        </div>
      )}

      {/* Navigation component */}
      <Navigation 
        step={6}
        isFinalStep={true}        
        isLoading={isSaving || isSyncing}
        onSubmit={handleContinue}
      />
    </div>
  );
};

export default Step6;
