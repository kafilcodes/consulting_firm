'use client';

import { useEffect, useState, useRef, ReactNode } from 'react';
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
  Scale,
  Smartphone,
  PieChart,
  ShieldCheck,
  Settings,
  Check
} from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Icons } from "@/components/icons";

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
    url: '/images/pexels-n-voitkevich-6863260.jpg',
    alt: 'Modern business environment'
  }
];

// Services data with detailed information and styling
const services = [
  {
    name: "Business Registration",
    description: "Streamline your business registration process with our expert guidance and support",
    features: ["Company incorporation", "GST registration", "Business licenses", "Regulatory compliance"],
    icon: Scale,
    color: 'from-emerald-500 to-teal-600',
    hoverColor: 'group-hover:from-emerald-600 group-hover:to-teal-700'
  },
  {
    name: "Tax Planning",
    description: "Optimize your tax strategy with comprehensive planning and compliance services",
    features: ["Tax optimization", "Compliance management", "Deduction planning", "Audit support"],
    icon: Shield,
    color: 'from-blue-500 to-indigo-600',
    hoverColor: 'group-hover:from-blue-600 group-hover:to-indigo-700'
  },
  {
    name: "Financial Analysis",
    description: "Gain valuable insights with our detailed financial analysis and reporting services",
    features: ["Profitability analysis", "Cash flow management", "Financial forecasting", "Investment planning"],
    icon: BarChart,
    color: 'from-amber-500 to-orange-600',
    hoverColor: 'group-hover:from-amber-600 group-hover:to-orange-700'
  },
  {
    name: "Audit & Assurance",
    description: "Ensure compliance and transparency with our thorough audit and assurance services",
    features: ["Statutory audits", "Internal audits", "Process audits", "Compliance reviews"],
    icon: FileText,
    color: 'from-purple-500 to-fuchsia-600',
    hoverColor: 'group-hover:from-purple-600 group-hover:to-fuchsia-700'
  },
  {
    name: "Business Advisory",
    description: "Transform your business with strategic advisory services tailored to your goals",
    features: ["Growth strategies", "Business restructuring", "Market entry", "Risk management"],
    icon: ShieldCheck,
    color: 'from-pink-500 to-rose-600',
    hoverColor: 'group-hover:from-pink-600 group-hover:to-rose-700'
  },
  {
    name: "Legal Compliance",
    description: "Navigate complex regulations with our comprehensive legal compliance services",
    features: ["Contract reviews", "Legal documentation", "Compliance training", "Regulatory updates"],
    icon: Scale,
    color: 'from-indigo-500 to-violet-600',
    hoverColor: 'group-hover:from-indigo-600 group-hover:to-violet-700'
  },
];

// Company logos for the trusted by section
const companyLogos = [
  { name: 'TechCorp', logo: '/images/logos/logo-1.svg' },
  { name: 'InnovateX', logo: '/images/logos/logo-2.svg' },
  { name: 'GlobalFirm', logo: '/images/logos/logo-3.svg' },
  { name: 'NextGen', logo: '/images/logos/logo-4.svg' },
  { name: 'PrimeSolutions', logo: '/images/logos/logo-5.svg' },
];

// Testimonial data with detailed client information
const testimonials = [
  {
    quote: "SKS transformed our financial operations. Their team provided insights that helped us reduce costs by 22% while improving our compliance posture.",
    author: "Rajiv Mehta",
    position: "CFO",
    company: "TechSolutions India Ltd."
  },
  {
    quote: "The tax planning services from SKS saved us over ₹12 lakhs in the last financial year alone. Their expertise in Indian tax regulations is unmatched.",
    author: "Priya Sharma",
    position: "Finance Director",
    company: "GlobalTrade Enterprises"
  },
  {
    quote: "Working with SKS for our business registration was seamless. They handled all the complexities and we were operational in record time.",
    author: "Amit Patel",
    position: "Founder & CEO",
    company: "InnovateNow Startup"
  },
];

// Animation variants for framer-motion
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

// AnimatedSection component with proper typing
interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

