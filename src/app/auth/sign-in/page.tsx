import { Metadata } from 'next';
import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = {
  title: 'Authentication | SKS Consulting',
  description: 'Sign in to your SKS Consulting account with Google',
};

export default function AuthPage() {
  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      {/* Left side - Branding and image */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
        <div>
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">SKS Consulting</span>
          </Link>
          <h1 className="mt-20 text-4xl font-extrabold tracking-tight">
            Welcome to SKS
          </h1>
          <p className="mt-6 text-xl leading-relaxed opacity-90">
            Premium consulting services for businesses that demand excellence. Sign in to manage your services and access exclusive content.
          </p>
        </div>
        
        <div className="mt-auto space-y-6">
          <p className="text-sm opacity-80">&copy; {new Date().getFullYear()} SKS Consulting. All rights reserved.</p>
        </div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="flex flex-col justify-center items-center p-8 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="md:hidden mb-16 flex justify-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-gray-900">SKS Consulting</span>
            </Link>
          </div>
          
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Continue with Google to access your consulting services
            </p>
          </div>
          
          <AuthForm />
          
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 transition duration-200">
                &larr; Back to home
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 