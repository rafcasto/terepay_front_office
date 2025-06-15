'use client';
import React, { JSX } from 'react';
import { use } from 'react';
import Step1 from '@/components/onboarding/Step1';
import Step2 from '@/components/onboarding/Step2';
import Step3 from '@/components/onboarding/Step3';
import Step4 from '@/components/onboarding/Step4';
import Step5 from '@/components/onboarding/Step5';
import Step6 from '@/components/onboarding/Step6';

export default function StepPage({ params }: { params: Promise<{ step: string }> }) {
  const { step } = use(params);

  const steps: Record<string, JSX.Element> = {
    '1': <Step1 />,
    '2': <Step2 />,
    '3': <Step3 />,
    '4': <Step4 />,
    '5': <Step5 />,
    '6': <Step6 />,
  };

  return steps[step] || <div>Invalid step</div>;
}
