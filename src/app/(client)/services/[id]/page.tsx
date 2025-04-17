'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, ShoppingCart, Clock, Shield, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'react-hot-toast';
import { Badge } from '@/components/ui/badge';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

// Mock services data (should be moved to a central data store/API in production)
const services = [
  {
    id: 'srv-001',
    name: 'Business Strategy Consultation',
    description: 'Comprehensive analysis and strategy development for business growth and expansion.',
    longDescription: 'Our expert consultants provide in-depth analysis of your business operations, market position, and competitive landscape to develop a customized growth strategy. This service includes market research, SWOT analysis, and actionable recommendations.',
    category: 'Business Strategy',
    price: 999.99,
    oldPrice: 1299.99,
    features: [
      'Comprehensive business analysis',
      'Market positioning strategy',
      'Competitive analysis',
      'Growth roadmap',
      '3 follow-up sessions'
    ],
    benefits: [
      'Increase revenue by identifying growth opportunities',
      'Gain competitive advantage through strategic positioning',
      'Reduce waste and optimize operations',
      'Create clear direction for your business',
      'Expert guidance from industry professionals'
    ],
    process: [
      'Initial consultation and discovery',
      'Data collection and analysis',
      'Strategic planning workshop',
      'Strategy development and documentation',
      'Implementation planning',
      'Follow-up reviews and adjustments'
    ],
    imageUrl: '/images/pexels-karolina-grabowska-7680751.jpg',
    popular: true,
    estimatedTime: '4-6 weeks',
    recommended: true
  },
  {
    id: 'srv-002',
    name: 'Financial Health Assessment',
    description: 'Detailed evaluation of your company\'s financial status with recommendations for improvement.',
    longDescription: 'Our financial experts will conduct a thorough analysis of your company\'s financial statements, cash flow, debt structure, and investment portfolio to identify strengths and weaknesses. We provide actionable recommendations to improve financial health and stability.',
    category: 'Financial Services',
    price: 799.99,
    oldPrice: null,
    features: [
      'Financial statement analysis',
      'Cash flow optimization',
      'Debt restructuring advice',
      'Budget planning',
      'Investment review'
    ],
    benefits: [
      'Identify financial strengths and weaknesses',
      'Improve cash flow management',
      'Reduce interest costs through debt optimization',
      'Better allocation of financial resources',
      'Increased financial stability'
    ],
    process: [
      'Financial documentation collection',
      'Analysis of financial statements',
      'Cash flow review and forecasting',
      'Debt structure evaluation',
      'Recommendations development',
      'Implementation support'
    ],
    imageUrl: '/images/pexels-rdne-7821708.jpg',
    popular: false,
    estimatedTime: '2-3 weeks',
    recommended: false
  },
  {
    id: 'srv-003',
    name: 'Tax Optimization Strategy',
    description: 'Comprehensive tax planning to minimize liabilities while ensuring full compliance.',
    longDescription: 'Our tax specialists will analyze your business structure, operations, and finances to identify legal tax-saving opportunities. We develop a customized tax strategy that minimizes your tax burden while ensuring compliance with all regulatory requirements.',
    category: 'Tax Planning',
    price: 599.99,
    oldPrice: 749.99,
    features: [
      'Tax liability assessment',
      'Deduction optimization',
      'Business structure evaluation',
      'Regulatory compliance review',
      'Year-round tax planning'
    ],
    benefits: [
      'Reduce tax liabilities legally',
      'Avoid penalties through compliance',
      'Optimize business structure for tax efficiency',
      'Long-term tax planning strategy',
      'Peace of mind during tax season'
    ],
    process: [
      'Tax situation assessment',
      'Identification of tax-saving opportunities',
      'Business structure analysis',
      'Compliance review',
      'Strategy development',
      'Implementation and ongoing support'
    ],
    imageUrl: '/images/pexels-n-voitkevich-6863281.jpg',
    popular: true,
    estimatedTime: '3-4 weeks',
    recommended: true
  },
  {
    id: 'srv-004',
    name: 'Market Entry Analysis',
    description: 'Detailed research and strategic planning for entering new markets or product segments.',
    longDescription: 'Before expanding into new territories or launching new products, our market analysis provides crucial insights into market size, customer demographics, competitor landscape, and regulatory factors. We develop a tailored market entry strategy to maximize success.',
    category: 'Market Analysis',
    price: 899.99,
    oldPrice: null,
    features: [
      'Market size & growth analysis',
      'Customer segmentation',
      'Competitor landscape mapping',
      'Regulatory assessment',
      'Market entry roadmap'
    ],
    benefits: [
      'Reduce risk when entering new markets',
      'Identify the most profitable customer segments',
      'Understand competitive positioning',
      'Navigate regulatory requirements confidently',
      'Clear roadmap for market entry execution'
    ],
    process: [
      'Market research and data collection',
      'Customer segmentation analysis',
      'Competitive landscape mapping',
      'Regulatory environment assessment',
      'Strategy development',
      'Implementation planning'
    ],
    imageUrl: '/images/pexels-n-voitkevich-8927456.jpg',
    popular: false,
    estimatedTime: '4-6 weeks',
    recommended: false
  },
  {
    id: 'srv-005',
    name: 'Operations Efficiency Audit',
    description: 'Comprehensive assessment of operational processes with optimization recommendations.',
    longDescription: 'Our operations specialists will evaluate your current business processes, supply chain, and resource allocation to identify inefficiencies and bottlenecks. We provide detailed recommendations for streamlining operations, reducing costs, and improving productivity.',
    category: 'Operations',
    price: 699.99,
    oldPrice: 849.99,
    features: [
      'Process mapping & analysis',
      'Efficiency benchmarking',
      'Bottleneck identification',
      'Resource optimization plan',
      'Implementation roadmap'
    ],
    benefits: [
      'Reduce operational costs',
      'Improve productivity and output',
      'Streamline workflows and processes',
      'Better resource allocation',
      'Enhanced operational performance'
    ],
    process: [
      'Operations assessment',
      'Process mapping and documentation',
      'Efficiency analysis and benchmarking',
      'Bottleneck and waste identification',
      'Recommendations development',
      'Implementation planning and support'
    ],
    imageUrl: '/images/pexels-n-voitkevich-6863260.jpg',
    popular: false,
    estimatedTime: '3-5 weeks',
    recommended: false
  },
  {
    id: 'srv-006',
    name: 'Legal Compliance Review',
    description: 'Comprehensive assessment of your business\'s legal compliance across all relevant regulations.',
    longDescription: 'Our legal experts conduct a thorough review of your business operations, contracts, employment practices, and industry-specific requirements to ensure full compliance with relevant laws and regulations. We identify potential legal risks and provide recommendations for mitigation.',
    category: 'Legal Services',
    price: 849.99,
    oldPrice: null,
    features: [
      'Regulatory compliance assessment',
      'Contract review',
      'Employment practices evaluation',
      'Risk identification',
      'Compliance action plan'
    ],
    benefits: [
      'Avoid costly legal penalties and fines',
      'Mitigate legal risks proactively',
      'Ensure contract validity and enforceability',
      'Maintain proper employment practices',
      'Peace of mind regarding regulatory compliance'
    ],
    process: [
      'Documentation collection',
      'Operations and practices review',
      'Contract analysis',
      'Employment practices evaluation',
      'Risk assessment',
      'Compliance plan development'
    ],
    imageUrl: '/images/pexels-karolina-grabowska-7680751.jpg',
    popular: false,
    estimatedTime: '2-4 weeks',
    recommended: false
  }
];

