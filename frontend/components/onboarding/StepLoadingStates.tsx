'use client';

import { FormFieldSkeleton, ButtonSkeleton } from '@/components/ui/Skeleton';

export function StepLoadingState({ step = 1 }: { step?: number }) {
  const renderFields = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldSkeleton labelWidth="w-24" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-24" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-full" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-32" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-40" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-36" inputHeight="h-12" />
          </div>
        );
      case 2:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldSkeleton labelWidth="w-32" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-28" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-36" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-40" inputHeight="h-12" />
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <FormFieldSkeleton labelWidth="w-40" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-36" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-44" inputHeight="h-12" />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormFieldSkeleton labelWidth="w-36" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-32" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-40" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-36" inputHeight="h-12" />
          </div>
        );
      case 5:
        return (
          <div className="space-y-4">
            <FormFieldSkeleton labelWidth="w-44" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-40" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-36" inputHeight="h-12" />
          </div>
        );
      case 6:
        return (
          <div className="space-y-4">
            <FormFieldSkeleton labelWidth="w-48" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-40" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-44" inputHeight="h-12" />
          </div>
        );
      default:
        return (
          <div className="space-y-4">
            <FormFieldSkeleton labelWidth="w-32" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-32" inputHeight="h-12" />
            <FormFieldSkeleton labelWidth="w-32" inputHeight="h-12" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="border-l-4 border-orange-500 pl-4">
        <FormFieldSkeleton labelWidth="w-1/2" />
        <FormFieldSkeleton labelWidth="w-2/3" className="mt-4" />
      </div>

      {renderFields()}

      <div className="flex justify-between mt-8">
        {step > 1 && <ButtonSkeleton />}
        <div className="ml-auto">
          <ButtonSkeleton size={step === 6 ? 'lg' : 'default'} />
        </div>
      </div>
    </div>
  );
}
