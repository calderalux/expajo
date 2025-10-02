'use client';

import { AdminLoginForm } from '@/components/auth/AdminLoginForm';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleLoginSuccess = (user: any) => {
    // Store session token (you might want to get this from the login response)
    // localStorage.setItem('admin_session_token', sessionToken);
    
    // Redirect to admin dashboard
    router.push('/admin');
  };

  const handleLoginError = (error: string) => {
    setError(error);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Expajo Admin
          </h1>
          <p className="text-gray-600">
            Secure admin access portal
          </p>
        </div>
        
        <AdminLoginForm 
          onSuccess={handleLoginSuccess}
          onError={handleLoginError}
        />
        
        {error && (
          <div className="text-center">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
