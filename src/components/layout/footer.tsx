'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LayoutVariant } from './base-layout';
import { useAppSelector } from '@/store/hooks';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

// Define footer navigation by variant
const getFooterNavigation = (variant: LayoutVariant) => {
  // Company links
  const company = [
    { name: 'About Us', href: '/about' },
    { name: 'Careers', href: '/careers' },
    { name: 'Our Team', href: '/team' },
    { name: 'Contact', href: '/contact' },
  ];

  // Support links
  const support = [
    { name: 'Help Center', href: '/help' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Customer Support', href: '/support' },
  ];

  // Legal links
  const legal = [
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Cookie Policy', href: '/cookies' },
  ];

  // Services links
  const services = [
    { name: 'Tax Advisory', href: '/services/tax' },
    { name: 'Business Consulting', href: '/services/business' },
    { name: 'Financial Planning', href: '/services/financial' },
    { name: 'Audit & Assurance', href: '/services/audit' },
  ];

  // Admin-specific links
  if (variant === 'admin') {
    return {
      primary: [
        { name: 'Dashboard', href: '/admin' },
        { name: 'Help', href: '/admin/help' },
        { name: 'Documentation', href: '/admin/docs' },
        ...company.slice(0, 2)
      ],
      secondary: [
        ...legal
      ]
    };
  }

  // Client-specific links
  if (variant === 'client') {
    return {
      company,
      support: [
        { name: 'Dashboard', href: '/client' },
        { name: 'My Orders', href: '/client/orders' },
        ...support
      ],
      services,
      legal
    };
  }

  // Default/public links
  return {
    company,
    services,
    support,
    legal
  };
};

// Social media links with icons
const socialLinks = [
  {
    name: 'LinkedIn',
    href: '#',
    icon: Linkedin,
    hoverColor: 'hover:text-blue-600',
  },
  {
    name: 'Twitter',
    href: '#',
    icon: Twitter,
    hoverColor: 'hover:text-blue-400',
  },
  {
    name: 'Facebook',
    href: '#',
    icon: Facebook,
    hoverColor: 'hover:text-blue-600',
  },
  {
    name: 'Instagram',
    href: '#',
    icon: Instagram,
    hoverColor: 'hover:text-pink-500',
  },
];

// Contact information
const contactInfo = [
  {
    icon: MapPin,
    text: '123 Business Park, Financial District, Mumbai, India',
  },
  {
    icon: Phone,
    text: '+91 123 456 7890',
  },
  {
    icon: Mail,
    text: 'info@sksconsulting.com',
  },
];

// Animation variants
const footerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
};

const linkVariants = {
  hidden: { opacity: 0, x: -5 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  },
};

const linkContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.2,
    },
  },
};

interface FooterProps {
  variant?: LayoutVariant;
}

