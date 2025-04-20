'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

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

// Mock service categories
const categories = [
  'All Services',
  'Business Strategy',
  'Financial Services',
  'Tax Planning',
  'Market Analysis',
  'Operations',
  'Legal Services'
];

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
    imageUrl: '/images/pexels-karolina-grabowska-7680751.jpg',
    popular: true
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
    imageUrl: '/images/pexels-rdne-7821708.jpg',
    popular: false
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
    imageUrl: '/images/pexels-n-voitkevich-6863281.jpg',
    popular: true
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
    imageUrl: '/images/pexels-n-voitkevich-8927456.jpg',
    popular: false
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
    imageUrl: '/images/pexels-n-voitkevich-6863260.jpg',
    popular: false
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
    imageUrl: '/images/pexels-karolina-grabowska-7680751.jpg',
    popular: false
  }
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Services');
  const router = useRouter();

  // Filter services based on search and category
  const filteredServices = React.useMemo(() => {
    return services.filter(service => {
      // Category filter
      if (selectedCategory !== 'All Services' && service.category !== selectedCategory) {
        return false;
      }
      
      // Search filter
      if (searchTerm && !service.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [selectedCategory, searchTerm]);

  // Handle direct ordering - navigate to checkout
  const handleOrderService = (serviceId: string) => {
    router.push(`/checkout?serviceId=${serviceId}`);
  };

  // Format currency
  const formatCurrency = (price: number, oldPrice: number | null) => {
    return (
      <div className="mt-2">
        <span className="text-lg font-semibold">${price.toFixed(2)}</span>
        {oldPrice && (
          <span className="ml-2 text-gray-400 line-through">${oldPrice.toFixed(2)}</span>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Header & controls */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Professional Services</h1>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>
        
        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredServices.map((service) => (
              <motion.div key={service.id} variants={itemVariants}>
                <Card className="h-full flex flex-col">
                  <div className="relative h-48">
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                    {service.popular && (
                      <Badge className="absolute top-2 right-2 bg-primary text-white font-medium">Popular</Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                    <CardDescription>{service.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="grow">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Key Features:</h4>
                      <ul className="space-y-1">
                        {service.features.map((feature, index) => (
                          <li key={index} className="text-sm flex items-start">
                            <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                  <CardFooter className="flex gap-2 pt-0">
                    <Button 
                      variant="outline" 
                      className="w-1/2"
                      asChild
                    >
                      <Link href={`/services/${service.id}`}>
                        Details
                      </Link>
                    </Button>
                    <Button 
                      className="w-1/2"
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
          <motion.div variants={itemVariants} className="text-center py-12">
            <p className="text-xl font-medium mb-2">No services found</p>
            <p className="text-gray-500 mb-6">Try adjusting your search or filter criteria</p>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All Services');
            }}>
              Reset Filters
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 