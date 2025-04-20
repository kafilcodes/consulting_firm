'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, Calendar, Clock, Users, ChevronRight, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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

// Mock service data (this would come from an API/database in production)
const services = [
  {
    id: "1",
    name: "Business Strategy Consultation",
    description: "Comprehensive business strategy consultation to help your company define clear objectives and develop actionable plans for growth.",
    longDescription: `Our Business Strategy Consultation service provides a thorough analysis of your company's current position and helps chart a clear path forward. 

We begin with a comprehensive assessment of your business model, market position, and competitive landscape. Our expert consultants then work closely with your leadership team to define strategic objectives, identify growth opportunities, and develop actionable implementation plans.

This service is ideal for businesses looking to pivot, scale, or simply refine their strategic direction in a changing market environment.`,
    price: 1499.99,
    oldPrice: 1799.99,
    duration: "4 weeks",
    format: "In-person & Virtual",
    groupSize: "1-3 key stakeholders",
    category: "Business Strategy",
    imageUrl: "/assets/images/services/strategy.jpg",
    popular: true,
    features: [
      "Comprehensive business analysis",
      "Market positioning strategy",
      "Competitive landscape assessment",
      "Growth opportunity identification",
      "Strategic planning workshops",
      "Implementation roadmap",
      "Executive presentation"
    ],
    faqs: [
      {
        question: "How long does the consultation process take?",
        answer: "The standard consultation process takes 4 weeks, including initial assessment, strategy development, and final presentation. Complex cases may require additional time."
      },
      {
        question: "Who should participate in the consultation?",
        answer: "We recommend including key decision-makers such as C-suite executives, department heads relevant to the focus areas, and any stakeholders with strategic oversight."
      },
      {
        question: "How do you measure the success of the strategy?",
        answer: "We establish clear KPIs aligned with your business goals during the consultation. We also offer optional follow-up assessments at 3, 6, and 12 months to track implementation progress."
      },
      {
        question: "Do you provide implementation support?",
        answer: "While this service focuses on strategy development, we offer separate implementation support packages that can be added on as needed."
      }
    ],
    consultants: [
      {
        name: "Dr. Sarah Johnson",
        title: "Senior Strategy Consultant",
        avatar: "/assets/images/team/consultant1.jpg",
        bio: "Former McKinsey consultant with 15+ years of experience in business strategy across multiple industries."
      },
      {
        name: "Mark Williams",
        title: "Growth Strategy Specialist",
        avatar: "/assets/images/team/consultant2.jpg",
        bio: "Specializes in identifying new market opportunities and creating scalable growth strategies for SMEs and enterprises."
      }
    ],
    reviews: [
      {
        name: "James Thompson",
        company: "Nexus Technologies",
        rating: 5,
        comment: "The business strategy consultation transformed our approach to market expansion. Within 6 months of implementing the recommended strategies, we saw a 32% increase in qualified leads and 18% revenue growth."
      },
      {
        name: "Sophia Chen",
        company: "Elixir Wellness",
        rating: 4,
        comment: "Comprehensive strategy work that helped us pivot during challenging market conditions. The roadmap provided was practical and adaptable as conditions changed."
      }
    ]
  },
  // ... other services
];

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Find the service with the matching ID
  const service = services.find(s => s.id === params.id);
  
  // If service doesn't exist, show 404
  if (!service) {
    notFound();
  }

  // Handle ordering the service - redirect to checkout
  const handleOrderService = (serviceId: string) => {
    router.push(`/checkout?serviceId=${serviceId}`);
    toast.success('Proceeding to checkout');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Back Link */}
        <motion.div variants={itemVariants}>
          <Link href="/services" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Services
          </Link>
        </motion.div>
        
        {/* Service Header */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Image & Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="relative rounded-lg overflow-hidden h-[300px] md:h-[400px]">
              <Image 
                src={service.imageUrl} 
                alt={service.name}
                fill
                className="object-cover"
              />
              {service.popular && (
                <Badge className="absolute top-4 right-4 bg-primary text-white">Popular</Badge>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold">{service.name}</h1>
              <p className="text-muted-foreground mt-2">{service.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 text-primary mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{service.duration}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-primary mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Format</p>
                  <p className="font-medium">{service.format}</p>
                </div>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-primary mr-2" />
                <div>
                  <p className="text-sm text-muted-foreground">Group Size</p>
                  <p className="font-medium">{service.groupSize}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Price & Order Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <p className="text-muted-foreground">Service Fee</p>
                    <div className="flex items-end mt-1">
                      <span className="text-3xl font-bold">${service.price.toFixed(2)}</span>
                      {service.oldPrice && (
                        <span className="ml-2 text-muted-foreground line-through">${service.oldPrice.toFixed(2)}</span>
                      )}
                    </div>
                    {service.oldPrice && (
                      <p className="text-sm text-green-600 mt-1">
                        Save ${(service.oldPrice - service.price).toFixed(2)} ({Math.round((1 - service.price / service.oldPrice) * 100)}% off)
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">This service includes:</h3>
                    <ul className="space-y-2">
                      {service.features.slice(0, 5).map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button 
                    size="lg" 
                    className="w-full" 
                    onClick={() => handleOrderService(service.id)}
                  >
                    Order Now
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground">
                    By ordering, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
        
        {/* Tabs Content */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="team">Consultants</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-4">About This Service</h2>
                <div className="prose max-w-none">
                  {service.longDescription.split('\n\n').map((paragraph, idx) => (
                    <p key={idx} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-semibold mb-4">What You'll Get</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{feature}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {service.reviews && service.reviews.length > 0 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-4">Client Testimonials</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {service.reviews.map((review, index) => (
                      <Card key={index} className="bg-accent/20">
                        <CardContent className="p-6">
                          <div className="flex items-center mb-4">
                            <div className="flex mr-2">
                              {[...Array(5)].map((_, i) => (
                                <svg 
                                  key={i} 
                                  className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} 
                                  fill="currentColor" 
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                </svg>
                              ))}
                            </div>
                          </div>
                          <p className="italic mb-3">{review.comment}</p>
                          <div>
                            <p className="font-medium">{review.name}</p>
                            <p className="text-sm text-muted-foreground">{review.company}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="faq" className="space-y-4">
              <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
              {service.faqs && service.faqs.map((faq, index) => (
                <div key={index} className="mb-4">
                  <h3 className="text-lg font-medium mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                  {index < service.faqs.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </TabsContent>
            
            <TabsContent value="team" className="space-y-6">
              <h2 className="text-2xl font-semibold mb-6">Meet Your Consultants</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {service.consultants && service.consultants.map((consultant, index) => (
                  <Card key={index} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="sm:w-1/3 relative h-48 sm:h-auto">
                          <Image 
                            src={consultant.avatar} 
                            alt={consultant.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="sm:w-2/3 p-6">
                          <h3 className="font-bold text-lg">{consultant.name}</h3>
                          <p className="text-primary text-sm mb-3">{consultant.title}</p>
                          <p className="text-muted-foreground">{consultant.bio}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
        
        {/* Call to Action */}
        <motion.div variants={itemVariants} className="bg-primary/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to transform your business?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Get started with {service.name} today and take the first step toward achieving your business goals.
          </p>
          <Button 
            size="lg" 
            onClick={() => handleOrderService(service.id)}
          >
            Order Now
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
} 