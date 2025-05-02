'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function ClientFooter() {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start">
            <Link href="/client" className="text-xl font-bold text-blue-600">
              SKS Consulting
            </Link>
          </div>
          
          <div className="mt-4 md:mt-0">
            <ul className="flex flex-wrap justify-center md:justify-end space-x-6">
              <li>
                <Link 
                  href="/client/support" 
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Support
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy-policy" 
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms-of-service" 
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-6 flex flex-col items-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} SKS Consulting. All rights reserved.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Version 1.0.0
          </p>
        </div>
      </div>
    </footer>
  );
} 