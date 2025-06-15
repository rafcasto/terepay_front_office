// Updated LoginForm.tsx - Simplified for Auth Layout
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from './AuthProvider';
import { useRecaptcha } from '@/lib/hooks/useRecaptcha';
import { loginSchema, LoginFormData } from '@/lib/utils/validators';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Shield } from 'lucide-react';
import Link from 'next/link';

interface AuthError {
  message: string;
}

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { login } = useAuth();
  const { executeRecaptchaAction, isRecaptchaAvailable } = useRecaptcha();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      let recaptchaToken: string | null = null;
      if (isRecaptchaAvailable) {
        recaptchaToken = await executeRecaptchaAction('login');
        if (!recaptchaToken) {
          throw new Error('reCAPTCHA verification failed. Please try again.');
        }
      }

      await login(data.email, data.password);
      
      if (recaptchaToken) {
        console.log('reCAPTCHA token generated for login:', recaptchaToken);
      }

      router.push('/dashboard');
    } catch (err) {
      const error = err as AuthError;
      setError(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* TerePay Header - Now simplified since background is in layout */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center">
            <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
              {/* Bottom chevron */}
              <path d="M10 34 L24 20 L38 34" stroke="url(#loginGradient1)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              {/* Middle chevron */}
              <path d="M10 26 L24 12 L38 26" stroke="url(#loginGradient2)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              {/* Top chevron */}
              <path d="M10 18 L24 4 L38 18" stroke="url(#loginGradient3)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              
              <defs>
                <linearGradient id="loginGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FB923C" />
                  <stop offset="100%" stopColor="#EF4444" />
                </linearGradient>
                <linearGradient id="loginGradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#DC2626" />
                </linearGradient>
                <linearGradient id="loginGradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#EA580C" />
                  <stop offset="100%" stopColor="#B91C1C" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
          TerePay
        </h1>
        <p className="text-gray-600">Fast & Secure Lending</p>
      </div>

      <Card className="shadow-xl border border-gray-100">
        <div className="p-8 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to your TerePay account
            </p>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                {...register('email')}
                error={errors.email?.message}
                className="focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                {...register('password')}
                error={errors.password?.message}
                className="focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              loading={isLoading}
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don&apos;t have an account?{' '}
              <Link 
                href="/register" 
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
              >
                Create one here
              </Link>
            </p>
          </div>

          {/* reCAPTCHA Status */}
          <div className="flex items-center justify-center text-xs text-gray-500 border-t border-gray-100 pt-4">
            <Shield className="w-3 h-3 mr-1" />
            {isRecaptchaAvailable ? 'Protected by reCAPTCHA' : 'reCAPTCHA not available'}
          </div>
        </div>
      </Card>
    </div>
  );
}