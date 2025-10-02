'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { OtpPurpose } from '@/types/auth';
import { cn } from '@/utils/cn';

interface AdminLoginFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function AdminLoginForm({ onSuccess, onError, className }: AdminLoginFormProps) {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpExpiry, setOtpExpiry] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (data.success) {
        setStep('otp');
        setOtpExpiry(data.expires_at || null);
      } else {
        setError(data.error || 'Failed to send OTP');
        onError?.(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      
      if (data.success && data.user) {
        // Store session token in localStorage for client-side access
        if (data.session?.session_token) {
          localStorage.setItem('admin_session_token', data.session.session_token);
        }
        onSuccess?.(data.user);
      } else {
        setError(data.error || 'Invalid OTP code');
        onError?.(data.error || 'Invalid OTP code');
      }
    } catch (err) {
      const errorMessage = 'Network error. Please try again.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
    setOtpExpiry(null);
  };

  const formatTimeRemaining = (expiryTime: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiryTime).getTime();
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={cn('w-full max-w-md mx-auto p-8', className)}>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Login
        </h1>
        <p className="text-gray-600">
          {step === 'email' 
            ? 'Enter your admin email to receive OTP code'
            : 'Enter the OTP code sent to your email'
          }
        </p>
      </div>

      {step === 'email' ? (
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <Input
              type="email"
              placeholder="admin@expajo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !email}
          >
            {loading ? 'Sending OTP...' : 'Send OTP Code'}
          </Button>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div>
            <Input
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              required
              className="w-full text-center text-2xl tracking-widest"
              disabled={loading}
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              Enter the 6-digit code sent to {email}
            </p>
            {otpExpiry && (
              <p className="text-sm text-orange-600 mt-1 text-center">
                Code expires in: {formatTimeRemaining(otpExpiry)}
              </p>
            )}
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full"
              disabled={loading || otp.length !== 6}
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToEmail}
              className="w-full"
              disabled={loading}
            >
              Back to Email
            </Button>
          </div>
        </form>
      )}

      <div className="mt-8 text-center">
        <p className="text-xs text-gray-500">
          Secure admin access via OTP authentication
        </p>
      </div>
    </Card>
  );
}
