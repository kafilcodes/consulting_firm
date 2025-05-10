import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { AuthForm } from '@/components/auth/auth-form';

export const metadata: Metadata = {
  title: 'Authentication | SKS Consulting',
  description: 'Access premium consulting services with secure authentication',
};

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      {/* Left side - Premium branding panel */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden">
        {/* Background image with overlay */}
        <div className="absolute inset-0">
          <Image
            src="/images/pexels-n-voitkevich-6863260.jpg"
            alt="Professional business meeting"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={95}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/70"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 md:p-16 lg:p-20 w-full h-full text-white">
          <div>
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/images/logo/sks_logo.png"
                alt="SKS Consulting Logo"
                width={45}
                height={45}
                style={{ width: 'auto', height: '40px' }}
                priority
              />
              <span className="text-2xl font-bold tracking-tight">Consulting Firm</span>
            </Link>
            
            <h1 className="mt-24 text-4xl lg:text-5xl xl:text-6xl font-extrabold tracking-tight leading-tight max-w-xl">
              Premium Solutions for Business Excellence
            </h1>
            
            <p className="mt-6 text-xl leading-relaxed text-blue-100 max-w-lg">
              Secure access to our premium consulting services, designed to transform your business challenges into strategic advantages.
            </p>
            
            <div className="mt-12 flex flex-col space-y-6">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Secure Authentication</h3>
                  <p className="text-blue-200 text-sm">Enterprise-grade security for your business data</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-blue-500/20 backdrop-blur-sm flex items-center justify-center">
                  <svg className="h-6 w-6 text-blue-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Immediate Access</h3>
                  <p className="text-blue-200 text-sm">Seamless entry to your personalized dashboard</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto">
            <p className="text-sm text-blue-200/80">&copy; {new Date().getFullYear()} SKS Consulting. All rights reserved.</p>
          </div>
        </div>
      </div>
      
      {/* Right side - Auth form */}
      <div className="flex flex-1 min-h-screen md:min-h-0 md:w-1/2 lg:w-2/5">
        <div className="w-full max-w-md mx-auto flex flex-col justify-center px-8 md:px-12 py-16">
          {/* Mobile logo */}
          <div className="md:hidden mb-12 flex justify-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <Image
                src="/images/logo/sks_logo.png"
                alt="SKS Consulting Logo"
                width={45}
                height={45}
                style={{ width: 'auto', height: '40px' }}
                priority
              />
              <span className="text-2xl font-bold text-gray-900">Consulting Firm</span>
            </Link>
          </div>
          
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back
            </h2>
            <p className="mt-3 text-gray-600">
              Access your consulting dashboard securely with Google
            </p>
          </div>
          
          <AuthForm />
          
          <div className="mt-16 text-center">
            <p className="text-sm text-gray-500">
              <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition duration-200 font-medium">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Return to home page
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 