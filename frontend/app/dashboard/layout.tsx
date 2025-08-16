'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { DashboardSkeleton } from '@/components/ui/Skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <React.Suspense fallback={<DashboardSkeleton />}>
        {children}
      </React.Suspense>
    </ProtectedRoute>
  );
}