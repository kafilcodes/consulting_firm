'use client';

import Link from 'next/link';
import { LayoutVariant } from './base-layout';
import { useAppSelector } from '@/store/hooks';

// Define footer navigation by variant
const getFooterNavigation = (variant: LayoutVariant) => {
  const common = [
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
  ];

  switch (variant) {
    case 'admin':
      return [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Help', href: '/admin/help' },
        ...common
      ];
    case 'client':
      return [
        { name: 'Dashboard', href: '/client' },
        { name: 'Support', href: '/client/support' },
        { name: 'FAQ', href: '/client/faq' },
        ...common
      ];
    default:
      return [
        { name: 'Services', href: '/#services' },
        ...common
      ];
  }
};

const socialLinks = [
  {
    name: 'LinkedIn',
    href: '#',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path
          fillRule="evenodd"
          d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    name: 'Twitter',
    href: '#',
    icon: (props: any) => (
      <svg fill="currentColor" viewBox="0 0 24 24" {...props}>
        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
      </svg>
    ),
  },
];

interface FooterProps {
  variant?: LayoutVariant;
}

export function Footer({ variant = 'default' }: FooterProps) {
  const { user } = useAppSelector(state => state.auth || {});
  const navigation = getFooterNavigation(variant);

  // Footer styling based on variant
  const getFooterStyles = () => {
    switch (variant) {
      case 'admin':
        return 'bg-gray-900 text-gray-300';
      case 'client':
        return 'bg-gray-50 text-gray-600';
      default:
        return 'bg-white text-gray-600';
    }
  };

  return (
    <footer className={getFooterStyles()}>
      <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 sm:py-16 lg:px-8">
        <div className="flex justify-center mb-8">
          <Link href="/" className="-m-1.5 p-1.5">
            <h2 className={`text-2xl font-bold ${variant === 'admin' ? 'text-white' : 'text-gray-900'}`}>
              SKS Consulting
            </h2>
          </Link>
        </div>

        {/* Quick description - only shown in public/client footer */}
        {variant !== 'admin' && (
          <p className="text-center text-sm text-gray-500 max-w-2xl mx-auto mb-8">
            Professional consulting services tailored for businesses of all sizes.
            From financial guidance to strategic planning, we're here to help you succeed.
          </p>
        )}

        <nav className="mt-8 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
          {navigation.map((item) => (
            <div key={item.name} className="pb-6">
              <Link 
                href={item.href} 
                className={`text-sm leading-6 hover:text-opacity-75 ${
                  variant === 'admin' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            </div>
          ))}
        </nav>

        <div className="mt-8 flex justify-center space-x-10">
          {socialLinks.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`${
                variant === 'admin' ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </Link>
          ))}
        </div>
        
        <p className={`mt-10 text-center text-xs leading-5 ${
          variant === 'admin' ? 'text-gray-400' : 'text-gray-500'
        }`}>
          &copy; {new Date().getFullYear()} SKS Consulting. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 