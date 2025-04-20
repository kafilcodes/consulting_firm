'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle, 
  FileText, 
  ArrowLeft, 
  ChevronRight, 
  Clock, 
  Wallet, 
  AlertCircle,
  Info,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

import { getServiceById, getRelatedServices, getRequiredDocumentsForService } from '@/lib/data/services-data';
import { Service } from '@/types';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [relatedServices, setRelatedServices] = useState<Service[]>([]);
  const [requiredDocuments, setRequiredDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const serviceId = params.id as string;

  useEffect(() => {
    const fetchServiceDetails = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would be API calls
        const serviceData = getServiceById(serviceId);
        const relatedServicesData = getRelatedServices(serviceId);
        const requiredDocsData = getRequiredDocumentsForService(serviceId);
        
        if (!serviceData) {
          toast.error('Service not found');
          router.push('/client/services');
          return;
        }
        
        setService(serviceData);
        setRelatedServices(relatedServicesData);
        setRequiredDocuments(requiredDocsData);
      } catch (error) {
        console.error('Error fetching service details:', error);
        toast.error('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceDetails();
  }, [serviceId, router]);

  // Format price with billing type
  const formatPrice = (price: {amount: number, currency: string, billingType: 'one-time' | 'monthly' | 'yearly'}) => {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: price.currency,
      maximumFractionDigits: 0
    });
    
    return `${formatter.format(price.amount)}${price.billingType !== 'one-time' ? ` / ${price.billingType}` : ''}`;
  };

  // Handle direct service order
  const handleOrderService = (serviceId: string) => {
    router.push(`/client/checkout?serviceId=${serviceId}`);
  };

  // Loading skeleton UI
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8 flex items-center gap-2">
            <Skeleton className="h-10 w-28" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-64 w-full rounded-lg" />
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
              <Skeleton className="h-6 w-4/6" />
              
              <div className="space-y-4 mt-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-6 w-full" />
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Skeleton className="h-96 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Service not found</AlertTitle>
          <AlertDescription>
            We couldn't find the service you're looking for. It may have been removed or the URL may be incorrect.
          </AlertDescription>
          <Button 
            variant="outline" 
            className="mt-4 w-full"
            asChild
          >
            <Link href="/client/services">Browse All Services</Link>
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
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
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Service image */}
              {service.image && (
                <div className="relative h-72 md:h-96 w-full rounded-lg overflow-hidden mb-6">
                  <Image
                    src={service.image}
                    alt={service.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
                    <Badge className="mb-2" variant="secondary">
                      {serviceCategories.find(c => c.id === service.category)?.name || service.category}
                    </Badge>
                    <h1 className="text-2xl md:text-3xl font-bold text-white">{service.name}</h1>
                  </div>
                </div>
              )}
              
              {/* Tabs navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="documents">Required Documents</TabsTrigger>
                </TabsList>
                
                {/* Overview tab */}
                <TabsContent value="overview" className="pt-6">
                  <div className="prose prose-gray max-w-none">
                    <h2 className="text-xl font-semibold mb-4">Service Description</h2>
                    <p className="text-gray-700 mb-6">{service.description}</p>
                    
                    <h3 className="text-lg font-semibold mb-3">Key Features</h3>
                    <ul className="space-y-3 mb-6">
                      {service.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <h3 className="text-lg font-semibold mb-3">Deliverables</h3>
                    <ul className="space-y-3 mb-6">
                      {service.deliverables.map((deliverable, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span>{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="flex flex-col md:flex-row gap-6 mt-8">
                      <div className="flex items-center gap-3">
                        <Clock className="h-6 w-6 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Estimated Duration</p>
                          <p className="font-medium">{service.estimatedDuration}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Billing</p>
                          <p className="font-medium">{service.price.billingType === 'one-time' ? 'One-time payment' : `${service.price.billingType} subscription`}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Wallet className="h-6 w-6 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-500">Price</p>
                          <p className="font-medium">{formatPrice(service.price)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                {/* Requirements tab */}
                <TabsContent value="requirements" className="pt-6">
                  <div className="prose prose-gray max-w-none">
                    <h2 className="text-xl font-semibold mb-4">Service Requirements</h2>
                    <p className="text-gray-700 mb-6">
                      To provide this service efficiently, we require the following information and resources:
                    </p>
                    
                    <ul className="space-y-3 mb-6">
                      {service.requirements.map((requirement, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Info className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{requirement}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <Alert className="mt-6">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Important Note</AlertTitle>
                      <AlertDescription>
                        Providing these requirements promptly will help us deliver the service more efficiently and avoid delays.
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>
                
                {/* Documents tab */}
                <TabsContent value="documents" className="pt-6">
                  <div className="prose prose-gray max-w-none">
                    <h2 className="text-xl font-semibold mb-4">Required Documents</h2>
                    <p className="text-gray-700 mb-6">
                      The following documents will be required for this service. You can upload these after placing an order.
                    </p>
                    
                    {requiredDocuments.length > 0 ? (
                      <div className="space-y-4">
                        {requiredDocuments.map((doc, index) => (
                          <Card key={index}>
                            <CardHeader className="py-4">
                              <CardTitle className="text-base flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-500" />
                                {doc.name}
                                {doc.required && (
                                  <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                                )}
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="py-2">
                              <p className="text-sm text-gray-600">{doc.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 italic">No specific documents required for this service.</p>
                    )}
                    
                    <Alert className="mt-6">
                      <Info className="h-4 w-4" />
                      <AlertTitle>Document Instructions</AlertTitle>
                      <AlertDescription>
                        All documents should be clear, legible, and in PDF, JPG, or PNG format. Maximum file size is 5MB per document.
                      </AlertDescription>
                    </Alert>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {/* Order card */}
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Service Summary</CardTitle>
                  <CardDescription>Review and purchase this service</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">{formatPrice(service.price)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Duration:</span>
                    <span>{service.estimatedDuration}</span>
                  </div>
                  
                  <Separator className="my-2" />
                  
                  <div className="text-sm">
                    <p className="mb-2 font-medium">This service includes:</p>
                    <ul className="space-y-2">
                      {service.features.slice(0, 4).map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-600">{feature}</span>
                        </li>
                      ))}
                      {service.features.length > 4 && (
                        <li className="text-blue-600 text-sm font-medium">
                          + {service.features.length - 4} more features
                        </li>
                      )}
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3">
                  <Button 
                    className="w-full"
                    size="lg"
                    onClick={() => handleOrderService(service.id)}
                  >
                    <div className="flex items-center">
                      Order Service
                    </div>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href="/client/support">
                      Request Consultation
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
        
        {/* Related services */}
        {relatedServices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-2xl font-bold mb-6">Related Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((relatedService) => (
                <Card key={relatedService.id} className="hover:shadow-md transition-shadow duration-300">
                  <div className="relative h-40 w-full overflow-hidden">
                    {relatedService.image ? (
                      <Image
                        src={relatedService.image}
                        alt={relatedService.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="h-40 bg-gray-200" />
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-black/70 text-white">
                        {formatPrice(relatedService.price)}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-1">{relatedService.name}</CardTitle>
                    <CardDescription className="line-clamp-2">{relatedService.shortDescription}</CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between border-t pt-4">
                    <Button 
                      variant="outline" 
                      asChild
                    >
                      <Link href={`/client/services/${relatedService.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button
                      onClick={() => handleOrderService(relatedService.id)}
                    >
                      Order Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
} 