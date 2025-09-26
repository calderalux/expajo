'use client';

import React from 'react';
import { useForm } from '@tanstack/react-form';
import { zodValidator } from '@tanstack/zod-form-adapter';
import { registerSchema, type RegisterFormData } from '@/lib/validations';
import { FormField } from './FormField';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => void;
  isLoading?: boolean;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, isLoading = false }) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const form = useForm({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validatorAdapter: zodValidator(),
    validators: {
      onChange: registerSchema,
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-playfair">Create Account</CardTitle>
        <CardDescription>
          Join Expajo and start your journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
          className="space-y-6"
        >
          <form.Field
            name="fullName"
            validators={{
              onChange: registerSchema.shape.fullName,
            }}
          >
            {(field) => (
              <FormField
                field={field}
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                leftIcon={<User size={20} className="text-gray-400" />}
              />
            )}
          </form.Field>

          <form.Field
            name="email"
            validators={{
              onChange: registerSchema.shape.email,
            }}
          >
            {(field) => (
              <FormField
                field={field}
                label="Email"
                type="email"
                placeholder="Enter your email"
                leftIcon={<Mail size={20} className="text-gray-400" />}
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: registerSchema.shape.password,
            }}
          >
            {(field) => (
              <FormField
                field={field}
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                leftIcon={<Lock size={20} className="text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            )}
          </form.Field>

          <form.Field
            name="confirmPassword"
            validators={{
              onChange: registerSchema.shape.confirmPassword,
            }}
          >
            {(field) => (
              <FormField
                field={field}
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm your password"
                leftIcon={<Lock size={20} className="text-gray-400" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            )}
          </form.Field>

          <div className="flex items-start">
            <input
              type="checkbox"
              className="rounded border-gray-300 text-primary focus:ring-primary mt-1"
              required
            />
            <label className="ml-2 text-sm text-gray-600">
              I agree to the{' '}
              <button type="button" className="text-primary hover:text-primary/80">
                Terms of Service
              </button>{' '}
              and{' '}
              <button type="button" className="text-primary hover:text-primary/80">
                Privacy Policy
              </button>
            </label>
          </div>

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
            disabled={!form.state.isValid || isLoading}
          >
            Create Account
          </Button>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                className="text-primary hover:text-primary/80 font-medium transition-colors"
              >
                Sign in
              </button>
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
