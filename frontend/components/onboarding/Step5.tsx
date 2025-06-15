// File: components/onboarding/Step5.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step5Schema, Step5FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';
import { useEffect, useState } from 'react';

export default function Step5() {
  const { data, setField } = useOnboardingStore();
  const [loanTerm] = useState(process.env.NEXT_PUBLIC_LOAN_TERM || '8 weeks');
  const [interestRate] = useState(process.env.NEXT_PUBLIC_INTEREST_RATE || '5');

  const {
    register,
    formState: { errors, isValid },
    setValue,
    watch
  } = useForm<Step5FormData>({
    resolver: zodResolver(step5Schema),
    defaultValues: {
      loanAmount: data.loanAmount || undefined,
      loanPurpose: data.loanPurpose || '',
      loanTerm: data.loanTerm || '',
      understandsTerms: data.understandsTerms || false,
      canAffordRepayments: data.canAffordRepayments || false,
      hasReceivedAdvice: data.hasReceivedAdvice || false,
    },
    mode: 'onBlur'
  });

  // Set the fixed loan term when component mounts
  useEffect(() => {
    setField('loanTerm', loanTerm);
    setValue('loanTerm', loanTerm);
  }, [loanTerm, setField, setValue]);

  const updateField = (field: keyof Step5FormData, value: Step5FormData[typeof field]) => {
    setField(field, value);
    setValue(field, value);
  };

  // Calculate repayment amounts
  const loanAmount = watch('loanAmount') || 0;
  const calculateRepayment = (amount: number) => {
    if (!amount) return 0;
    const principal = amount;
    const rate = parseFloat(interestRate) / 100;
    const total = principal + (principal * rate);
    return total;
  };

  const totalRepayment = calculateRepayment(loanAmount);
  const weeklyRepayment = loanAmount ? totalRepayment / 8 : 0;

  // Affordability check
  const totalIncome = (data.monthlyIncome || 0) + (data.otherIncome || 0);
  const totalExpenses = (data.rent || 0) + (data.monthlyExpenses || 0);
  const disposableIncome = totalIncome - totalExpenses;
  const monthlyRepayment = weeklyRepayment * 4.33; // Average weeks per month
  const repaymentToIncomeRatio = disposableIncome > 0 ? (monthlyRepayment / disposableIncome) * 100 : 0;
  const isAffordable = repaymentToIncomeRatio <= 30;

  return (
    <div className="space-y-6">
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
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

      {/* Loan Amount Input */}
      <div className="md:w-1/2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loan Amount Requested *
        </label>
        <Input
          {...register('loanAmount', {
            onChange: (e) => updateField('loanAmount', parseFloat(e.target.value) || 0),
            valueAsNumber: true
          })}
          type="number"
          placeholder="0.00"
          min="100"
          max="5000"
          step="50"
          error={errors.loanAmount?.message}
        />
      </div>

      {/* Loan Purpose */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Loan Purpose *
        </label>
        <textarea
          {...register('loanPurpose', {
            onChange: (e) => updateField('loanPurpose', e.target.value)
          })}
          placeholder="Please describe what you need this loan for (minimum 10 characters)"
          className={`w-full border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
            errors.loanPurpose ? 'border-red-300' : 'border-gray-300'
          }`}
          rows={3}
          minLength={10}
        />
        {errors.loanPurpose && (
          <p className="mt-1 text-sm text-red-600">{errors.loanPurpose.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Be specific about how you plan to use the funds (e.g., emergency medical bills, car repair, etc.)
        </p>
      </div>

      {/* Repayment Calculation */}
      {loanAmount > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Repayment Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Loan Amount</p>
              <p className="text-xl font-bold text-gray-900">${loanAmount.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Repayment</p>
              <p className="text-xl font-bold text-gray-900">${totalRepayment.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Weekly Payment</p>
              <p className="text-xl font-bold text-gray-900">${weeklyRepayment.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Affordability Assessment */}
      {loanAmount > 0 && disposableIncome > 0 && (
        <div className={`border rounded-lg p-4 ${isAffordable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className={`h-5 w-5 ${isAffordable ? 'text-green-400' : 'text-red-400'}`} viewBox="0 0 20 20" fill="currentColor">
                {isAffordable ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                )}
              </svg>
            </div>
            <div className="ml-3">
              <h3 className={`text-sm font-medium ${isAffordable ? 'text-green-800' : 'text-red-800'}`}>
                Affordability Assessment
              </h3>
              <div className={`mt-2 text-sm ${isAffordable ? 'text-green-700' : 'text-red-700'}`}>
                <p>
                  Monthly repayment (${monthlyRepayment.toFixed(2)}) represents {repaymentToIncomeRatio.toFixed(1)}% of your disposable income.
                  {isAffordable 
                    ? ' This appears affordable based on responsible lending guidelines.' 
                    : ' This exceeds 30% of disposable income - please consider a smaller loan amount.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Required Declarations */}
      <div className="space-y-4 border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-800">Required Declarations</h3>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('understandsTerms', {
                  onChange: (e) => updateField('understandsTerms', e.target.checked)
                })}
                type="checkbox"
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                I understand the loan terms and conditions *
              </label>
              <p className="text-gray-600">
                I have read and understand the interest rate, fees, repayment schedule, and consequences of default.
              </p>
              {errors.understandsTerms && (
                <p className="mt-1 text-red-600">{errors.understandsTerms.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('canAffordRepayments', {
                  onChange: (e) => updateField('canAffordRepayments', e.target.checked)
                })}
                type="checkbox"
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                I can afford the repayments *
              </label>
              <p className="text-gray-600">
                I confirm that I can comfortably make the required weekly repayments without financial hardship.
              </p>
              {errors.canAffordRepayments && (
                <p className="mt-1 text-red-600">{errors.canAffordRepayments.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('hasReceivedAdvice', {
                  onChange: (e) => updateField('hasReceivedAdvice', e.target.checked)
                })}
                type="checkbox"
                className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 focus:ring-2"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                I have received or declined financial advice *
              </label>
              <p className="text-gray-600">
                I understand I can seek independent financial advice before proceeding.
              </p>
              {errors.hasReceivedAdvice && (
                <p className="mt-1 text-red-600">{errors.hasReceivedAdvice.message}</p>
              )}
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

      <Navigation step={5} isValid={isValid} />
    </div>
  );
}