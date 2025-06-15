// Updated Step6.tsx - Document Upload with NZ Requirements
'use client';
import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useState } from 'react';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step6() {
  const router = useRouter();
  const { data, setField, markSubmitted } = useOnboardingStore();
  const [identityDoc, setIdentityDoc] = useState<File | null>(data.document || null);
  const [addressProof, setAddressProof] = useState<File | null>(data.addressProof || null);
  const [incomeProof, setIncomeProof] = useState<File | null>(data.incomeProof || null);

  useAutoSaveOnboarding();

  const handleIdentityUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setIdentityDoc(file);
    setField('document', file);
  };

  const handleAddressUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAddressProof(file);
    setField('addressProof', file);
  };

  const handleIncomeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
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

    markSubmitted();
    const uid = JSON.parse(localStorage.getItem('firebase:authUser') || '{}')?.uid;

    if (uid) {
      localStorage.setItem(
        `onboarding_${uid}`,
        JSON.stringify({ ...data, submitted: true })
      );
    }
    router.push('/onboarding/confirmation');
  };

  return (
    <form className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Document Verification</h2>
        <p className="text-sm text-gray-600 mb-4">Upload the required documents to verify your identity and financial situation as required by New Zealand law.</p>
      </div>

      <div className="space-y-6">
        {/* Identity Document */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Identity Verification *</h3>
          <p className="text-sm text-gray-600 mb-3">
            Upload one of the following: NZ Passport, NZ Driver License, or other government-issued photo ID
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <label htmlFor="identity-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {identityDoc ? identityDoc.name : 'Click to upload ID document'}
                </span>
                <input
                  id="identity-upload"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleIdentityUpload}
                  className="sr-only"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">PDF or image up to 10MB</p>
            </div>
          </div>
          
          {identityDoc && (
            <div className="mt-3 flex items-center text-sm text-green-600">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Uploaded: {identityDoc.name}
            </div>
          )}
        </div>

        {/* Address Proof */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Proof of Address *</h3>
          <p className="text-sm text-gray-600 mb-3">
            Upload a recent utility bill, bank statement, or council rates notice (within last 3 months)
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <label htmlFor="address-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {addressProof ? addressProof.name : 'Click to upload address proof'}
                </span>
                <input
                  id="address-upload"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleAddressUpload}
                  className="sr-only"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">PDF or image up to 10MB</p>
            </div>
          </div>
          
          {addressProof && (
            <div className="mt-3 flex items-center text-sm text-green-600">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Uploaded: {addressProof.name}
            </div>
          )}
        </div>

        {/* Income Proof */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Proof of Income</h3>
          <p className="text-sm text-gray-600 mb-3">
            Upload recent payslips, bank statements, or tax returns (recommended but optional)
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-400 transition-colors">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="mt-4">
              <label htmlFor="income-upload" className="cursor-pointer">
                <span className="mt-2 block text-sm font-medium text-gray-900">
                  {incomeProof ? incomeProof.name : 'Click to upload income proof (optional)'}
                </span>
                <input
                  id="income-upload"
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleIncomeUpload}
                  className="sr-only"
                />
              </label>
              <p className="mt-1 text-xs text-gray-500">PDF or image up to 10MB</p>
            </div>
          </div>
          
          {incomeProof && (
            <div className="mt-3 flex items-center text-sm text-green-600">
              <svg className="h-4 w-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Uploaded: {incomeProof.name}
            </div>
          )}
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Document Requirements
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Documents must be clear and legible</li>
                <li>ID documents must be current and not expired</li>
                <li>Address proof must be dated within the last 3 months</li>
                <li>All documents are securely stored and encrypted</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <Navigation step={6} isFinalStep onSubmit={handleSubmit} />
    </form>
  );
}