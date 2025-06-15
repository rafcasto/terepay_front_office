// File: lib/hooks/useApplicationStatus.ts

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function useApplicationStatus() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;

      const uid = user.uid;
      const saved = localStorage.getItem(`onboarding_${uid}`);
      
      const parsed = saved ? JSON.parse(saved) : null;
      console.log("saved" + parsed)
      if (parsed?.submitted) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding/1');
      }
    });

    return () => unsubscribe();
  }, [router]);
}
