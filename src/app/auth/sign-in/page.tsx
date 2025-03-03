import { Metadata } from 'next';
import { SignInForm } from '@/components/auth/sign-in-form';

export const metadata: Metadata = {
  title: 'Sign In | SKS Consulting',
  description: 'Sign in to your SKS Consulting account',
};

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Welcome to SKS Consulting
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your Google account to continue
          </p>
        </div>

        <SignInForm />
      </div>
    </div>
  );
} 