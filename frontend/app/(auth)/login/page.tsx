'use client';
import { LoginForm } from '@/components/auth/LoginForm';
import { useApplicationStatus } from '@/lib/hooks/useApplicationStatus';

export default function LoginPage() {
  useApplicationStatus(); // 🔁 redirects after Firebase login

  return (
    
    
       <LoginForm />
    
  );
}



