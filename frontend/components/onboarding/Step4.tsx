// Updated Step4.tsx - Assets & Financial Position
'use client';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step4() {
  const { data, setField } = useOnboardingStore();
  useAutoSaveOnboarding();

  return (
    <form className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Assets & Savings</h2>
        <p className="text-sm text-gray-600 mb-4">Information about your assets helps us understand your overall financial position.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Savings & Investments
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={data.savings || ''}
              onChange={(e) => setField('savings', parseFloat(e.target.value))}
              className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Bank accounts, KiwiSaver, shares, bonds</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other Assets Description
          </label>
          <textarea
            placeholder="Property, vehicles, valuable items..."
            value={data.assets || ''}
            onChange={(e) => setField('assets', e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Source of Funds Declaration</h3>
        <p className="text-sm text-gray-600">For AML compliance, please describe the source of funds for this loan application and your general financial activities.</p>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Source of Income/Wealth *
          </label>
          <div className="relative">
            <select
              value={data.sourceOfFunds || ''}
              onChange={(e) => setField('sourceOfFunds', e.target.value)}
              className="w-full appearance-none border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer hover:border-gray-400 transition-colors"
              required
            >
              <option value="">Select source</option>
              <option value="employment">Employment/Salary</option>
              <option value="business">Business/Self-employment</option>
              <option value="investments">Investments/Dividends</option>
              <option value="benefits">Government Benefits</option>
              <option value="family">Family Support</option>
              <option value="savings">Existing Savings</option>
              <option value="other">Other (please specify below)</option>
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
            Expected Account Activity *
          </label>
          <div className="relative">
            <select
              value={data.expectedAccountActivity || ''}
              onChange={(e) => setField('expectedAccountActivity', e.target.value)}
              className="w-full appearance-none border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer hover:border-gray-400 transition-colors"
              required
            >
              <option value="">Select expected activity</option>
              <option value="low">Low (occasional transactions)</option>
              <option value="medium">Medium (regular monthly activity)</option>
              <option value="high">High (frequent transactions)</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="pep-declaration"
              type="checkbox"
              checked={data.isPoliticallyExposed || false}
              onChange={(e) => setField('isPoliticallyExposed', e.target.checked)}
              className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
            />
          </div>
          <div className="ml-3 text-sm">
            <label htmlFor="pep-declaration" className="font-medium text-gray-700">
              I am a Politically Exposed Person (PEP)
            </label>
            <p className="text-gray-600">
              This includes senior political figures, their immediate family members, and close associates, or senior executives of state-owned enterprises.
            </p>
          </div>
        </div>
      </div>

      <Navigation step={4} />
    </form>
  );
}