'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  CheckCircle, 
  ChevronRight, 
  ArrowRight, 
  Shield, 
  BarChart, 
  FileText, 
  Scale
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Premium local hero images
const heroImages = [
  {
    url: '/images/pexels-n-voitkevich-8927456.jpg',
    alt: 'Professional business consultation'
  },
  {
    url: '/images/pexels-n-voitkevich-6863281.jpg',
    alt: 'Business professionals in meeting'
  },
  {
    url: '/images/pexels-rdne-7821708.jpg',
    alt: 'Modern business environment'
  }
];

// Premium consulting services
const services = [
  {
    title: 'Tax & Compliance Advisory',
    description: 'Strategic tax solutions tailored to minimize liabilities while ensuring complete regulatory compliance.',
    features: ['Tax optimization strategy', 'Regulatory compliance', 'Audit preparation'],
    icon: Scale,
    color: 'from-emerald-500 to-teal-600',
    hoverColor: 'group-hover:from-emerald-600 group-hover:to-teal-700'
  },
  {
    title: 'Business Structure & Formation',
    description: 'Expert guidance on optimal business structures to protect assets and create efficient operational frameworks.',
    features: ['Entity selection', 'Legal documentation', 'Governance framework'],
    icon: Shield,
    color: 'from-blue-500 to-indigo-600',
    hoverColor: 'group-hover:from-blue-600 group-hover:to-indigo-700'
  },
  {
    title: 'Financial Analysis & Reporting',
    description: 'Comprehensive financial analysis providing actionable insights for informed strategic decisions.',
    features: ['Performance metrics', 'Custom reporting', 'Forecasting models'],
    icon: BarChart,
    color: 'from-amber-500 to-orange-600',
    hoverColor: 'group-hover:from-amber-600 group-hover:to-orange-700'
  },
  {
    title: 'Corporate Documentation',
    description: 'Professional preparation and management of all critical corporate documentation and filings.',
    features: ['Compliance documentation', 'Contract review', 'Regulatory filings'],
    icon: FileText,
    color: 'from-purple-500 to-fuchsia-600',
    hoverColor: 'group-hover:from-purple-600 group-hover:to-fuchsia-700'
  }
];

// Client testimonials
const testimonials = [
  {
    quote: "SKS Consulting transformed our tax strategy, saving us ₹18 lakhs in the first year while ensuring perfect compliance with all regulations.",
    author: "Rajiv Mehta",
    position: "CFO, Innovate Technologies",
    company: "Mumbai, India"
  },
  {
    quote: "The business formation expertise at SKS helped us establish the perfect corporate structure. Their guidance was invaluable during our critical growth phase.",
    author: "Priya Sharma",
    position: "Founder & CEO, Organic Wellness",
    company: "Bengaluru, India"
  },
  {
    quote: "Their financial analysis identified inefficiencies we had overlooked for years. Implementation of their recommendations increased our profit margin by 14%.",
    author: "Vikram Chauhan",
    position: "Managing Director, Horizon Enterprises",
    company: "Delhi, India"
  }
];

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1]
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

