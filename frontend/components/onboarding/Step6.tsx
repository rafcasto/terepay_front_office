'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useState } from 'react';
import { useAutoSaveOnboarding } from '@/lib/hooks/useAutoSaveOnboarding';
import { Navigation } from './Navigation';

export default function Step6() {
  const router = useRouter();
  const { data, setField, markSubmitted } = useOnboardingStore();
  const [file, setFile] = useState<File | null>(data.document || null);

  useAutoSaveOnboarding();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0] || null;
    setFile(uploadedFile);
    setField('document', uploadedFile);
  };

  const handleSubmit = () => {
    markSubmitted();
    const uid = JSON.parse(localStorage.getItem('firebase:authUser') || '{}')?.uid;

    if (uid) {
      localStorage.setItem(
        `onboarding_${uid}`,
        JSON.stringify({ ...data, submitted: true }) // 🔐 Make sure `submitted: true` is explicitly included here
      );
    }
    router.push('/onboarding/confirmation');
  };

  return (
    <form className="space-y-4">
      <h2 className="text-xl font-bold mb-2">Document Upload</h2>

      <input
        type="file"
        accept="application/pdf,image/*"
        onChange={handleFileChange}
        className="w-full border p-2 rounded"
      />

      <p className="text-sm text-gray-600">
        {file ? `Selected: ${file.name}` : 'No file uploaded.'}
      </p>

      <Navigation step={6} isFinalStep onSubmit={handleSubmit} />
    </form>
  );
}
