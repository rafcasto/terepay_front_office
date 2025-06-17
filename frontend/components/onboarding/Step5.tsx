'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step5Schema, Step5FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';
import { useEffect, useState } from 'react';
import { useOnboardingPersistence } from '@/lib/hooks/useOnboardingPersistence';

export default function Step5() {
  const { data, setField } = useOnboardingStore();
  const [loanTerm] = useState(process.env.NEXT_PUBLIC_LOAN_TERM || '8 weeks');
  const [interestRate] = useState(process.env.NEXT_PUBLIC_INTEREST_RATE || '5');
  
  // Load saved data on component mount
  useOnboardingPersistence();

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

  // Calculate repayment amounts - UPDATED FOR FORTNIGHTLY PAYMENTS
  const loanAmount = watch('loanAmount') || 0;
  const calculateRepayment = (amount: number) => {
    if (!amount) return 0;
    const principal = amount;
    const rate = parseFloat(interestRate) / 100;
    const total = principal + (principal * rate);
    return total;
  };

  const totalRepayment = calculateRepayment(loanAmount);
  const fortnightlyRepayment = loanAmount ? totalRepayment / 4 : 0; // 4 fortnightly payments instead of 8 weekly

  // Affordability check - UPDATED FOR FORTNIGHTLY PAYMENTS
  const totalIncome = (data.monthlyIncome || 0) + (data.otherIncome || 0);
  const totalExpenses = (data.rent || 0) + (data.monthlyExpenses || 0);
  const disposableIncome = totalIncome - totalExpenses;
  const monthlyRepayment = fortnightlyRepayment * 2.17; // 2.17 fortnights per month (26 fortnights / 12 months)
  const repaymentToIncomeRatio = disposableIncome > 0 ? (monthlyRepayment / disposableIncome) * 100 : 0;

  const isAffordable = repaymentToIncomeRatio <= 30; // 30% threshold

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Loan Details & Terms</h2>
        <p className="text-sm text-gray-600 mb-4">Specify your loan requirements and confirm your understanding of the terms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Amount Requested *
          </label>
          <Input
            {...register('loanAmount', {
              onChange: (e) => updateField('loanAmount', parseFloat(e.target.value) || undefined),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="100"
            max="2000"
            step="50"
            error={errors.loanAmount?.message}
          />
          <p className="text-xs text-gray-500 mt-1">Between $100 - $2,000</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loan Term
          </label>
          <Input
            {...register('loanTerm')}
            value={loanTerm}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">Fixed term for all loans</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Purpose of Loan *
        </label>
        <select
          {...register('loanPurpose', {
            onChange: (e) => updateField('loanPurpose', e.target.value)
          })}
          className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer transition-colors ${
            errors.loanPurpose ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select loan purpose</option>
          <option value="emergency_expense">Emergency Expense</option>
          <option value="medical_bills">Medical Bills</option>
          <option value="car_repair">Car Repair</option>
          <option value="home_repair">Home Repair</option>
          <option value="utility_bills">Utility Bills</option>
          <option value="education">Education Expenses</option>
          <option value="debt_consolidation">Debt Consolidation</option>
          <option value="moving_costs">Moving Costs</option>
          <option value="other">Other</option>
        </select>
        {errors.loanPurpose && (
          <p className="mt-1 text-sm text-red-600">{errors.loanPurpose.message}</p>
        )}
      </div>

      {loanAmount > 0 && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Repayment Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Loan Amount:</span>
              <span className="font-semibold ml-2">${loanAmount.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Interest Rate:</span>
              <span className="font-semibold ml-2">{interestRate}%</span>
            </div>
            <div>
              <span className="text-gray-600">Total to Repay:</span>
              <span className="font-semibold ml-2">${totalRepayment.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-600">Fortnightly Payment:</span>
              <span className="font-semibold ml-2">${fortnightlyRepayment.toFixed(2)}</span>
            </div>
          </div>
          
          {disposableIncome > 0 && (
            <div className={`mt-4 p-3 rounded-md ${isAffordable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {isAffordable ? (
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className="ml-3">
                  <h4 className={`text-sm font-medium ${isAffordable ? 'text-green-800' : 'text-red-800'}`}>
                    Affordability Assessment
                  </h4>
                  <p className={`text-sm ${isAffordable ? 'text-green-700' : 'text-red-700'}`}>
                    Repayment is {repaymentToIncomeRatio.toFixed(1)}% of your disposable income.
                    {isAffordable ? ' This appears affordable.' : ' This may be difficult to afford.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">Responsible Lending Declarations</h3>
        
        <div className="space-y-3">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('understandsTerms', {
                  onChange: (e) => updateField('understandsTerms', e.target.checked)
                })}
                type="checkbox"
                className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                I understand the loan terms and conditions *
              </label>
              <p className="text-gray-500">
                Including interest rates, fees, repayment schedule, and consequences of default.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('canAffordRepayments', {
                  onChange: (e) => updateField('canAffordRepayments', e.target.checked)
                })}
                type="checkbox"
                className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                I can afford the repayments without substantial hardship *
              </label>
              <p className="text-gray-500">
                The repayments will not cause me significant financial difficulty.
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                {...register('hasReceivedAdvice', {
                  onChange: (e) => updateField('hasReceivedAdvice', e.target.checked)
                })}
                type="checkbox"
                className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label className="font-medium text-gray-700">
                I have been advised to seek independent financial advice *
              </label>
              <p className="text-gray-500">
                I understand I should consider seeking independent financial guidance before taking this loan.
              </p>
            </div>
          </div>
        </div>

        {(errors.understandsTerms || errors.canAffordRepayments || errors.hasReceivedAdvice) && (
          <div className="text-red-600 text-sm">
            All declarations must be acknowledged to proceed.
          </div>
        )}
      </div>

      <Navigation step={5} isValid={isValid} />
    </div>
  );
}