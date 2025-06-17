'use client';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useState, useEffect } from 'react';
import { useOnboardingPersistence } from '@/lib/hooks/useOnboardingPersistence';


export default function Step6() {
  const router = useRouter();
  const { data, setField, markSubmitted } = useOnboardingStore();
  const [identityDoc, setIdentityDoc] = useState<File | undefined>(undefined);
  const [addressProof, setAddressProof] = useState<File | undefined>(undefined);
  const [incomeProof, setIncomeProof] = useState<File | undefined>(undefined);

  // Use consistent persistence hook
  useOnboardingPersistence();

  // Initialize file states from store on mount
  useEffect(() => {
    if (data.document) setIdentityDoc(data.document);
    if (data.addressProof) setAddressProof(data.addressProof);
    if (data.incomeProof) setIncomeProof(data.incomeProof);
  }, [data.document, data.addressProof, data.incomeProof]);

  const handleIdentityUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || undefined;
    setIdentityDoc(file);
    setField('document', file);
  };

  const handleAddressUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || undefined;
    setAddressProof(file);
    setField('addressProof', file);
  };

  const handleIncomeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || undefined;
    setIncomeProof(file);
    setField('incomeProof', file);
  };

  const handleSubmit = () => {
    // Validate required documents
    if (!identityDoc) {
      alert('Please upload a valid ID document before proceeding.');
      return;
    }
    
    if (!addressProof) {
      alert('Please upload proof of address before proceeding.');
      return;
    }

    if (!incomeProof) {
      alert('Please upload proof of income before proceeding.');
      return;
    }

    // Mark as submitted and redirect
    markSubmitted();
    router.push('/onboarding/confirmation');
  };

  const isValid = identityDoc && addressProof && incomeProof;

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Document Upload</h2>
        <p className="text-sm text-gray-600 mb-4">
          Upload the required documents to complete your application. All documents must be clear, current, and in English (or accompanied by certified translations).
        </p>
      </div>

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
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100"
            />
          </div>
          
          {identityDoc && (
            <div className="mt-2 text-sm text-green-600">
              ✓ {identityDoc.name} uploaded
            </div>
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
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100"
            />
          </div>
          
          {addressProof && (
            <div className="mt-2 text-sm text-green-600">
              ✓ {addressProof.name} uploaded
            </div>
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
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-orange-50 file:text-orange-700
                hover:file:bg-orange-100"
            />
          </div>
          
          {incomeProof && (
            <div className="mt-2 text-sm text-green-600">
              ✓ {incomeProof.name} uploaded
            </div>
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

      <div className="flex justify-between pt-6">
        <button
          onClick={() => router.push('/onboarding/5')}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        
        <button
          onClick={handleSubmit}
          disabled={!isValid}
          className={`px-8 py-2 rounded-lg font-semibold transition-colors ${
            isValid
              ? 'bg-orange-600 text-white hover:bg-orange-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Submit Application
        </button>
      </div>
    </div>
  );
}