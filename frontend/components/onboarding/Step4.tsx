'use client';

import { useOnboardingStore } from '@/store/onboardingStore';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step4() {
  const { data, setField } = useOnboardingStore();
  useAutoSaveOnboarding();

  return (
    <form className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Assets</h2>
      <input
        type="number"
        placeholder="Total Savings"
        value={data.savings || ''}
        onChange={(e) => setField('savings', parseFloat(e.target.value))}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Owned Property or Vehicles"
        value={data.assets || ''}
        onChange={(e) => setField('assets', e.target.value)}
        className="w-full border p-2 rounded"
      />
      <Navigation step={4} />
    </form>
  );
}
