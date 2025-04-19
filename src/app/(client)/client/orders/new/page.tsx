'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { fetchServiceById } from '@/lib/services';
import { createOrder } from '@/lib/firebase/services';
import { createOrderId } from '@/lib/utils';
import { Check, ChevronRight, CreditCard, Calendar, Clock, CheckCircle, PackageCheck, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

// Order form schema
const orderSchema = z.object({
  requirements: z.string().min(10, "Please provide detailed requirements for your order"),
  additionalInfo: z.string().optional(),
  deliveryDate: z.string().optional(),
  urgency: z.enum(["standard", "express", "urgent"]),
  paymentMethod: z.enum(["credit_card", "upi", "bank_transfer"]),
  billingInfo: z.object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Valid email is required"),
    phone: z.string().min(10, "Valid phone number is required"),
    address: z.string().min(5, "Address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State is required"),
    postalCode: z.string().min(5, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
  }),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions" }),
  }),
});

type OrderFormData = z.infer<typeof orderSchema>;

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [service, setService] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  
  const serviceId = searchParams.get('serviceId');
  
  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      requirements: "",
      additionalInfo: "",
      urgency: "standard",
      paymentMethod: "credit_card",
      billingInfo: {
        name: user?.displayName || "",
        email: user?.email || "",
        phone: user?.phoneNumber || "",
        address: user?.address?.street || "",
        city: user?.address?.city || "",
        state: user?.address?.state || "",
        postalCode: user?.address?.postalCode || "",
        country: user?.address?.country || "",
      },
      agreeToTerms: false,
    },
  });

  // Calculate pricing
  const calculatePrice = () => {
    if (!service) return 0;
    
    let basePrice = service.price;
    
    // Urgency multiplier
    const urgencyRate = {
      standard: 1,
      express: 1.25,
      urgent: 1.5
    };
    
    const urgency = form.watch("urgency") as keyof typeof urgencyRate;
    
    return Math.round(basePrice * urgencyRate[urgency]);
  };
  
  // Format price to INR
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };
  
  // Time estimate based on urgency
  const getTimeEstimate = () => {
    if (!service) return "";
    
    const urgency = form.watch("urgency");
    
    if (!service.estimatedDelivery) return "To be determined";
    
    // Base estimate from service
    const baseEstimate = service.estimatedDelivery;
    
    // Adjust based on urgency
    switch (urgency) {
      case "express":
        return baseEstimate.replace(/\d+/g, (match) => Math.ceil(parseInt(match) * 0.7).toString());
      case "urgent":
        return baseEstimate.replace(/\d+/g, (match) => Math.ceil(parseInt(match) * 0.5).toString());
      default:
        return baseEstimate;
    }
  };
  
  // Fetch service details when the component mounts
  useEffect(() => {
    const getServiceDetails = async () => {
      if (!serviceId) {
        toast.error("No service selected");
        router.push("/client/services");
        return;
      }
      
      try {
        const serviceData = await fetchServiceById(serviceId);
        
        if (!serviceData) {
          toast.error("Service not found");
          router.push("/client/services");
          return;
        }
        
        setService(serviceData);
      } catch (error) {
        console.error("Error fetching service:", error);
        toast.error("Failed to load service details");
      } finally {
        setIsLoading(false);
      }
    };
    
    getServiceDetails();
  }, [serviceId, router]);
  
  // Submit handler
  const onSubmit = async (data: OrderFormData) => {
    if (!user || !service) {
      toast.error("Unable to create order. Please try again.");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the calculated price
      const finalPrice = calculatePrice();
      
      // Create an order ID
      const generatedOrderId = createOrderId();
      setOrderNumber(generatedOrderId);
      
      // Create the order in Firestore
      await createOrder({
        clientId: user.uid,
        serviceId: service.id,
        status: 'pending',
        amount: finalPrice,
        currency: 'INR',
        paymentStatus: 'pending',
        requirements: data.requirements,
        additionalInfo: data.additionalInfo || null,
        deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : null,
        urgency: data.urgency,
        documents: [],
        timeline: [
          {
            id: crypto.randomUUID(),
            status: 'pending',
            message: 'Order placed successfully',
            timestamp: new Date(),
            updatedBy: user.uid,
          },
        ],
      });
      
      // Move to confirmation step
      setActiveStep(5);
      toast.success("Order created successfully!");
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Navigate to next/previous step
  const nextStep = () => {
    if (activeStep < 5) {
      // Validate the current step before proceeding
      switch (activeStep) {
        case 1: // Service selection - always valid if we have a service
          if (!service) {
            toast.error("Please select a service");
            return;
          }
          break;
        
        case 2: // Requirements
          const isRequirementsValid = form.trigger(["requirements", "additionalInfo"]);
          if (!isRequirementsValid) {
            toast.error("Please complete all required fields");
            return;
          }
          break;
        
        case 3: // Delivery options
          const isDeliveryValid = form.trigger(["urgency"]);
          if (!isDeliveryValid) {
            toast.error("Please select delivery urgency");
            return;
          }
          break;
        
        case 4: // Payment and billing
          const isBillingValid = form.trigger([
            "paymentMethod", 
            "billingInfo.name", 
            "billingInfo.email", 
            "billingInfo.phone", 
            "billingInfo.address", 
            "billingInfo.city", 
            "billingInfo.state", 
            "billingInfo.postalCode", 
            "billingInfo.country",
            "agreeToTerms"
          ]);
          if (!isBillingValid) {
            toast.error("Please complete all required fields");
            return;
          }
          
          // Submit the form when moving from step 4 to confirmation
          form.handleSubmit(onSubmit)();
          return;
      }
      
      setActiveStep(activeStep + 1);
    }
  };
  
  const prevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Loading service details...</p>
      </div>
    );
  }
  
  if (!service) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Service Not Found</h2>
        <p className="text-gray-600 mb-6">The service you're looking for could not be found.</p>
        <Button onClick={() => router.push('/client/services')}>
          Browse Services
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Service</h1>
        <p className="text-gray-600">Complete the form below to place your order</p>
      </div>
      
      {/* Progress steps */}
      <div className="mb-8">
        <div className="flex justify-between">
          {['Service', 'Requirements', 'Delivery', 'Payment', 'Confirmation'].map((step, index) => (
            <div 
              key={step} 
              className={`flex flex-col items-center w-1/5 ${index + 1 < activeStep ? 'text-blue-600' : index + 1 === activeStep ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div 
                className={`w-8 h-8 flex items-center justify-center rounded-full mb-2 
                  ${index + 1 < activeStep ? 'bg-blue-600 text-white' : 
                    index + 1 === activeStep ? 'border-2 border-blue-600 text-blue-600' : 
                    'border-2 border-gray-300 text-gray-400'}`}
              >
                {index + 1 < activeStep ? <Check className="w-5 h-5" /> : index + 1}
              </div>
              <span className="text-sm text-center">{step}</span>
            </div>
          ))}
        </div>
        <div className="relative mt-2">
          <div className="absolute left-0 right-0 h-1 bg-gray-200 top-0"></div>
          <div 
            className="absolute left-0 h-1 bg-blue-600 top-0 transition-all duration-300" 
            style={{ width: `${(activeStep - 1) * 25}%` }}
          ></div>
        </div>
      </div>
      
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Service Selection */}
        {activeStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Service Selection</CardTitle>
              <CardDescription>Review the service details and confirm your selection</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {service.imageUrl && (
                  <div className="md:w-1/3">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img 
                        src={service.imageUrl} 
                        alt={service.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  </div>
                )}
                
                <div className={service.imageUrl ? "md:w-2/3" : "w-full"}>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">{service.name}</h2>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">{service.categoryId}</Badge>
                    {service.popular && <Badge variant="secondary">Popular</Badge>}
                  </div>
                  
                  <p className="text-gray-700 mb-4">{service.description}</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-semibold text-gray-900">{formatPrice(service.price)}</span>
                    </div>
                    
                    {service.estimatedDelivery && (
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-gray-600">Estimated Delivery:</span>
                        <span className="text-gray-900">{service.estimatedDelivery}</span>
                      </div>
                    )}
                  </div>
                  
                  {service.features && service.features.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Included Features:</h3>
                      <ul className="space-y-2">
                        {service.features.map((feature: any) => (
                          <li key={feature.id} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-green-500 mt-1" />
                            <span className="text-gray-700">{feature.name}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                variant="outline"
                onClick={() => router.push('/client/services')}
              >
                Change Service
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Step 2: Requirements */}
        {activeStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Project Requirements</CardTitle>
              <CardDescription>
                Provide detailed information about your requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="requirements">Project Requirements <span className="text-red-500">*</span></Label>
                <Textarea
                  id="requirements"
                  placeholder="Please describe your requirements in detail..."
                  className="min-h-32"
                  {...form.register("requirements")}
                />
                {form.formState.errors.requirements && (
                  <p className="text-sm text-red-500">{form.formState.errors.requirements.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  placeholder="Any additional details or context that might help us serve you better..."
                  className="min-h-20"
                  {...form.register("additionalInfo")}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Preferred Completion Date (Optional)</Label>
                <Input
                  id="deliveryDate"
                  type="date"
                  {...form.register("deliveryDate")}
                  min={new Date().toISOString().split('T')[0]}
                />
                <p className="text-xs text-gray-500">
                  If you have a specific deadline, please indicate it here.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                variant="outline"
                onClick={prevStep}
              >
                Back
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Step 3: Delivery Options */}
        {activeStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Delivery Options</CardTitle>
              <CardDescription>
                Choose your preferred delivery timeline
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <RadioGroup
                defaultValue={form.watch("urgency")}
                onValueChange={(value) => form.setValue("urgency", value as "standard" | "express" | "urgent")}
                className="space-y-4"
              >
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="standard" id="standard" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="standard" className="text-base font-medium">
                      Standard Delivery
                      <Badge className="ml-2 bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {formatPrice(service.price)}
                      </Badge>
                    </Label>
                    <div className="text-sm text-gray-500 grid gap-1">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" /> 
                        Estimated: {service.estimatedDelivery || "To be determined"}
                      </div>
                      <p>Regular processing time with no additional rush fees.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="express" id="express" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="express" className="text-base font-medium">
                      Express Delivery
                      <Badge className="ml-2 bg-amber-100 text-amber-800 hover:bg-amber-100">
                        {formatPrice(service.price * 1.25)}
                      </Badge>
                    </Label>
                    <div className="text-sm text-gray-500 grid gap-1">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" /> 
                        Estimated: {service.estimatedDelivery ? 
                          service.estimatedDelivery.replace(/\d+/g, (match) => 
                            Math.ceil(parseInt(match) * 0.7).toString()) 
                          : "To be determined"}
                      </div>
                      <p>Faster processing with priority handling. 25% additional fee applies.</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-2">
                  <RadioGroupItem value="urgent" id="urgent" className="mt-1" />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="urgent" className="text-base font-medium">
                      Urgent Delivery
                      <Badge className="ml-2 bg-red-100 text-red-800 hover:bg-red-100">
                        {formatPrice(service.price * 1.5)}
                      </Badge>
                    </Label>
                    <div className="text-sm text-gray-500 grid gap-1">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" /> 
                        Estimated: {service.estimatedDelivery ? 
                          service.estimatedDelivery.replace(/\d+/g, (match) => 
                            Math.ceil(parseInt(match) * 0.5).toString()) 
                          : "To be determined"}
                      </div>
                      <p>Highest priority with expedited processing. 50% additional fee applies.</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                variant="outline"
                onClick={prevStep}
              >
                Back
              </Button>
              <Button onClick={nextStep}>
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Step 4: Payment & Billing */}
        {activeStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Payment & Billing</CardTitle>
              <CardDescription>
                Provide payment and billing information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                {/* Order Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Service:</span>
                      <span className="text-gray-900">{service.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery:</span>
                      <span className="text-gray-900 capitalize">{form.watch("urgency")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Timeline:</span>
                      <span className="text-gray-900">{getTimeEstimate()}</span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between font-semibold">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-blue-600">{formatPrice(calculatePrice())}</span>
                    </div>
                  </div>
                </div>
                
                {/* Payment Method */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                  
                  <RadioGroup
                    defaultValue={form.watch("paymentMethod")}
                    onValueChange={(value) => form.setValue("paymentMethod", value as "credit_card" | "upi" | "bank_transfer")}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex items-center">
                        <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                        Credit/Debit Card
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="upi" id="upi" />
                      <Label htmlFor="upi">UPI</Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer">Bank Transfer</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Billing Information */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="billingName">Full Name <span className="text-red-500">*</span></Label>
                      <Input
                        id="billingName"
                        {...form.register("billingInfo.name")}
                      />
                      {form.formState.errors.billingInfo?.name && (
                        <p className="text-sm text-red-500">{form.formState.errors.billingInfo.name.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billingEmail">Email <span className="text-red-500">*</span></Label>
                      <Input
                        id="billingEmail"
                        type="email"
                        {...form.register("billingInfo.email")}
                      />
                      {form.formState.errors.billingInfo?.email && (
                        <p className="text-sm text-red-500">{form.formState.errors.billingInfo.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billingPhone">Phone <span className="text-red-500">*</span></Label>
                      <Input
                        id="billingPhone"
                        type="tel"
                        {...form.register("billingInfo.phone")}
                      />
                      {form.formState.errors.billingInfo?.phone && (
                        <p className="text-sm text-red-500">{form.formState.errors.billingInfo.phone.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="billingAddress">Address <span className="text-red-500">*</span></Label>
                      <Input
                        id="billingAddress"
                        {...form.register("billingInfo.address")}
                      />
                      {form.formState.errors.billingInfo?.address && (
                        <p className="text-sm text-red-500">{form.formState.errors.billingInfo.address.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billingCity">City <span className="text-red-500">*</span></Label>
                      <Input
                        id="billingCity"
                        {...form.register("billingInfo.city")}
                      />
                      {form.formState.errors.billingInfo?.city && (
                        <p className="text-sm text-red-500">{form.formState.errors.billingInfo.city.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billingState">State <span className="text-red-500">*</span></Label>
                      <Input
                        id="billingState"
                        {...form.register("billingInfo.state")}
                      />
                      {form.formState.errors.billingInfo?.state && (
                        <p className="text-sm text-red-500">{form.formState.errors.billingInfo.state.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billingPostalCode">Postal Code <span className="text-red-500">*</span></Label>
                      <Input
                        id="billingPostalCode"
                        {...form.register("billingInfo.postalCode")}
                      />
                      {form.formState.errors.billingInfo?.postalCode && (
                        <p className="text-sm text-red-500">{form.formState.errors.billingInfo.postalCode.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="billingCountry">Country <span className="text-red-500">*</span></Label>
                      <Input
                        id="billingCountry"
                        {...form.register("billingInfo.country")}
                      />
                      {form.formState.errors.billingInfo?.country && (
                        <p className="text-sm text-red-500">{form.formState.errors.billingInfo.country.message}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="agreeToTerms"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                    {...form.register("agreeToTerms")}
                  />
                  <div>
                    <Label htmlFor="agreeToTerms" className="text-sm">
                      I agree to the <a href="#" className="text-blue-600 hover:underline">Terms and Conditions</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                    </Label>
                    {form.formState.errors.agreeToTerms && (
                      <p className="text-sm text-red-500">{form.formState.errors.agreeToTerms.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              <Button 
                variant="outline"
                onClick={prevStep}
                disabled={isSubmitting}
              >
                Back
              </Button>
              <Button 
                onClick={nextStep}
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Place Order
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        )}
        
        {/* Step 5: Confirmation */}
        {activeStep === 5 && (
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
              <CardTitle className="text-2xl">Order Placed Successfully!</CardTitle>
              <CardDescription>
                Thank you for your order. We've received your request and will begin processing it shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <p className="text-gray-600 mb-2">Your Order Number</p>
                <p className="text-2xl font-bold text-gray-900">{orderNumber}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Please save this number for future reference
                </p>
              </div>
              
              <div className="border rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="text-gray-900">{service.name}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount:</span>
                    <span className="text-gray-900 font-semibold">{formatPrice(calculatePrice())}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Option:</span>
                    <span className="text-gray-900 capitalize">{form.watch("urgency")}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method:</span>
                    <span className="text-gray-900">
                      {form.watch("paymentMethod") === "credit_card" 
                        ? "Credit/Debit Card" 
                        : form.watch("paymentMethod") === "upi" 
                          ? "UPI" 
                          : "Bank Transfer"}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status:</span>
                    <Badge variant="outline" className="text-amber-600 bg-amber-50">Pending</Badge>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-gray-600">
                  <PackageCheck className="inline-block mr-2 h-5 w-5 text-gray-500" />
                  You will receive an email confirmation shortly with order details.
                </p>
                <p className="text-gray-600">
                  <Calendar className="inline-block mr-2 h-5 w-5 text-gray-500" />
                  You can track your order status from your dashboard.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4 justify-center border-t pt-6">
              <Button 
                variant="outline"
                onClick={() => router.push('/client/orders')}
                className="w-full sm:w-auto"
              >
                View All Orders
              </Button>
              <Button 
                onClick={() => router.push('/client/dashboard')}
                className="w-full sm:w-auto"
              >
                Return to Dashboard
              </Button>
            </CardFooter>
          </Card>
        )}
      </form>
    </div>
  );
} 