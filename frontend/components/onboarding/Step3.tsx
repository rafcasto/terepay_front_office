'use client';

import { useOnboardingStore } from '@/store/onboardingStore';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step3() {
  const { data, setField } = useOnboardingStore();
  useAutoSaveOnboarding();

  return (
    <form className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Expenses</h2>
      <input
        type="number"
        placeholder="Monthly Rent"
        value={data.rent || ''}
        onChange={(e) => setField('rent', parseFloat(e.target.value))}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Outstanding Debts"
        value={data.debts || ''}
        onChange={(e) => setField('debts', parseFloat(e.target.value))}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Number of Dependents"
        value={data.dependents || ''}
        onChange={(e) => setField('dependents', parseInt(e.target.value))}
        className="w-full border p-2 rounded"
      />
      <Navigation step={3} />
    </form>
  );
}
