import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils/helpers';
import { ButtonSkeleton } from './Skeleton';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none',
  {
    variants: {
      variant: {
        default: 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600 focus-visible:ring-orange-500 shadow-lg',
        destructive: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50 text-gray-900 focus-visible:ring-orange-500',
        secondary: 'bg-orange-100 text-orange-900 hover:bg-orange-200 focus-visible:ring-orange-500',
        ghost: 'hover:bg-orange-50 text-gray-900 focus-visible:ring-orange-500',
        link: 'underline-offset-4 hover:underline text-orange-600 focus-visible:ring-orange-500',
      },
      size: {
        default: 'h-10 py-2 px-4 min-w-[80px]',
        sm: 'h-9 px-3 rounded-md min-w-[60px]',
        lg: 'h-11 px-8 rounded-md min-w-[100px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size }), loading && 'relative overflow-hidden', className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <ButtonSkeleton size={size as 'sm' | 'default' | 'lg'} className="absolute inset-0" />
        ) : children}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };