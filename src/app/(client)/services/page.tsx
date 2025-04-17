'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ShoppingCart, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCartStore } from '@/stores/cart-store';
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

// Mock services data
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
  const [filteredServices, setFilteredServices] = useState(services);
  const { items, addItem } = useCartStore();
  
  // Filter services based on search and category
  useEffect(() => {
    let filtered = services;
    
    // Filter by category
    if (selectedCategory !== 'All Services') {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(service => 
        service.name.toLowerCase().includes(term) || 
        service.description.toLowerCase().includes(term) ||
        service.category.toLowerCase().includes(term)
      );
    }
    
    setFilteredServices(filtered);
  }, [searchTerm, selectedCategory]);
  
  // Check if an item is already in the cart
  const isInCart = (id: string) => {
    return items.some(item => item.id === id);
  };
  
  // Handle adding service to cart
  const handleAddToCart = (service: any) => {
    if (!isInCart(service.id)) {
      addItem({
        id: service.id,
        name: service.name,
        description: service.description,
        price: service.price,
        oldPrice: service.oldPrice,
        imageUrl: service.imageUrl,
        quantity: 1
      });
      toast.success(`${service.name} added to cart`);
    } else {
      toast.error('This service is already in your cart');
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl font-bold">Professional Services</h1>
          <p className="text-muted-foreground mt-2">
            Browse our range of professional consulting services
          </p>
        </motion.div>
        
        {/* Search and Filter */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative w-full sm:w-2/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              type="text"
              placeholder="Search services..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-1/3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="All Categories" />
                </div>
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
        
        {/* Cart Info */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="bg-primary/5 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center">
              <ShoppingCart className="h-5 w-5 text-primary mr-2" />
              <span>{items.length} service{items.length !== 1 ? 's' : ''} in your cart</span>
            </div>
            {items.length > 0 && (
              <Button size="sm" asChild>
                <Link href="/cart">
                  View Cart
                </Link>
              </Button>
            )}
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
                <Card className="h-full flex flex-col overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                    {service.popular && (
                      <Badge className="absolute top-2 right-2 bg-primary text-white">
                        Popular
                      </Badge>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <span>{service.name}</span>
                      {service.oldPrice ? (
                        <div className="text-right">
                          <span className="text-lg font-bold">${service.price.toFixed(2)}</span>
                          <span className="block text-sm text-muted-foreground line-through">
                            ${service.oldPrice.toFixed(2)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-lg font-bold">${service.price.toFixed(2)}</span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-sm">{service.description}</CardDescription>
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
                      variant={isInCart(service.id) ? "secondary" : "default"}
                      onClick={() => handleAddToCart(service)}
                      disabled={isInCart(service.id)}
                    >
                      {isInCart(service.id) ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          In Cart
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Add to Cart
                        </div>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div variants={itemVariants} className="text-center py-8">
            <div className="bg-accent/30 rounded-lg p-8">
              <h3 className="font-medium text-lg mb-2">No services found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any services matching your criteria.
              </p>
              <Button onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All Services');
              }}>
                Clear Filters
              </Button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
} 