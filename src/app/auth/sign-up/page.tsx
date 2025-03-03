import { Metadata } from 'next';
import { SignUpForm } from '@/components/auth/sign-up-form';

export const metadata: Metadata = {
  title: 'Sign Up | SKS Consulting',
  description: 'Create a new account with SKS Consulting',
};

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Create your account
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Join SKS Consulting to access our services
          </p>
        </div>

        <SignUpForm />
      </div>
    </div>
  );
} 