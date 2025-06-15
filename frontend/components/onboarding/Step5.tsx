'use client';

import { useOnboardingStore } from '@/store/onboardingStore';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step5() {
  const { data, setField } = useOnboardingStore();
  useAutoSaveOnboarding();

  return (
    <form className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Loan Request</h2>
      <input
        type="number"
        placeholder="Amount Requested"
        value={data.loanAmount || ''}
        onChange={(e) => setField('loanAmount', parseFloat(e.target.value))}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Purpose"
        value={data.loanPurpose || ''}
        onChange={(e) => setField('loanPurpose', e.target.value)}
        className="w-full border p-2 rounded"
      />
      <select
        value={data.loanTerm || ''}
        onChange={(e) => setField('loanTerm', e.target.value)}
        className="w-full border p-2 rounded"
      >
        <option value="">Select Loan Term</option>
        <option value="6 months">6 months</option>
        <option value="12 months">12 months</option>
        <option value="24 months">24 months</option>
      </select>
      <Navigation step={5} />
    </form>
  );
}
