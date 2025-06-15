// Updated Step5.tsx - Fixed Loan Term and Interest Rate from Environment
'use client';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';
import { useEffect, useState } from 'react';

export default function Step5() {
  const { data, setField } = useOnboardingStore();
  const [loanTerm] = useState(process.env.NEXT_PUBLIC_LOAN_TERM || '8 weeks');
  const [interestRate] = useState(process.env.NEXT_PUBLIC_INTEREST_RATE || '5');
  
  useAutoSaveOnboarding();

  // Set the fixed loan term when component mounts
  useEffect(() => {
    setField('loanTerm', loanTerm);
  }, [loanTerm, setField]);

  // Calculate total repayment amount
  const calculateRepayment = (amount: number) => {
    if (!amount) return 0;
    const principal = amount;
    const rate = parseFloat(interestRate) / 100;
    const total = principal + (principal * rate);
    return total;
  };

  const loanAmount = data.loanAmount || 0;
  const totalRepayment = calculateRepayment(loanAmount);
  const weeklyRepayment = loanAmount ? totalRepayment / 8 : 0;

  return (
    <form className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Loan Request</h2>
        <p className="text-sm text-gray-600 mb-4">Tell us about the loan you&apos;re seeking and confirm your understanding of the terms.</p>
      </div>

      {/* Loan Terms Display */}
      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Our Standard Loan Terms</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-orange-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Loan Term</p>
                <p className="text-lg font-semibold text-gray-900">{loanTerm}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-orange-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600">Interest Rate</p>
                <p className="text-lg font-semibold text-gray-900">{interestRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount Requested *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">$</span>
            <input
              type="number"
              placeholder="1,000"
              value={data.loanAmount || ''}
              onChange={(e) => setField('loanAmount', parseFloat(e.target.value))}
              className="w-full border border-gray-300 p-3 pl-8 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Maximum loan amount: $5,000</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Purpose of Loan *
          </label>
          <div className="relative">
            <select
              value={data.loanPurpose || ''}
              onChange={(e) => setField('loanPurpose', e.target.value)}
              className="w-full appearance-none border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer hover:border-gray-400 transition-colors"
              required
            >
              <option value="">Select purpose</option>
              <option value="debt_consolidation">Debt Consolidation</option>
              <option value="home_improvement">Home Improvement</option>
              <option value="vehicle_purchase">Vehicle Purchase</option>
              <option value="education">Education/Training</option>
              <option value="medical">Medical Expenses</option>
              <option value="business">Business Investment</option>
              <option value="emergency">Emergency Expenses</option>
              <option value="other">Other</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Repayment Calculator */}
      {loanAmount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Repayment Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Principal Amount</p>
              <p className="text-2xl font-bold text-gray-900">${loanAmount.toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Interest ({interestRate}%)</p>
              <p className="text-2xl font-bold text-orange-600">${(totalRepayment - loanAmount).toLocaleString()}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total to Repay</p>
              <p className="text-2xl font-bold text-red-600">${totalRepayment.toLocaleString()}</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-blue-200">
            <div className="text-center">
              <p className="text-sm text-gray-600">Weekly Payment ({loanTerm})</p>
              <p className="text-xl font-bold text-gray-900">${weeklyRepayment.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4 bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-gray-800">Responsible Lending Declarations</h3>
        <p className="text-sm text-gray-600">As required by the CCCFA, please confirm your understanding:</p>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="understand-terms"
                type="checkbox"
                checked={data.understandsTerms || false}
                onChange={(e) => setField('understandsTerms', e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="understand-terms" className="font-medium text-gray-700">
                I understand the terms and conditions of this loan *
              </label>
              <p className="text-gray-600">
                Including interest rates, fees, repayment schedule, and consequences of default.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="can-afford"
                type="checkbox"
                checked={data.canAffordRepayments || false}
                onChange={(e) => setField('canAffordRepayments', e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
                required
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="can-afford" className="font-medium text-gray-700">
                I can afford the loan repayments without hardship *
              </label>
              <p className="text-gray-600">
                Based on my income and expenses, I can meet repayments without substantial hardship.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="received-advice"
                type="checkbox"
                checked={data.hasReceivedAdvice || false}
                onChange={(e) => setField('hasReceivedAdvice', e.target.checked)}
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="received-advice" className="font-medium text-gray-700">
                I have received or declined financial advice
              </label>
              <p className="text-gray-600">
                I understand I can seek independent financial advice before proceeding.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-orange-800">
              Important Information
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                Your loan application will be assessed based on responsible lending criteria. We may decline applications that don&apos;t meet our affordability requirements, even if you meet other criteria.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Navigation step={5} />
    </form>
  );
}