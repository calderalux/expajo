'use client';

import React, { useState, useEffect } from 'react';
import { SimpleLoginForm } from '@/components/forms/SimpleLoginForm';
import { useSupabase } from '@/lib/providers';
import { useRouter } from 'next/navigation';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();
  const supabase = useSupabase();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (data: LoginFormData) => {
    if (!isClient) {
      setError('Please wait for the page to load completely.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        setError(authError.message);
        return;
      }

      if (authData.user) {
        router.push('/account');
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
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-card">
            {error}
          </div>
        )}
        <SimpleLoginForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}
