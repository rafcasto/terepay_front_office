'use client';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step3() {
  const { data, setField } = useOnboardingStore();
  useAutoSaveOnboarding();

  return (
    <form className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Monthly Expenses & Obligations</h2>
        <p className="text-sm text-gray-600 mb-4">We need to understand your financial commitments to ensure you can afford loan repayments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Rent/Mortgage *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={data.rent || ''}
              onChange={(e) => setField('rent', parseFloat(e.target.value))}
              className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other Monthly Expenses *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={data.monthlyExpenses || ''}
              onChange={(e) => setField('monthlyExpenses', parseFloat(e.target.value))}
              className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Food, utilities, transport, insurance, etc.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Existing Loan Repayments
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={data.existingLoans || ''}
              onChange={(e) => setField('existingLoans', parseFloat(e.target.value))}
              className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Personal loans, car loans, student loans</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Credit Card Minimum Payments
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={data.creditCardDebt || ''}
              onChange={(e) => setField('creditCardDebt', parseFloat(e.target.value))}
              className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Number of Dependents *
        </label>
        <div className="relative">
          <select
            value={data.dependents || ''}
            onChange={(e) => setField('dependents', parseInt(e.target.value))}
            className="w-full appearance-none border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer hover:border-gray-400 transition-colors"
            required
          >
            <option value="">Select number</option>
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5 or more</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-1">Children and other people you financially support</p>
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
              CCCFA Requirements
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Under New Zealand&apos;s Credit Contracts and Consumer Finance Act, we must make reasonable inquiries about your financial situation to ensure any credit is suitable for you.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Navigation step={3} />
    </form>
  );
}