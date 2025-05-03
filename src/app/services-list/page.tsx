'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { 
  CheckCircle, 
  ArrowRight, 
  Shield, 
  BarChart, 
  FileText, 
  Scale,
  ShieldCheck,
  Clock,
  Star,
  Filter,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

// Services data with detailed information
const services = [
  {
    id: 'business-registration',
    name: "Business Registration",
    shortDescription: "Streamline your business registration process with expert guidance",
    category: 'registration',
    popularity: 'high',
    price: "Starting from ₹9,999",
    image: "/images/services/business-registration.jpg",
    icon: Scale,
    color: 'from-emerald-500 to-teal-600',
    hoverColor: 'group-hover:from-emerald-600 group-hover:to-teal-700',
    benefits: ["Save 40+ hours of paperwork", "Avoid costly registration mistakes", "Get registered 2x faster than DIY"]
  },
  {
    id: 'tax-planning',
    name: "Tax Planning",
    shortDescription: "Optimize your tax strategy with expert planning and compliance",
    category: 'taxation',
    popularity: 'high',
    price: "Starting from ₹7,499",
    image: "/images/services/tax-planning.jpg",
    icon: Shield,
    color: 'from-blue-500 to-indigo-600',
    hoverColor: 'group-hover:from-blue-600 group-hover:to-indigo-700',
    benefits: ["Save up to 25% on tax liability", "Avoid penalties and interest", "Stress-free compliance"]
  },
  {
    id: 'financial-analysis',
    name: "Financial Analysis",
    shortDescription: "Gain valuable insights with detailed financial analysis and reporting",
    category: 'financial',
    popularity: 'medium',
    price: "Starting from ₹14,999",
    image: "/images/services/financial-analysis.jpg",
    icon: BarChart,
    color: 'from-amber-500 to-orange-600',
    hoverColor: 'group-hover:from-amber-600 group-hover:to-orange-700',
    benefits: ["Identify hidden profit opportunities", "Make data-driven financial decisions", "Strategic investment guidance"]
  },
  {
    id: 'audit-assurance',
    name: "Audit & Assurance",
    shortDescription: "Ensure compliance and transparency with thorough audit services",
    category: 'audit',
    popularity: 'medium',
    price: "Starting from ₹19,999",
    image: "/images/services/audit-assurance.jpg",
    icon: FileText,
    color: 'from-purple-500 to-fuchsia-600',
    hoverColor: 'group-hover:from-purple-600 group-hover:to-fuchsia-700',
    benefits: ["Enhance stakeholder confidence", "Identify process inefficiencies", "Ensure regulatory compliance"]
  },
  {
    id: 'business-advisory',
    name: "Business Advisory",
    shortDescription: "Transform your business with strategic advisory services tailored to your goals",
    category: 'advisory',
    popularity: 'high',
    price: "Starting from ₹24,999",
    image: "/images/services/business-advisory.jpg",
    icon: ShieldCheck,
    color: 'from-pink-500 to-rose-600',
    hoverColor: 'group-hover:from-pink-600 group-hover:to-rose-700',
    benefits: ["Clear roadmap for business growth", "Expert guidance on critical decisions", "Competitive advantage development"]
  },
  {
    id: 'legal-compliance',
    name: "Legal Compliance",
    shortDescription: "Navigate complex regulations with comprehensive legal compliance services",
    category: 'legal',
    popularity: 'medium',
    price: "Starting from ₹12,999",
    image: "/images/services/legal-compliance.jpg",
    icon: Scale,
    color: 'from-indigo-500 to-violet-600',
    hoverColor: 'group-hover:from-indigo-600 group-hover:to-violet-700',
    benefits: ["Minimize legal risks and liabilities", "Stay updated with changing regulations", "Prevent costly compliance violations"]
  },
];

// Service card component
interface ServiceCardProps {
  service: typeof services[0];
  hoveredService: string | null;
  setHoveredService: (id: string | null) => void;
  handleOrderClick: (id: string) => void;
}

