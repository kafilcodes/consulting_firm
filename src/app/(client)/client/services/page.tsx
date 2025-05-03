'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Search, Tag, CheckCircle, ChevronRight, Loader2, Package, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import { servicesData, serviceCategories, getServicesByType } from '@/lib/data/services-data';
import { Service } from '@/types';

const easeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: 0.3 }
};

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('plans');

  // Initialize with URL parameters if present
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const typeParam = searchParams.get('type');
    
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
    
    if (typeParam && (typeParam === 'plans' || typeParam === 'one-time')) {
      setActiveTab(typeParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be a fetch call to an API
        // Filter services based on active tab (plans or one-time)
        const serviceType = activeTab === 'plans' ? 'plan' : 'one-time';
        const typeFilteredServices = getServicesByType(serviceType);
        setServices(typeFilteredServices);
        
        // Apply initial category filter if needed
        filterServices(typeFilteredServices, activeCategory, searchQuery);
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [activeTab, activeCategory, searchQuery]);

  // Filter services based on category and search
  const filterServices = (allServices: Service[], category: string, query: string) => {
    let filtered = [...allServices];
    
    // Apply category filter
    if (category && category !== 'all') {
      filtered = filtered.filter(service => service.category === category);
    }
    
    // Apply search filter if query exists
    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(lowerQuery) || 
        service.description.toLowerCase().includes(lowerQuery) ||
        service.features.some(feature => feature.toLowerCase().includes(lowerQuery))
      );
    }
    
    setFilteredServices(filtered);
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setActiveCategory('all'); // Reset category when switching tabs
    
    // Update URL for shareable links
    const params = new URLSearchParams(searchParams.toString());
    params.set('type', value);
    params.delete('category');
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  // Handle category change
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    
    // Update URL for shareable links
    const params = new URLSearchParams(searchParams.toString());
    if (category === 'all') {
      params.delete('category');
    } else {
      params.set('category', category);
    }
    
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({}, '', newUrl);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // Format price with billing type
  const formatPrice = (price: {amount: number, currency: string, billingType: 'one-time' | 'monthly' | 'yearly'}) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: price.currency,
      maximumFractionDigits: 0
    });
    
    return `${formatter.format(price.amount)}${price.billingType !== 'one-time' ? ` / ${price.billingType}` : ''}`;
  };

  // Handle direct order
  const handleOrderService = (serviceId: string) => {
    router.push(`/client/checkout?serviceId=${serviceId}`);
  };

  // Loading skeleton UI
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-12 w-64 mb-2" />
          <Skeleton className="h-6 w-full max-w-xl" />
        </div>
        
        <div className="mb-6">
          <Skeleton className="h-14 w-full max-w-md mx-auto" />
        </div>
        
        <div className="flex mb-6 gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-48" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6 mb-2" />
                <Skeleton className="h-4 w-4/6" />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-28" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Our Professional Services</h1>
          <p className="text-muted-foreground max-w-3xl mx-auto">
            Browse our extensive range of professional services designed to help your business grow and succeed.
          </p>
        </div>

        {/* Modern Service Type Selector */}
        <div className="w-full max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-center bg-muted/30 p-2 rounded-full">
            <button
              onClick={() => handleTabChange('plans')}
              className={`flex items-center justify-center w-full py-4 px-6 rounded-full text-base font-medium transition-all duration-300 ${
                activeTab === 'plans'
                  ? 'bg-gradient-to-r from-blue-600/70 via-blue-500/70 to-blue-400/70 text-white shadow-md transform scale-[1.02]'
                  : 'text-muted-foreground hover:bg-muted/70'
              }`}
            >
              <Package className={`mr-2 h-5 w-5 ${activeTab === 'plans' ? 'text-white' : 'text-muted-foreground'}`} />
              Service Plans
            </button>
            <button
              onClick={() => handleTabChange('one-time')}
              className={`flex items-center justify-center w-full py-4 px-6 rounded-full text-base font-medium transition-all duration-300 ${
                activeTab === 'one-time'
                  ? 'bg-gradient-to-r from-blue-600/70 via-blue-500/70 to-blue-400/70 text-white shadow-md transform scale-[1.02]'
                  : 'text-muted-foreground hover:bg-muted/70'
              }`}
            >
              <Clock className={`mr-2 h-5 w-5 ${activeTab === 'one-time' ? 'text-white' : 'text-muted-foreground'}`} />
              One-time Services
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-lg font-medium text-muted-foreground">
              {activeTab === 'plans' 
                ? 'Comprehensive service packages for ongoing business needs'
                : 'Individual services for specific requirements and quick resolutions'
              }
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search services..."
              className="pl-10"
              value={searchQuery}
              onChange={handleSearchChange}
            />
          </div>
          
          <div className="flex space-x-2 overflow-x-auto pb-2 md:pb-0">
            <Button
              variant={activeCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryChange('all')}
              className="whitespace-nowrap"
            >
              All Categories
            </Button>
            
            {serviceCategories.map((category) => (
              <Button
                key={category.id}
                variant={activeCategory === category.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryChange(category.id)}
                className="whitespace-nowrap"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="initial"
            animate="animate"
            variants={fadeIn}
          >
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="h-full flex flex-col hover:shadow-md transition-shadow duration-300 border-2 border-gray-100 overflow-hidden">
                  <div className="relative h-48 w-full overflow-hidden">
                    {service.image ? (
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    ) : (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <Tag size={48} className="text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-black/70 text-white font-medium">
                        {formatPrice(service.price)}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{service.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{service.shortDescription}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <h4 className="text-sm font-medium mb-2">Key Features:</h4>
                    <ul className="text-sm space-y-1">
                      {service.features.slice(0, 3).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-1">{feature}</span>
                        </li>
                      ))}
                      {service.features.length > 3 && (
                        <li className="text-sm text-muted-foreground">
                          + {service.features.length - 3} more features
                        </li>
                      )}
                    </ul>
                  </CardContent>
                  <CardFooter className="flex justify-between pt-2 border-t">
                    <Button 
                      variant="outline" 
                      asChild
                    >
                      <Link href={`/client/services/${service.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button
                      onClick={() => handleOrderService(service.id)}
                    >
                      Order Now
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-20 bg-muted/40 rounded-lg">
            <Tag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-medium mb-2">No services found</h3>
            <p className="text-muted-foreground mb-6">
              We couldn't find any services matching your criteria.
            </p>
            <Button onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}>
              Reset Filters
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
} 