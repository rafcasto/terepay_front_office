'use client';

import { useOnboardingStore } from '@/store/onboardingStore';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step2() {
  const { data, setField } = useOnboardingStore();
  useAutoSaveOnboarding();

  return (
    <form className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Employment Info</h2>
      <input
        type="text"
        placeholder="Employer Name"
        value={data.employer || ''}
        onChange={(e) => setField('employer', e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Job Title"
        value={data.jobTitle || ''}
        onChange={(e) => setField('jobTitle', e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="number"
        placeholder="Monthly Income"
        value={data.monthlyIncome || ''}
        onChange={(e) => setField('monthlyIncome', parseFloat(e.target.value))}
        className="w-full border p-2 rounded"
      />
      <Navigation step={2} />
    </form>
  );
}
