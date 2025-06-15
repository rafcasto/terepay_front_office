// Updated Step2.tsx - Enhanced Employment Information
'use client';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step2() {
  const { data, setField } = useOnboardingStore();
  useAutoSaveOnboarding();

  return (
    <form className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Employment & Income</h2>
        <p className="text-sm text-gray-600 mb-4">This information helps us assess your ability to repay and comply with responsible lending requirements.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Employment Type *
        </label>
        <div className="relative">
          <select
            value={data.employmentType || ''}
            onChange={(e) => setField('employmentType', e.target.value)}
            className="w-full appearance-none border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer hover:border-gray-400 transition-colors"
            required
          >
            <option value="">Select employment type</option>
            <option value="full_time">Full-time Employee</option>
            <option value="part_time">Part-time Employee</option>
            <option value="self_employed">Self-employed</option>
            <option value="unemployed">Unemployed</option>
            <option value="retired">Retired</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {data.employmentType && data.employmentType !== 'unemployed' && data.employmentType !== 'retired' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employer Name *
              </label>
              <input
                type="text"
                placeholder="Your employer or business name"
                value={data.employer || ''}
                onChange={(e) => setField('employer', e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title/Position *
              </label>
              <input
                type="text"
                placeholder="Your job title"
                value={data.jobTitle || ''}
                onChange={(e) => setField('jobTitle', e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How long have you been in this role? *
            </label>
          <div className="relative">
            <select
              value={data.employmentDuration || ''}
              onChange={(e) => setField('employmentDuration', e.target.value)}
              className="w-full appearance-none border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer hover:border-gray-400 transition-colors"
              required
            >
              <option value="">Select duration</option>
              <option value="less_than_3_months">Less than 3 months</option>
              <option value="3_to_6_months">3-6 months</option>
              <option value="6_to_12_months">6-12 months</option>
              <option value="1_to_2_years">1-2 years</option>
              <option value="2_to_5_years">2-5 years</option>
              <option value="more_than_5_years">More than 5 years</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          </div>
        </>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Primary Monthly Income (after tax) *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={data.monthlyIncome || ''}
              onChange={(e) => setField('monthlyIncome', parseFloat(e.target.value))}
              className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other Monthly Income (after tax)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              placeholder="0.00"
              value={data.otherIncome || ''}
              onChange={(e) => setField('otherIncome', parseFloat(e.target.value))}
              className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Benefits, investments, rental income, etc.</p>
        </div>
      </div>

      <Navigation step={2} />
    </form>
  );
}