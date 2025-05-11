'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckoutForm } from '@/components/client/checkout-form';
import { useToast } from '@/components/ui/use-toast';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getServiceById } from '@/lib/data/services-data';
import { useAppSelector } from '@/store/hooks';

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

// Mock services data for direct checkout
const serviceMockData = [
  {
    id: "1",
    name: "Business Strategy Consultation",
    description: "Comprehensive business strategy consultation to help your company define clear objectives and develop actionable plans for growth.",
    price: 1499.99,
    imageUrl: "/assets/images/services/strategy.jpg",
  },
  {
    id: "2",
    name: "Financial Health Assessment",
    description: "Detailed evaluation of your company's financial status with recommendations for improvement.",
    price: 799.99,
    imageUrl: "/assets/images/services/finance.jpg",
  },
  {
    id: "3",
    name: "Tax Optimization Strategy",
    description: "Comprehensive tax planning to minimize liabilities while ensuring full compliance.",
    price: 599.99,
    imageUrl: "/assets/images/services/tax.jpg",
  }
];

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading, isInitialized } = useAppSelector(state => state.auth);
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<any>(null);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // Check authentication
  useEffect(() => {
    if (isInitialized && !authLoading && !user) {
      // Only redirect if auth is fully initialized and user is not logged in
      toast({
        title: "Authentication required",
        description: "Please sign in to access checkout",
        variant: "destructive"
      });
      
      const currentPath = window.location.pathname + window.location.search;
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(currentPath)}`);
    }
  }, [user, authLoading, isInitialized, router, toast]);

  useEffect(() => {
    // Don't fetch service data until we know auth state
    if (!isInitialized || authLoading) return;
    
    // Skip fetching if user is not authenticated (redirect will happen)
    if (!user) return;
    
    const fetchServiceData = async () => {
      setLoading(true);
      const serviceId = searchParams.get('serviceId');
      if (!serviceId) {
        toast({
          title: "Error",
          description: "No service selected for checkout",
          variant: "destructive"
        });
        router.push('/client/services');
        return;
      }

      try {
        // Try to fetch from Firestore first
        const serviceDocRef = doc(db, "services", serviceId);
        const serviceDoc = await getDoc(serviceDocRef);
        
        if (serviceDoc.exists()) {
          const serviceData = serviceDoc.data();
          setService({
            id: serviceDoc.id,
            ...serviceData
          });
          
          // Calculate totals
          const servicePrice = serviceData.price?.amount || 0;
          const calculatedTax = servicePrice * 0.18; // 18% GST
          
          setSubtotal(servicePrice);
          setTax(calculatedTax);
          setTotal(servicePrice + calculatedTax);
        } else {
          // Fallback to mock data from services-data.ts
          const mockService = getServiceById(serviceId);
          if (mockService) {
            setService(mockService);
            
            // Calculate totals
            const servicePrice = mockService.price?.amount || 0;
            const calculatedTax = servicePrice * 0.18; // 18% GST
            
            setSubtotal(servicePrice);
            setTax(calculatedTax);
            setTotal(servicePrice + calculatedTax);
          } else {
            throw new Error("Service not found");
          }
        }
      } catch (error) {
        console.error("Error fetching service:", error);
        toast({
          title: "Error",
          description: "Failed to load service details",
          variant: "destructive"
        });
        router.push('/client/services');
      } finally {
        setLoading(false);
      }
    };

    fetchServiceData();
  }, [searchParams, router, toast, user, authLoading, isInitialized]);

  // Show loading while initializing auth or fetching data
  if (authLoading || !isInitialized || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if not authenticated - redirect will happen
  if (!user) {
    return null;
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">No service selected</h2>
          <p className="text-muted-foreground">Please select a service to proceed with checkout</p>
          <Button asChild>
            <Link href="/client/services">Browse Services</Link>
          </Button>
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
          <Link href="/client/services" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Services
          </Link>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-3xl font-bold">
          Checkout
        </motion.h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">Complete Your Order</h2>
              
              <CheckoutForm 
                service={service}
                total={{
                  subtotal: subtotal,
                  tax: tax,
                  total: total
                }}
              />
            </Card>
          </motion.div>

          {/* Order Summary */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-4">
                <div className="bg-accent/20 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-medium">{service?.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{service?.description || service?.shortDescription}</p>
                    </div>
                    <p className="font-medium">₹{subtotal.toFixed(2)}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tax (18% GST)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="mt-6 text-sm text-muted-foreground">
                <p>By completing this purchase, you agree to our Terms of Service and Privacy Policy.</p>
              </div>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}