const ServiceCard = ({ service, hoveredService, setHoveredService, handleOrderClick }: ServiceCardProps) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl border border-gray-100 transition-all duration-300",
        hoveredService === service.id ? "scale-[1.02]" : ""
      )}
      onMouseEnter={() => setHoveredService(service.id)}
      onMouseLeave={() => setHoveredService(null)}
    >
      {/* Premium badge for popular services */}
      {service.popularity === 'high' && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center shadow-md">
            <Star className="h-3 w-3 mr-1 fill-current" />
            PREMIUM
          </div>
        </div>
      )}
      
      {/* Service image with overlay */}
      <div className="relative h-52 w-full overflow-hidden">
        <Image
          src={service.image || "/images/services/default.jpg"}
          alt={service.name}
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300"></div>
        
        {/* Price tag */}
        <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1 rounded-full">
          {service.price}
        </div>
      </div>
      
      {/* Service content */}
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`p-2 rounded-lg bg-gradient-to-r ${service.color}`}>
            <service.icon className="h-5 w-5 text-white" />
          </div>
          <h3 className="ml-3 text-lg font-bold text-gray-900">{service.name}</h3>
        </div>
        
        <p className="text-gray-600 text-sm mb-5 line-clamp-2">{service.shortDescription}</p>
        
        {/* Benefits list */}
        <ul className="space-y-2 mb-5">
          {service.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <div className={`flex-shrink-0 h-4 w-4 rounded-full flex items-center justify-center bg-gradient-to-br ${service.color}`}>
                <CheckCircle className="h-2.5 w-2.5 text-white" />
              </div>
              <span className="ml-2 text-xs text-gray-700">{benefit}</span>
            </li>
          ))}
        </ul>
        
        {/* CTA buttons */}
        <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
          <Button 
            variant="link" 
            className="p-0 h-auto text-blue-600 hover:text-blue-800 text-sm font-medium inline-flex items-center"
          >
            View Details
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
          
          <Button 
            onClick={() => handleOrderClick(service.id)}
            className={`bg-gradient-to-r ${service.color} hover:${service.hoverColor} text-white transition-all duration-300 shadow-sm hover:shadow-md text-sm`}
          >
            Order Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default function ServicesListPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [hoveredService, setHoveredService] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const headerRef = useRef(null);
  
  // Handle service order click
  const handleOrderClick = (serviceId: string) => {
    if (user) {
      router.push('/client/services');
    } else {
      router.push(`/auth/sign-in?callbackUrl=${encodeURIComponent('/client/dashboard')}`);
    }
  };

  // Filter services based on search term
  const filteredServices = services.filter(service => 
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.shortDescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Header Section */}
        <header 
          ref={headerRef}
          className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white pt-32 pb-20 px-4 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="absolute -top-24 right-[10%] w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
            <div className="absolute top-[20%] -left-24 w-72 h-72 bg-white/20 rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-4xl md:text-5xl font-bold tracking-tight"
              >
                Professional Services
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto"
              >
                Discover our comprehensive range of consulting services designed to help your business grow and succeed
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="mt-8 max-w-xl mx-auto"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search services..."
                    className="w-full pl-10 py-6 rounded-full bg-white/10 backdrop-blur-sm border-none text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </header>
        
        {/* Services Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900">
                  {searchTerm ? `Search Results: "${searchTerm}"` : "All Services"}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredServices.length} {filteredServices.length === 1 ? 'service' : 'services'})
                  </span>
                </h2>
                
                <TabsList className="bg-white/80 backdrop-blur-sm p-1 shadow-sm border border-gray-100 rounded-lg">
                  <TabsTrigger 
                    value="all" 
                    className="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger 
                    value="popular"
                    className="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
                  >
                    Popular
                  </TabsTrigger>
                  <TabsTrigger 
                    value="taxation"
                    className="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
                  >
                    Tax
                  </TabsTrigger>
                  <TabsTrigger 
                    value="financial"
                    className="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
                  >
                    Financial
                  </TabsTrigger>
                  <TabsTrigger 
                    value="advisory"
                    className="px-3 py-1.5 text-sm font-medium rounded-md transition-all"
                  >
                    Advisory
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="all" className="mt-0">
                {filteredServices.length > 0 ? (
                  <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                    <AnimatePresence>
                      {filteredServices.map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service} 
                          hoveredService={hoveredService}
                          setHoveredService={setHoveredService}
                          handleOrderClick={handleOrderClick}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <Search className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">No services found</h3>
                    <p className="text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="popular" className="mt-0">
                <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {filteredServices
                      .filter(service => service.popularity === 'high')
                      .map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service} 
                          hoveredService={hoveredService}
                          setHoveredService={setHoveredService}
                          handleOrderClick={handleOrderClick}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="taxation" className="mt-0">
                <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {filteredServices
                      .filter(service => service.category === 'taxation')
                      .map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service} 
                          hoveredService={hoveredService}
                          setHoveredService={setHoveredService}
                          handleOrderClick={handleOrderClick}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="financial" className="mt-0">
                <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {filteredServices
                      .filter(service => service.category === 'financial')
                      .map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service} 
                          hoveredService={hoveredService}
                          setHoveredService={setHoveredService}
                          handleOrderClick={handleOrderClick}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              </TabsContent>

              <TabsContent value="advisory" className="mt-0">
                <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
                  <AnimatePresence>
                    {filteredServices
                      .filter(service => service.category === 'advisory')
                      .map((service) => (
                        <ServiceCard 
                          key={service.id} 
                          service={service} 
                          hoveredService={hoveredService}
                          setHoveredService={setHoveredService}
                          handleOrderClick={handleOrderClick}
                        />
                      ))}
                  </AnimatePresence>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
        
        {/* Call to Action */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Ready to elevate your business?
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Our expert consultants are standing by to help you achieve your business goals. Get in touch today.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base font-medium"
                onClick={() => router.push('/contact')}
              >
                Contact Us
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-8 py-6 text-base font-medium"
                onClick={() => router.push('/auth/sign-in')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
} 