// Related services recommendations
const getRelatedServices = (currentId: string, category: string) => {
  return services
    .filter(service => service.id !== currentId && service.category === category)
    .slice(0, 2);
};

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { items, addItem } = useCartStore();
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);

  useEffect(() => {
    // In a real application, this would be an API call
    const serviceId = params.id as string;
    const foundService = services.find(s => s.id === serviceId);
    
    if (foundService) {
      setService(foundService);
      setRelatedServices(getRelatedServices(serviceId, foundService.category));
    } else {
      // Service not found, redirect to services page
      router.push('/services');
      toast.error('Service not found');
    }
    
    setLoading(false);
  }, [params.id, router]);

  // Check if an item is already in the cart
  const isInCart = (id: string) => {
    return items.some(item => item.id === id);
  };
  
  // Handle adding service to cart
  const handleAddToCart = (serviceToAdd: any) => {
    if (!isInCart(serviceToAdd.id)) {
      addItem({
        id: serviceToAdd.id,
        name: serviceToAdd.name,
        description: serviceToAdd.description,
        price: serviceToAdd.price,
        oldPrice: serviceToAdd.oldPrice,
        imageUrl: serviceToAdd.imageUrl,
        quantity: 1
      });
      toast.success(`${serviceToAdd.name} added to cart`);
    } else {
      toast.error('This service is already in your cart');
    }
  };

  if (loading || !service) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants}>
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/services" className="flex items-center">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Services
            </Link>
          </Button>
        </motion.div>

        {/* Service Header */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative h-[300px] lg:h-[400px] rounded-lg overflow-hidden">
            <Image
              src={service.imageUrl}
              alt={service.name}
              fill
              className="object-cover"
            />
            {service.popular && (
              <Badge className="absolute top-4 right-4 bg-primary text-white">
                Popular
              </Badge>
            )}
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-bold">{service.name}</h1>
            <p className="text-lg text-muted-foreground">{service.description}</p>
            
            <div className="flex items-center">
              <div className="flex items-center mr-4">
                <Clock className="h-5 w-5 text-muted-foreground mr-2" />
                <span>{service.estimatedTime} timeframe</span>
              </div>
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-muted-foreground mr-2" />
                <span>Satisfaction guaranteed</span>
              </div>
            </div>
            
            <div className="mt-4 space-y-2">
              <h2 className="text-xl font-semibold">Price</h2>
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">${service.price.toFixed(2)}</span>
                {service.oldPrice && (
                  <span className="ml-2 text-lg text-muted-foreground line-through">
                    ${service.oldPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex space-x-4">
              <Button
                size="lg"
                className="flex-1"
                variant={isInCart(service.id) ? "secondary" : "default"}
                onClick={() => handleAddToCart(service)}
                disabled={isInCart(service.id)}
              >
                {isInCart(service.id) ? (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Added to Cart
                  </div>
                ) : (
                  <div className="flex items-center">
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart
                  </div>
                )}
              </Button>
              <Button size="lg" variant="outline" className="flex-1" asChild>
                <Link href="/contact">
                  Request Consultation
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Service Details Tabs */}
        <motion.div variants={itemVariants} className="mt-8">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Overview</TabsTrigger>
              <TabsTrigger value="benefits">Benefits</TabsTrigger>
              <TabsTrigger value="process">Process</TabsTrigger>
            </TabsList>
            
            <TabsContent value="details" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Service Overview</CardTitle>
                  <CardDescription>Comprehensive details about this service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-base">{service.longDescription}</p>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-3">Key Features</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.features.map((feature: string, index: number) => (
                        <li key={index} className="flex items-start">
                          <Check className="h-5 w-5 text-primary mr-2 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="benefits" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Benefits</CardTitle>
                  <CardDescription>How this service will help your business</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-4">
                    {service.benefits.map((benefit: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Award className="h-5 w-5 text-primary mr-3 mt-0.5" />
                        <div>
                          <p className="font-medium">{benefit}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="process" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Our Process</CardTitle>
                  <CardDescription>How we deliver this service</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className="relative border-l border-primary/30 ml-3 mt-4 space-y-6">
                    {service.process.map((step: string, index: number) => (
                      <li key={index} className="mb-6 ml-6">
                        <span className="absolute flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full -left-4 ring-4 ring-white dark:ring-gray-900">
                          {index + 1}
                        </span>
                        <h3 className="font-medium text-lg">{step}</h3>
                        <p className="text-muted-foreground">
                          {index === service.process.length - 1 
                            ? "Final stage of our service delivery process." 
                            : "An essential step in our methodology."}
                        </p>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Services */}
        {relatedServices.length > 0 && (
          <motion.div variants={itemVariants} className="mt-12">
            <h2 className="text-2xl font-bold mb-6">You might also be interested in</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedServices.map(relatedService => (
                <Card key={relatedService.id} className="flex flex-col h-full">
                  <div className="relative h-48">
                    <Image
                      src={relatedService.imageUrl}
                      alt={relatedService.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <CardTitle>{relatedService.name}</CardTitle>
                    <CardDescription>{relatedService.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="font-bold">${relatedService.price.toFixed(2)}</p>
                  </CardContent>
                  <div className="px-6 pb-6 flex space-x-3">
                    <Button variant="outline" className="flex-1" asChild>
                      <Link href={`/services/${relatedService.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button 
                      className="flex-1"
                      variant={isInCart(relatedService.id) ? "secondary" : "default"}
                      onClick={() => handleAddToCart(relatedService)}
                      disabled={isInCart(relatedService.id)}
                    >
                      {isInCart(relatedService.id) ? "In Cart" : "Add to Cart"}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 