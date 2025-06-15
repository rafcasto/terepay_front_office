'use client';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step1() {
  const { data, setField } = useOnboardingStore();
  useAutoSaveOnboarding();

  return (
    <form className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Personal Information</h2>
        <p className="text-sm text-gray-600 mb-4">We collect this information to comply with New Zealand&apos;s Anti-Money Laundering and Countering Financing of Terrorism Act 2009.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Legal Name *
          </label>
          <input
            type="text"
            placeholder="As per your NZ ID document"
            value={data.fullName || ''}
            onChange={(e) => setField('fullName', e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            value={data.dob || ''}
            onChange={(e) => setField('dob', e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Residential Address *
        </label>
        <input
          type="text"
          placeholder="Full address including postcode"
          value={data.address || ''}
          onChange={(e) => setField('address', e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            placeholder="your.email@example.com"
            value={data.email || ''}
            onChange={(e) => setField('email', e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number *
          </label>
          <input
            type="tel"
            placeholder="+64 21 XXX XXXX"
            value={data.phoneNumber || ''}
            onChange={(e) => setField('phoneNumber', e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            NZ Residency Status *
          </label>
          <div className="relative">
            <select
              value={data.nzResidencyStatus || ''}
              onChange={(e) => setField('nzResidencyStatus', e.target.value)}
              className="w-full appearance-none border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer hover:border-gray-400 transition-colors"
              required
            >
              <option value="">Select status</option>
              <option value="citizen">NZ Citizen</option>
              <option value="permanent_resident">Permanent Resident</option>
              <option value="temporary_resident">Temporary Resident</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IRD Number (optional)
          </label>
          <input
            type="text"
            placeholder="XXX-XXX-XXX"
            value={data.taxNumber || ''}
            onChange={(e) => setField('taxNumber', e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              Why we need this information
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                As a registered Financial Service Provider in New Zealand, we&apos;re required by law to verify your identity and assess your financial situation to ensure responsible lending practices.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Navigation step={1} />
    </form>
  );
}