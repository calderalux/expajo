'use client';

import React, { useState } from 'react';
import { RegisterForm } from '@/components/forms/RegisterForm';
import { type RegisterFormData } from '@/lib/validations';
import { useSupabase } from '@/lib/providers';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabase();
  const router = useRouter();

  const handleSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        // Check if email confirmation is required
        if (authData.user.email_confirmed_at) {
          router.push('/account');
        } else {
          // Show confirmation message
          setError('Please check your email and click the confirmation link to complete your registration.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {error && (
          <div className={`px-4 py-3 rounded-card ${
            error.includes('check your email') 
              ? 'bg-blue-50 border border-blue-200 text-blue-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {error}
          </div>
        )}
        <RegisterForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