export function Footer({ variant = 'default' }: FooterProps) {
  const { user } = useAppSelector(state => state.auth || {});
  const navigation = getFooterNavigation(variant);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);

  // Footer styling based on variant
  const getFooterStyles = () => {
    switch (variant) {
      case 'admin':
        return 'bg-gray-900 text-gray-300';
      case 'client':
        return 'bg-gray-50 text-gray-600 border-t border-gray-100';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  // Text and accent colors based on variant
  const getTextColors = () => {
    if (variant === 'admin' || variant === 'default') {
      return {
        heading: 'text-white',
        text: 'text-gray-300',
        muted: 'text-gray-400',
        accent: 'text-blue-400',
      };
    }
    return {
      heading: 'text-gray-900',
      text: 'text-gray-600',
      muted: 'text-gray-500',
      accent: 'text-blue-600',
    };
  };

  const colors = getTextColors();

  // Handle newsletter subscription
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);
    // Simulate API call
    setTimeout(() => {
      toast.success('Thank you for subscribing to our newsletter!');
      setEmail('');
      setIsSubscribing(false);
    }, 1500);
  };

  // Determine the navigation structure based on variant
  const renderNavigation = () => {
    if (variant === 'admin') {
      // Simplified footer for admin
      return (
        <div className="grid grid-cols-1 gap-8 py-8 md:grid-cols-2">
          <div>
            <motion.h3 
              variants={itemVariants}
              className={`text-sm font-semibold ${colors.heading}`}
            >
              Resources
            </motion.h3>
            <motion.ul 
              role="list" 
              className="mt-4 space-y-4"
              variants={linkContainerVariants}
            >
              {navigation.primary.map((item) => (
                <motion.li key={item.name} variants={linkVariants}>
                  <Link href={item.href} className={`text-sm ${colors.text} hover:text-blue-400 transition-colors duration-200`}>
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </div>
          <div>
            <motion.h3 
              variants={itemVariants}
              className={`text-sm font-semibold ${colors.heading}`}
            >
              Legal
            </motion.h3>
            <motion.ul 
              role="list" 
              className="mt-4 space-y-4"
              variants={linkContainerVariants}
            >
              {navigation.secondary.map((item) => (
                <motion.li key={item.name} variants={linkVariants}>
                  <Link href={item.href} className={`text-sm ${colors.text} hover:text-blue-400 transition-colors duration-200`}>
                    {item.name}
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          </div>
        </div>
      );
    }

    // Full footer for client and public views
    return (
      <div className="grid grid-cols-1 gap-10 py-12 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <motion.h3 
            variants={itemVariants}
            className={`text-sm font-semibold uppercase tracking-wider ${colors.heading}`}
          >
            Company
          </motion.h3>
          <motion.ul 
            role="list" 
            className="mt-6 space-y-5"
            variants={linkContainerVariants}
          >
            {navigation.company.map((item) => (
              <motion.li key={item.name} variants={linkVariants}>
                <Link href={item.href} className={`text-base ${colors.text} hover:text-blue-400 transition-colors duration-200 flex items-center`}>
                  <ChevronRight className="h-3.5 w-3.5 mr-2 text-gray-600" />
                  {item.name}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>
        
        <div>
          <motion.h3 
            variants={itemVariants}
            className={`text-sm font-semibold uppercase tracking-wider ${colors.heading}`}
          >
            Services
          </motion.h3>
          <motion.ul 
            role="list" 
            className="mt-6 space-y-5"
            variants={linkContainerVariants}
          >
            {navigation.services.map((item) => (
              <motion.li key={item.name} variants={linkVariants}>
                <Link href={item.href} className={`text-base ${colors.text} hover:text-blue-400 transition-colors duration-200 flex items-center`}>
                  <ChevronRight className="h-3.5 w-3.5 mr-2 text-gray-600" />
                  {item.name}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>
        
        <div>
          <motion.h3 
            variants={itemVariants}
            className={`text-sm font-semibold uppercase tracking-wider ${colors.heading}`}
          >
            Support
          </motion.h3>
          <motion.ul 
            role="list" 
            className="mt-6 space-y-5"
            variants={linkContainerVariants}
          >
            {navigation.support.map((item) => (
              <motion.li key={item.name} variants={linkVariants}>
                <Link href={item.href} className={`text-base ${colors.text} hover:text-blue-400 transition-colors duration-200 flex items-center`}>
                  <ChevronRight className="h-3.5 w-3.5 mr-2 text-gray-600" />
                  {item.name}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>
        
        <div>
          <motion.h3 
            variants={itemVariants}
            className={`text-sm font-semibold uppercase tracking-wider ${colors.heading}`}
          >
            Legal
          </motion.h3>
          <motion.ul 
            role="list" 
            className="mt-6 space-y-5"
            variants={linkContainerVariants}
          >
            {navigation.legal.map((item) => (
              <motion.li key={item.name} variants={linkVariants}>
                <Link href={item.href} className={`text-base ${colors.text} hover:text-blue-400 transition-colors duration-200 flex items-center`}>
                  <ChevronRight className="h-3.5 w-3.5 mr-2 text-gray-600" />
                  {item.name}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </div>
    );
  };

  return (
    <motion.footer 
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={footerVariants}
      className={getFooterStyles()}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top section with logo and contact */}
        <div className="py-16 border-b border-gray-800/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            {/* Logo and description */}
            <motion.div variants={itemVariants} className="space-y-8">
              <Link href="/" className="flex items-center">
                <div className="relative h-12 w-12 mr-3">
                  <Image
                    src="/images/logo/sks_logo.png"
                    alt="SKS Consulting Logo"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className={`text-2xl font-bold tracking-tight ${colors.heading}`}>
                  SKS Consulting
                </span>
              </Link>
              
              <p className={`max-w-md text-base leading-relaxed ${colors.text}`}>
                Premier business consulting services for organizations across India. 
                Our expertise in taxation, compliance, and business strategy empowers businesses
                to achieve sustainable growth and operational excellence.
              </p>
              
              {/* Contact information */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className={`text-sm ${colors.text}`}>
                    123 Business Avenue, Sector 18, Delhi, India 110001
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className={`text-sm ${colors.text}`}>
                    +91 11 2345 6789
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className={`text-sm ${colors.text}`}>
                    contact@sksconsulting.com
                  </span>
                </div>
              </div>
              
              {/* Social links */}
              <div className="flex space-x-5">
                {socialLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`bg-blue-600/10 p-2.5 rounded-full text-blue-500 hover:bg-blue-600 hover:text-white transition-all duration-200`}
                      aria-label={item.name}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
            
            {/* Newsletter or contact section based on variant */}
            {variant !== 'admin' ? (
              <motion.div variants={itemVariants} className="bg-gray-800/30 rounded-2xl p-8 backdrop-blur-sm">
                <h3 className={`text-lg font-semibold ${colors.heading}`}>
                  Subscribe to our newsletter
                </h3>
                <p className={`mt-4 max-w-md text-base ${colors.text}`}>
                  Get the latest insights, articles, and updates delivered to your inbox monthly.
                </p>
                <form onSubmit={handleSubscribe} className="mt-6">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow">
                      <label htmlFor="email-address" className="sr-only">
                        Email address
                      </label>
                      <Input
                        id="email-address"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full rounded-md border-gray-700 bg-gray-700/50 text-white placeholder:text-gray-400 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <Button 
                      type="submit"
                      disabled={isSubscribing}
                      className="shrink-0 rounded-md bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    >
                      {isSubscribing ? (
                        <>
                          <span className="mr-2">
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          </span>
                          Processing
                        </>
                      ) : (
                        'Subscribe'
                      )}
                    </Button>
                  </div>
                </form>

                <div className="mt-8">
                  <h3 className={`text-lg font-semibold ${colors.heading}`}>
                    Need Consulting Help?
                  </h3>
                  <p className={`mt-4 max-w-md text-base ${colors.text}`}>
                    Our team of experts is ready to help you with your business challenges.
                  </p>
                  <Button 
                    asChild
                    className="mt-4 bg-transparent hover:bg-blue-600/20 text-blue-400 px-0 hover:text-blue-300 transition-colors"
                    variant="link"
                  >
                    <Link href="/contact" className="flex items-center">
                      Contact Us
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div variants={itemVariants}>
                <h3 className={`text-lg font-semibold ${colors.heading}`}>
                  Admin Support
                </h3>
                <p className={`mt-4 max-w-md text-sm ${colors.text}`}>
                  Need assistance with the admin panel? Contact our technical support team.
                </p>
                <div className="mt-6 flex items-center">
                  <Mail className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                  <span className={`text-sm ${colors.text}`}>
                    admin-support@sksconsulting.com
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
        
        {/* Navigation Links */}
        <motion.div 
          variants={containerVariants}
          className="py-12"
        >
          {renderNavigation()}
        </motion.div>
        
        {/* Footer bottom with copyright */}
        <div className={`py-10 border-t ${variant === 'admin' || variant === 'default' ? 'border-gray-800/10' : 'border-gray-200/60'}`}>
          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row items-center justify-between gap-y-4"
          >
            <p className={`text-sm ${colors.muted}`}>
              &copy; {new Date().getFullYear()} SKS Consulting. All rights reserved.
            </p>
            
            {/* Additional links for client and public */}
            {variant !== 'admin' && (
              <div className="flex space-x-6">
                <Link href="/sitemap" className={`text-sm ${colors.muted} hover:text-blue-400 transition-colors duration-200`}>
                  Sitemap
                </Link>
                <Link href="/accessibility" className={`text-sm ${colors.muted} hover:text-blue-400 transition-colors duration-200`}>
                  Accessibility
                </Link>
                <Link href="/cookies" className={`text-sm ${colors.muted} hover:text-blue-400 transition-colors duration-200`}>
                  Cookie Preferences
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.footer>
  );
} 