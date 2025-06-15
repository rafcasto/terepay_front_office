// File: lib/hooks/useAuthGuard.ts

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export function useAuthGuard() {
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace('/login');
      } else {
        const uid = user.uid;
        const saved = localStorage.getItem(`onboarding_${uid}`);
        const parsed = saved ? JSON.parse(saved) : null;
        console.log("saved" + parsed)
        if (!parsed?.submitted) {
          router.replace('/onboarding/1');
        }
      }
    });

    return () => unsubscribe();
  }, [router]);
}
