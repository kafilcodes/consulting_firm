'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ShoppingCart, Clock, FileText, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

import { getServiceById, getRelatedServices, getRequiredDocumentsForService } from '@/lib/data/services-data';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<any>(null);
  const [relatedServices, setRelatedServices] = useState<any[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const serviceId = params.id as string;

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true);
      try {
        // Get service details from mock data or API
        const serviceData = getServiceById(serviceId);
        
        if (!serviceData) {
          toast.error('Service not found');
          router.push('/client/services');
          return;
        }
        
        setService(serviceData);
        
        // Get related services
        const related = getRelatedServices(serviceId);
        setRelatedServices(related);
        
        // Get required documents
        const documents = getRequiredDocumentsForService(serviceId);
        setRequiredDocuments(documents);
      } catch (error) {
        console.error('Error fetching service details:', error);
        toast.error('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [serviceId, router]);

  const handleOrderNow = () => {
    router.push(`/client/services/${serviceId}/order`);
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-4">
          <h2 className="text-2xl font-bold">Service not found</h2>
          <p className="text-muted-foreground">The service you are looking for does not exist or has been removed.</p>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back button */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mb-6"
          asChild
        >
          <Link href="/client/services">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Services
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Service header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-3">{service.name}</h1>
              <p className="text-lg text-muted-foreground mb-4">{service.shortDescription}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{service.serviceType === 'plan' ? 'Subscription Plan' : 'One-time Service'}</Badge>
                {service.category && (
                  <Badge variant="secondary">
                    {service.category.charAt(0).toUpperCase() + service.category.slice(1).replace('-', ' ')}
                  </Badge>
                )}
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {service.estimatedDuration}
                </Badge>
              </div>
            </div>

            {/* Service image */}
            <div className="mb-8 relative h-64 md:h-96 w-full rounded-lg overflow-hidden">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                  <FileText className="h-16 w-16 text-gray-400" />
                </div>
              )}
            </div>

            {/* Service tabs */}
            <div className="mb-8">
              <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="process">Process</TabsTrigger>
                  <TabsTrigger value="faq">FAQ</TabsTrigger>
                </TabsList>
                
                <div className="mt-6">
                  <TabsContent value="overview" className="space-y-6">
                    <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: service.description }} />
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Features</h3>
                      <ul className="space-y-2">
                        {service.features.map((feature: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold mb-4">Required Documents</h3>
                      {requiredDocuments.length > 0 ? (
                        <ul className="space-y-2">
                          {requiredDocuments.map((doc, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <FileText className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span>{doc}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No specific documents required</p>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="process" className="space-y-6">
                    <h3 className="text-xl font-semibold mb-4">Service Process</h3>
                    <ol className="relative border-l border-gray-200">
                      {service.process && service.process.map((step: any, index: number) => (
                        <li key={index} className="mb-10 ml-6">
                          <span className="absolute flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full -left-4 ring-4 ring-white">
                            <span className="text-blue-800 font-medium">{index + 1}</span>
                          </span>
                          <h3 className="flex items-center mb-1 text-lg font-semibold text-gray-900">
                            {step.title}
                          </h3>
                          <p className="mb-4 text-base font-normal text-gray-500">
                            {step.description}
                          </p>
                        </li>
                      ))}
                    </ol>
                  </TabsContent>
                  
                  <TabsContent value="faq" className="space-y-6">
                    <h3 className="text-xl font-semibold mb-4">Frequently Asked Questions</h3>
                    {service.faqs && service.faqs.length > 0 ? (
                      <Accordion type="single" collapsible className="w-full">
                        {service.faqs.map((faq: any, index: number) => (
                          <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger>{faq.question}</AccordionTrigger>
                            <AccordionContent>{faq.answer}</AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-muted-foreground">No FAQs available for this service</p>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>

            {/* Related services */}
            {relatedServices.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-semibold mb-6">Related Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedServices.map((relatedService) => (
                    <Card key={relatedService.id} className="overflow-hidden">
                      <Link href={`/client/services/${relatedService.id}`} className="block">
                        <div className="relative h-40 w-full">
                          {relatedService.image ? (
                            <Image
                              src={relatedService.image}
                              alt={relatedService.name}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <CardContent className="p-4">
                          <h4 className="font-semibold text-lg mb-1 line-clamp-1">{relatedService.name}</h4>
                          <p className="text-muted-foreground text-sm line-clamp-2">{relatedService.shortDescription}</p>
                        </CardContent>
                      </Link>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Service Summary</CardTitle>
                  <CardDescription>Key information about this service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Price</p>
                    <p className="text-2xl font-bold">
                      {formatCurrency(service.price.amount, service.price.currency)}
                      {service.price.billingCycle && <span className="text-sm font-normal text-muted-foreground"> / {service.price.billingCycle}</span>}
                    </p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-muted-foreground text-sm">Estimated Time</p>
                    <p className="font-medium">{service.estimatedDuration}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <p className="text-muted-foreground text-sm">Category</p>
                    <p className="font-medium">{service.category ? service.category.charAt(0).toUpperCase() + service.category.slice(1).replace('-', ' ') : 'General'}</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleOrderNow}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Order Now
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}