// File: components/onboarding/Step3.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useOnboardingStore } from '@/store/onboardingStore';
import { step3Schema, Step3FormData } from '@/lib/utils/validators';
import { Input } from '@/components/ui/Input';
import { Navigation } from './Navigation';

export default function Step3() {
  const { data, setField } = useOnboardingStore();

  const {
    register,
    formState: { errors, isValid },
    setValue
  } = useForm<Step3FormData>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      rent: data.rent || 0,
      monthlyExpenses: data.monthlyExpenses || 0,
      debts: data.debts || 0,
      dependents: data.dependents || 0,
    },
    mode: 'onBlur'
  });

  const updateField = (field: keyof Step3FormData, value: Step3FormData[typeof field]) => {
    setField(field, value);
    setValue(field, value);
  };

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <h2 className="text-xl font-bold mb-2 text-gray-800">Monthly Expenses & Obligations</h2>
        <p className="text-sm text-gray-600 mb-4">We need to understand your financial commitments to ensure you can afford loan repayments.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Rent/Mortgage *
          </label>
          <Input
            {...register('rent', {
              onChange: (e) => updateField('rent', parseFloat(e.target.value) || 0),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="0"
            max="10000"
            step="50"
            error={errors.rent?.message}
          />
          <p className="text-xs text-gray-500 mt-1">Housing costs including utilities if applicable</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Other Monthly Expenses *
          </label>
          <Input
            {...register('monthlyExpenses', {
              onChange: (e) => updateField('monthlyExpenses', parseFloat(e.target.value) || 0),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="0"
            max="20000"
            step="50"
            error={errors.monthlyExpenses?.message}
          />
          <p className="text-xs text-gray-500 mt-1">Food, transport, insurance, phone, entertainment, etc.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Existing Debts & Loans *
          </label>
          <Input
            {...register('debts', {
              onChange: (e) => updateField('debts', parseFloat(e.target.value) || 0),
              valueAsNumber: true
            })}
            type="number"
            placeholder="0.00"
            min="0"
            max="500000"
            step="100"
            error={errors.debts?.message}
          />
          <p className="text-xs text-gray-500 mt-1">Credit cards, personal loans, car loans, etc.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Number of Dependents *
          </label>
          <select
            {...register('dependents', {
              onChange: (e) => updateField('dependents', parseInt(e.target.value)),
              valueAsNumber: true
            })}
            className={`w-full appearance-none border p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white pr-10 cursor-pointer transition-colors ${
              errors.dependents ? 'border-red-300' : 'border-gray-300'
            }`}
          >
            <option value="">Select number</option>
            <option value={0}>0</option>
            <option value={1}>1</option>
            <option value={2}>2</option>
            <option value={3}>3</option>
            <option value={4}>4</option>
            <option value={5}>5 or more</option>
          </select>
          {errors.dependents && (
            <p className="mt-1 text-sm text-red-600">{errors.dependents.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">Children and other people you financially support</p>
        </div>
      </div>

      {/* Expense breakdown helper */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-3">Monthly Expense Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700">
          <div>
            <h4 className="font-medium mb-2">Essential Expenses:</h4>
            <ul className="space-y-1">
              <li>• Groceries and household items</li>
              <li>• Transport (fuel, public transport)</li>
              <li>• Phone and internet</li>
              <li>• Insurance (health, car, contents)</li>
              <li>• Utilities (if not included in rent)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Other Expenses:</h4>
            <ul className="space-y-1">
              <li>• Entertainment and dining out</li>
              <li>• Clothing and personal care</li>
              <li>• Medical and dental costs</li>
              <li>• Savings and investments</li>
              <li>• Gifts and charity</li>
            </ul>
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
              CCCFA Requirements
            </h3>
            <div className="mt-2 text-sm text-orange-700">
              <p>
                Under New Zealand&apos;s Credit Contracts and Consumer Finance Act, we must make reasonable inquiries about your financial situation to ensure any credit is suitable for you.
              </p>
            </div>
          </div>
        </div>
      </div>

      <Navigation step={3} isValid={isValid} />
    </div>
  );
}