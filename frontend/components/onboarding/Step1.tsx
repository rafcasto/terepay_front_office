'use client';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step1() {
  const { data, setField } = useOnboardingStore();
  useAutoSaveOnboarding();

  return (
    <form className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Personal Information</h2>
      <input
        type="text"
        placeholder="Full Name"
        value={data.fullName || ''}
        onChange={(e) => setField('fullName', e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="date"
        value={data.dob || ''}
        onChange={(e) => setField('dob', e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="text"
        placeholder="Address"
        value={data.address || ''}
        onChange={(e) => setField('address', e.target.value)}
        className="w-full border p-2 rounded"
      />
      <input
        type="email"
        placeholder="Email"
        value={data.email || ''}
        onChange={(e) => setField('email', e.target.value)}
        className="w-full border p-2 rounded"
      />
      <Navigation step={1} />
    </form>
  );
}