function AnimatedSection({ children, className = "", delay = 0 }: AnimatedSectionProps) {
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
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Handle client-side hydration
  useEffect(() => {
    setIsClient(true);
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
          } else if (role === 'consultant') {
            router.push('/consultant/dashboard');
          } else if (role === 'employee') {
            router.push('/employee/dashboard');
          } else {
            // Default to client dashboard if role is not specified
            router.push('/client/dashboard');
          }
        } catch (err) {
          console.error('Home: Redirection error', err);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    } catch (error) {
      console.error('Home: Redirection setup error', error);
    }
  }, [isInitialized, user, router]);

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
      <main className="overflow-hidden pt-16">
        {/* Hero Section - Enhanced Design with Better Responsiveness */}
        <section className="relative overflow-hidden bg-white">
          {/* Refined background with subtle patterns */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-0">
            <div className="absolute inset-0 opacity-30" 
                 style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px)', backgroundSize: '24px 24px' }}></div>
          </div>
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col lg:flex-row py-16 lg:py-28 xl:py-32 items-center gap-12 lg:gap-16">
              {/* Enhanced Content Column */}
              <div className="w-full lg:w-1/2 lg:pr-8 order-2 lg:order-1">
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={`content-${isClient && user ? 'user' : 'guest'}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {user ? (
                      <>
                        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 lg:text-6xl">
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
                        
                        <p className="mt-6 text-lg leading-relaxed text-gray-600 max-w-2xl">
                          Your personalized dashboard is ready with the latest updates on your consulting projects and strategic recommendations.
                        </p>
                        
                        <motion.div 
                          className="mt-8"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          <Button 
                            asChild
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 text-base font-medium"
                          >
                            <Link href={`/${user.role?.toLowerCase() || 'client'}/dashboard`} className="flex items-center">
                              Continue to Dashboard
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </motion.div>
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
                        
                        <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 lg:text-6xl">
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
                        
                        <p className="mt-6 text-lg leading-relaxed text-gray-600 max-w-2xl">
                          SKS Consulting delivers tailored professional services to elevate your business. 
                          Our expertise in taxation, compliance, and business strategy creates a clear 
                          path to sustainable growth and operational excellence.
                        </p>
                        
                        <motion.div 
                          className="mt-8"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5, duration: 0.5 }}
                        >
                          <Button 
                            asChild
                            className="bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-8 py-3 rounded-md shadow-lg hover:shadow-xl transition-all duration-300 text-base font-medium"
                          >
                            <Link href="/services-list" className="flex items-center">
                              Access Premium Services
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                          </Button>
                        </motion.div>
                        
                        <div className="mt-8 flex items-center">
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
              
              {/* Enhanced Image Column */}
              <div className="w-full lg:w-1/2 order-1 lg:order-2">
                <div className="relative h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[550px] rounded-2xl shadow-2xl overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={`hero-image-${currentImage}`}
                      initial={{ opacity: 0, scale: 1.05 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 1, ease: "easeInOut" }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={heroImages[currentImage].url}
                        alt={heroImages[currentImage].alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover object-center"
                        quality={90}
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/20 to-transparent"></div>
                    </motion.div>
                  </AnimatePresence>
                  
                  {/* Enhanced image indicators */}
                  <div className="absolute bottom-6 left-0 right-0 flex justify-center space-x-3 z-10">
                    {heroImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          currentImage === index 
                            ? 'w-10 bg-white scale-100' 
                            : 'w-5 bg-white/50 scale-90'
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
        
        {/* Trusted By Section - Enhanced Design */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-lg font-medium text-gray-600 mb-8">Trusted by India's leading businesses</h2>
              
              <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
                {companyLogos.map((company, index) => (
                  <motion.div
                    key={company.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="col-span-1 flex justify-center items-center"
                  >
                    <div className="relative h-12 w-40">
                      <Image 
                        src={company.logo} 
                        alt={company.name}
                        width={160}
                        height={48}
                        sizes="160px"
                        className="object-contain grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Services Section - Premium Cards with Enhanced Content */}
        <AnimatedSection 
          className="py-24 bg-gradient-to-b from-white to-gray-50" 
          delay={0.2}
        >
          <div id="services" className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-12">
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

            {/* Mobile-optimized grid layout */}
            <div className="grid gap-3 sm:gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service, index) => {
                const Icon = service.icon;
                return (
                  <motion.div
                    key={service.name}
                    variants={fadeIn}
                    custom={index}
                    className={`group relative rounded-lg bg-white p-3 sm:p-5 md:p-8 shadow-lg hover:shadow-xl transition-all duration-500 border border-gray-100 overflow-hidden`}
                  >
                    {/* Enhanced Service Card Design */}
                    <div className="relative z-10">
                      <div className={`absolute top-0 right-0 -mt-6 -mr-6 w-24 h-24 rounded-full bg-gradient-to-br ${service.color} opacity-10 transform scale-0 group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
                      
                      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 items-center justify-center rounded-xl bg-gradient-to-br ${service.color} ${service.hoverColor} transition-all duration-300 mb-4 md:mb-6`}>
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-white" />
                      </div>
                      
                      <h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 line-clamp-2">{service.name}</h3>
                      
                      <p className="mt-2 sm:mt-3 text-xs sm:text-sm md:text-base text-gray-600 group-hover:text-gray-700 transition-colors duration-300 line-clamp-3 md:line-clamp-none">{service.description}</p>
                      
                      {/* Features only visible on larger screens */}
                      <div className="hidden md:block mt-6 pt-6 border-t border-gray-100">
                        <ul className="space-y-3">
                          {service.features.map((feature, i) => (
                            <li key={i} className="flex items-center">
                              <div className={`flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center bg-gradient-to-br ${service.color} ${service.hoverColor}`}>
                                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <span className="ml-3 text-sm text-gray-600">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Condensed features list for mobile */}
                      <div className="md:hidden mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Top Features:</p>
                        <p className="text-xs text-gray-600 line-clamp-1">
                          {service.features.slice(0, 2).join(" • ")}
                          {service.features.length > 2 ? " & more" : ""}
                        </p>
                      </div>
                      
                      <div className="mt-4 md:mt-8">
                        <Button 
                          asChild
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 -ml-2 group-hover:translate-x-1 transition-transform duration-300 text-xs sm:text-sm"
                        >
                          <Link href="/services-list" className="flex items-center px-2 sm:px-4 py-1 sm:py-2">
                            Learn More
                            <ArrowRight className="ml-1 h-3 w-3 sm:h-4 sm:w-4 group-hover:ml-2 transition-all duration-300" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* View All Services button for mobile */}
            <div className="mt-8 text-center md:hidden">
              <Button
                asChild
                variant="primary"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white border-2 border-transparent hover:border-blue-300 transition-all duration-300 px-8 py-6 text-lg font-medium rounded-md shadow-md hover:shadow-lg"
              >
                <Link href="/services-list">
                  Explore Services
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
        
        {/* Testimonials Section - Enhanced Design */}
        <section className="relative py-24 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          <div className="absolute inset-0 opacity-5 pointer-events-none overflow-hidden">
            <div className="absolute -top-24 -left-24 opacity-20 text-[400px] leading-none font-serif text-blue-600">"</div>
            <div className="absolute -bottom-24 -right-24 opacity-20 text-[400px] leading-none font-serif text-blue-600 rotate-180">"</div>
          </div>
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-base font-semibold uppercase tracking-wide text-blue-600">
                Client Success Stories
              </h2>
              <p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
                What Our Clients Say
              </p>
            </div>
            
            <div className="relative mx-auto max-w-4xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={`testimonial-${currentTestimonial}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.7 }}
                  className="relative rounded-2xl bg-white shadow-xl p-8 sm:p-10 border border-gray-100"
                >
                  <div className="relative z-10">
                    <div className="mb-6 flex justify-center">
                      <div className="relative h-14 w-14 overflow-hidden rounded-full bg-gradient-to-r from-blue-400 to-indigo-500">
                        <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                          <span className="text-xl font-medium text-blue-700">
                            {testimonials[currentTestimonial].author.charAt(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute -left-3 -top-3 transform text-blue-200 opacity-30">
                        <svg width="30" height="30" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.428 31.285c-3.083 0-5.584-1.006-7.5-3.018C.637 26.256 0 23.663 0 20.489c0-5.028 1.468-9.648 4.405-13.857C7.342 2.421 10.685.317 14.437.004L15.534 4.5C12.95 5.292 10.796 6.899 9.071 9.321c-1.293 1.886-1.967 3.717-2.018 5.495.571-.521 1.516-.781 2.833-.781 2.133 0 3.988.712 5.567 2.136 1.612 1.356 2.417 3.237 2.417 5.647 0 2.188-.789 4.008-2.366 5.459-1.612 1.425-3.651 2.008-6.076 2.008zM24.857 31.285c-3.083 0-5.584-1.006-7.501-3.018-1.29-2.011-1.926-4.604-1.926-7.778 0-5.028 1.468-9.648 4.404-13.857 2.937-4.211 6.281-6.315 10.032-6.628L31.964 4.5c-2.585.792-4.738 2.399-6.464 4.821-1.293 1.886-1.967 3.717-2.018 5.495.57-.521 1.516-.781 2.833-.781 2.134 0 3.988.712 5.567 2.136 1.612 1.356 2.417 3.237 2.417 5.647 0 2.188-.788 4.008-2.366 5.459-1.612 1.425-3.65 2.008-6.076 2.008z" fill="currentColor" />
                        </svg>
                      </div>
                      
                      <blockquote className="text-xl font-medium text-gray-900 text-center px-4 md:px-8">
                        "{testimonials[currentTestimonial].quote}"
                      </blockquote>
                      
                      <div className="mt-6 text-center">
                        <div className="font-semibold text-gray-900">{testimonials[currentTestimonial].author}</div>
                        <div className="mt-1 text-sm text-gray-600">
                          {testimonials[currentTestimonial].position}, {testimonials[currentTestimonial].company}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              
              <div className="mt-10 flex justify-center space-x-3">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      currentTestimonial === index 
                        ? 'w-10 bg-blue-600' 
                        : 'w-3 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`View testimonial ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action - Clean Design */}
        <section className="relative py-24 bg-gradient-to-br from-blue-600 to-indigo-700 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
          </div>
          
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transform your business?
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-lg text-blue-100">
              Start your journey with SKS Consulting today and experience the difference our professional expertise can make for your business.
            </p>
            <div className="mt-10 flex justify-center gap-4 flex-wrap">
              <Button 
                asChild
                className="bg-white text-blue-700 hover:bg-blue-50 border-2 border-transparent hover:border-white transition-all duration-300 px-8 py-3 text-base font-medium rounded-md shadow-md hover:shadow-lg"
              >
                <Link href="/services-list">
                  Get Started
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white/10 transition-all duration-300 px-8 py-3 text-base font-medium rounded-md"
              >
                <Link href="/services-list">
                  Explore Services
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Feature data with accurate icon references
const features = [
  {
    title: "Client Management",
    description: "Easily manage your client relationships, track interactions, and store important information securely.",
    icon: <Icons.users className="w-6 h-6 text-blue-600" />,
  },
  {
    title: "Project Tracking",
    description: "Monitor project progress, set milestones, and ensure deadlines are met with our intuitive tracking system.",
    icon: <PieChart className="w-6 h-6 text-blue-600" />,
  },
  {
    title: "Financial Analytics",
    description: "Gain insights into your business performance with comprehensive financial reports and analytics.",
    icon: <BarChart className="w-6 h-6 text-blue-600" />,
  },
  {
    title: "Task Automation",
    description: "Automate repetitive tasks and workflows to save time and reduce human error.",
    icon: <Settings className="w-6 h-6 text-blue-600" />,
  },
  {
    title: "Secure Data Storage",
    description: "Keep your sensitive business data protected with our enterprise-grade security measures.",
    icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
  },
  {
    title: "Mobile Access",
    description: "Access your business information anytime, anywhere with our mobile-friendly platform.",
    icon: <Smartphone className="w-6 h-6 text-blue-600" />,
  },
];

// Companies data
const companies = [
  {
    name: "Acme Corp",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apple/apple-original.svg",
  },
  {
    name: "TechGiant",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/google/google-original.svg",
  },
  {
    name: "Innovate Inc",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/amazon/amazon-original.svg",
  },
  {
    name: "FutureSoft",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/facebook/facebook-original.svg",
  },
  {
    name: "GlobalTech",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/microsoft/microsoft-original.svg",
  },
  {
    name: "NextLevel",
    logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/slack/slack-original.svg",
  },
]; 