// Section component with animation on scroll
function AnimatedSection({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });
  
  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delay,
            staggerChildren: 0.1
          }
        }
      }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function Home() {
  const router = useRouter();
  const { user, isLoading, isInitialized, error } = useAppSelector((state) => state.auth);
  const [currentImage, setCurrentImage] = useState(0);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isClient, setIsClient] = useState(false);
  
  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Image rotation for hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Testimonial rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Role-based redirection with error handling
  useEffect(() => {
    if (!isInitialized || !user) return;
    
    try {
      console.log('Home: User authenticated, preparing redirection', user.role);
      
      const timer = setTimeout(() => {
        try {
          const role = user.role?.toLowerCase() || '';
          
          if (role === 'admin') {
            router.push('/admin/dashboard');
          } else if (role === 'client') {
            router.push('/client/dashboard');
          } else if (role === 'consultant' || role === 'employee') {
            router.push('/consultant/dashboard');
          } else {
            // Default to client dashboard if role is not specified
            router.push('/client/dashboard');
          }
        } catch (err) {
          console.error('Home: Redirection error', err);
          // Stay on home page if redirection fails
        }
      }, 300);
      
      return () => clearTimeout(timer);
    } catch (err) {
      console.error('Home: Auth effect error', err);
    }
  }, [user, isInitialized, router]);

  // Global application loading state
  if (!isClient || (!isInitialized && isLoading)) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-600 animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-2 border-gray-100"></div>
          </div>
          <p className="text-sm font-medium text-gray-600">Preparing your premium experience...</p>
        </div>
      </div>
    );
  }

  // Error fallback
  if (error && isInitialized) {
    return (
      <>
        <Navbar />
        <div className="flex min-h-[70vh] w-full items-center justify-center">
          <div className="rounded-lg border border-gray-100 bg-white p-10 text-center shadow-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">We encountered an issue</h2>
            <p className="mt-2 text-gray-600">
              {error || "There was a problem loading your information. Please try refreshing the page."}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white transition-all duration-300"
            >
              Refresh Page
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="flex min-h-screen flex-col">
        {/* Hero Section - Premium Minimal Design */}
        <section className="relative overflow-hidden bg-white">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-900/5 z-0"></div>
          
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-12 relative z-10">
            <div className="flex flex-col lg:flex-row py-12 lg:py-24 xl:py-32 items-center">
              {/* Content Column */}
              <div className="flex-1 lg:pr-16 pb-12 lg:pb-0 max-w-2xl lg:max-w-none">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`content-${isClient && user ? 'user' : 'guest'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.7, 
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    className="w-full lg:max-w-xl xl:max-w-2xl"
                  >
                    {isClient && user ? (
                      <>
                        <h1 className="font-serif text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl xl:text-7xl">
                          <span className="block">Welcome back,</span>
                          <motion.span 
                            className="mt-2 block bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                          >
                            {user.displayName || 'Valued Client'}
                          </motion.span>
                        </h1>
                        
                        <p className="mt-8 text-xl leading-relaxed text-gray-600">
                          Your personalized dashboard is ready with all your consulting projects and strategic recommendations.
                        </p>
                        
                        <div className="mt-10">
                          <Button
                            asChild
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-10 py-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-medium"
                          >
                            <Link href={`/${user.role?.toLowerCase() || 'client'}/dashboard`} className="flex items-center">
                              Continue to Dashboard
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <motion.div 
                          className="inline-block rounded-full bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-1.5 text-sm font-semibold text-blue-600 mb-6"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.7 }}
                        >
                          Premier Consulting Services
                        </motion.div>
                        
                        <h1 className="font-serif text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl xl:text-7xl">
                          <span className="block">Strategic Solutions</span>
                          <motion.span 
                            className="mt-2 block bg-gradient-to-r from-blue-600 to-indigo-700 bg-clip-text text-transparent"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                          >
                            for Business Excellence
                          </motion.span>
                        </h1>
                        
                        <p className="mt-8 text-xl leading-relaxed text-gray-600">
                          SKS Consulting delivers bespoke professional services to elevate your business. 
                          Our expertise in taxation, compliance, and business strategy creates a clear 
                          path to sustainable growth and operational excellence.
                        </p>
                        
                        <div className="mt-10">
                          <Button
                            asChild
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-10 py-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-medium"
                          >
                            <Link href="/auth/signin" className="flex items-center">
                              Access Premium Services
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </div>
                        
                        <div className="mt-10 flex items-center">
                          <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                              <div 
                                key={i} 
                                className="inline-block h-10 w-10 rounded-full ring-2 ring-white overflow-hidden bg-gradient-to-br from-blue-400 to-indigo-600"
                              >
                                <div className="h-full w-full" />
                              </div>
                            ))}
                          </div>
                          <span className="ml-4 text-sm font-medium text-gray-700">
                            Trusted by 500+ businesses across India
                          </span>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              
              {/* Image Column */}
              <div className="flex-1 relative w-full">
                <div className="relative h-80 sm:h-96 lg:h-[36rem] overflow-hidden rounded-xl shadow-2xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`hero-image-${currentImage}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={heroImages[currentImage].url}
                        alt={heroImages[currentImage].alt}
                        fill
                        className="object-cover"
                        quality={95}
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/30 to-transparent"></div>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Image indicators - premium style */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`h-1.5 w-10 rounded-full transition-all duration-300 ${
                          currentImage === index 
                            ? 'bg-white scale-100' 
                            : 'bg-white/40 scale-90'
                        }`}
                        aria-label={`View image ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section - Premium Cards */}
        <AnimatedSection 
          className="py-24 bg-gradient-to-b from-white to-gray-50"
          delay={0.2}
        >
          <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-12">
            <motion.div 
              className="text-center mb-16"
              variants={staggerContainer}
            >
              <motion.h2 
                variants={fadeIn}
                className="text-base font-semibold uppercase tracking-wide text-blue-600"
              >
                Comprehensive Consulting Solutions
              </motion.h2>
              
              <motion.p 
                variants={fadeIn}
                className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
              >
                Elevate Your Business Performance
              </motion.p>
              
              <motion.p 
                variants={fadeIn}
                className="mt-6 max-w-3xl mx-auto text-xl text-gray-600"
              >
                Our team of specialized consultants delivers precision solutions tailored to your unique business challenges.
              </motion.p>
            </motion.div>

            <div className="grid gap-8 lg:grid-cols-2 xl:grid-cols-4">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.title}
                    variants={fadeIn}
                    custom={index}
                    className={`group relative rounded-lg bg-white p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden`}
                  >
                    {/* Decorative gradient overlay - appears on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-500`}></div>
                    
                    <div className="relative">
                      <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br ${service.color} ${service.hoverColor} transition-all duration-300 text-white`}>
                        <Icon className="h-7 w-7" />
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                        {service.title}
                      </h3>
                      
                      <p className="mt-4 text-gray-600">{service.description}</p>
                      
                      <div className="mt-6 space-y-3">
                        {service.features.map((feature, i) => (
                          <div key={i} className="flex items-start">
                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Link 
                        href="/services" 
                        className="mt-8 inline-flex items-center font-medium text-blue-600 hover:text-blue-800 transition-colors duration-300"
                      >
                        Learn more
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Link>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </AnimatedSection>
        
        {/* Testimonials - Premium Design */}
        <AnimatedSection 
          className="py-24 bg-gradient-to-br from-gray-900 to-blue-900 text-white overflow-hidden relative"
          delay={0.3}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/20 to-transparent"></div>
          <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-blue-300/20 to-transparent"></div>
          
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div variants={fadeIn} className="text-center mb-16">
              <h2 className="text-4xl font-bold">Client Success Stories</h2>
              <p className="mt-4 text-lg text-blue-200 max-w-2xl mx-auto">
                Discover how our consulting expertise has transformed businesses across India
              </p>
            </motion.div>
            
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`testimonial-${currentTestimonial}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -30 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-3xl mx-auto"
                >
                  <div className="bg-white/5 backdrop-blur-sm rounded-lg p-8 md:p-10 relative shadow-xl border border-white/10">
                    {/* Quote mark decoration */}
                    <div className="absolute -top-6 -left-4 text-blue-400/20 transform -scale-y-100">
                      <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M6.5 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L9.758 4.03c0 0-.218.052-.597.144-.377.13-.892.354-1.460.517-.534.232-1.131.507-1.701.909-.542.4-1.076.909-1.533 1.457-.47.516-.822 1.15-1.113 1.773-.377.694-.62 1.459-.62 2.202 0 .081.015.158.027.238.097.415.289.748.547 1.026.341.386.774.614 1.192.7M18 10c-.223 0-.437.034-.65.065.069-.232.14-.468.254-.68.114-.308.292-.575.469-.844.148-.291.409-.488.601-.737.201-.242.475-.403.692-.604.213-.21.492-.315.714-.463.232-.133.434-.28.65-.35.208-.086.39-.16.539-.222.302-.125.474-.197.474-.197L21.258 4.03c0 0-.218.052-.597.144-.377.13-.892.354-1.460.517-.534.232-1.131.507-1.701.909-.542.4-1.076.909-1.533 1.457-.47.516-.822 1.15-1.113 1.773-.377.694-.62 1.459-.62 2.202 0 .081.015.158.027.238.097.415.289.748.547 1.026.341.386.774.614 1.192.7"></path>
                      </svg>
                    </div>
                    
                    <p className="text-xl md:text-2xl italic leading-relaxed text-white/90">
                      "{testimonials[currentTestimonial].quote}"
                    </p>
                    
                    <div className="mt-8 flex items-center">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                        {testimonials[currentTestimonial].author.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <p className="font-bold text-white">{testimonials[currentTestimonial].author}</p>
                        <p className="text-blue-200">{testimonials[currentTestimonial].position}</p>
                        <p className="text-blue-300 text-sm">{testimonials[currentTestimonial].company}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              {/* Premium testimonial navigation */}
              <div className="mt-12 flex justify-center space-x-4">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`flex h-14 w-3 items-center justify-center focus:outline-none group`}
                  >
                    <span 
                      className={`h-8 w-0.5 rounded-full transition-all duration-300 ${
                        currentTestimonial === index 
                          ? 'bg-blue-400 scale-y-100' 
                          : 'bg-blue-600/30 scale-y-75 group-hover:scale-y-90 group-hover:bg-blue-500/50'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AnimatedSection>
        
        {/* CTA Section - Premium Design */}
        <AnimatedSection 
          className="py-24 bg-white relative overflow-hidden"
          delay={0.4}
        >
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div 
              variants={fadeIn}
              className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-800 p-12 shadow-2xl relative overflow-hidden"
            >
              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white/5 blur-3xl"></div>
              <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl"></div>
              
              <div className="relative flex flex-col md:flex-row items-center justify-between">
                <div className="mb-10 md:mb-0 md:mr-8 max-w-xl">
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to transform your business potential?</h2>
                  <p className="mt-4 text-xl text-blue-100">
                    Our consultants are prepared to help you navigate complex business challenges with precision and insight.
                  </p>
                </div>
                
                <div className="flex-shrink-0">
                  <Button
                    asChild
                    className="bg-white hover:bg-blue-50 text-blue-700 hover:text-blue-800 px-8 py-6 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-medium whitespace-nowrap"
                  >
                    <Link href="/auth/signin" className="flex items-center">
                      Start Your Journey
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatedSection>
      </main>
      <Footer />
    </>
  );
} 