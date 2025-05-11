'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { getService, updateService, uploadServiceImage } from '@/lib/firebase/services';
import { Service } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Plus, Upload, X } from 'lucide-react';

// Form validation schema
const serviceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters'),
  shortDescription: z.string().min(10, 'Short description must be at least 10 characters'),
  description: z.string().min(30, 'Description must be at least 30 characters'),
  category: z.enum(['ca-services', 'audit', 'registration', 'tax', 'consulting']),
  serviceType: z.enum(['plan', 'one-time']),
  price: z.object({
    amount: z.number().min(1, 'Price must be greater than 0'),
    currency: z.string().default('INR'),
    billingType: z.enum(['one-time', 'monthly', 'yearly']),
  }),
  features: z.array(z.string()),
  requirements: z.array(z.string()),
  deliverables: z.array(z.string()),
  estimatedDuration: z.string().min(2, 'Estimated duration is required'),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function EditServicePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceData, setServiceData] = useState<Service | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      shortDescription: '',
      description: '',
      category: 'ca-services',
      serviceType: 'one-time',
      price: {
        amount: 0,
        currency: 'INR',
        billingType: 'one-time',
      },
      features: [''],
      requirements: [''],
      deliverables: [''],
      estimatedDuration: '',
    },
  });

  // Fetch service data
  useEffect(() => {
    if (!user || userRole !== 'admin') {
      router.push('/auth/signin');
      return;
    }

    const fetchService = async () => {
      try {
        setIsLoading(true);
        const data = await getService(params.id);
        
        if (!data) {
          toast.error('Service not found');
          router.push('/admin/services');
          return;
        }
        
        setServiceData(data);
        
        // Set form values
        form.reset({
          name: data.name,
          shortDescription: data.shortDescription || '',
          description: data.description,
          category: data.category,
          serviceType: data.serviceType,
          price: {
            amount: data.price.amount,
            currency: data.price.currency || 'INR',
            billingType: data.price.billingType,
          },
          features: data.features.length > 0 ? data.features : [''],
          requirements: data.requirements.length > 0 ? data.requirements : [''],
          deliverables: data.deliverables.length > 0 ? data.deliverables : [''],
          estimatedDuration: data.estimatedDuration,
        });
        
        // Set image preview if exists
        if (data.image) {
          setImagePreview(data.image);
        }
      } catch (error) {
        console.error('Error fetching service:', error);
        toast.error('Failed to load service details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [params.id, user, userRole, router, form]);

  // Add and remove array items
  const addArrayItem = (fieldName: 'features' | 'requirements' | 'deliverables') => {
    const currentItems = form.getValues(fieldName);
    form.setValue(fieldName, [...currentItems, '']);
  };

  const removeArrayItem = (fieldName: 'features' | 'requirements' | 'deliverables', index: number) => {
    const currentItems = form.getValues(fieldName);
    if (currentItems.length > 1) {
      const newItems = [...currentItems];
      newItems.splice(index, 1);
      form.setValue(fieldName, newItems);
    }
  };

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  // Form submission
  const onSubmit = async (data: ServiceFormValues) => {
    if (!serviceData) return;
    
    try {
      setIsSubmitting(true);
      
      // Filter out empty array items
      const cleanedData = {
        ...data,
        features: data.features.filter(item => item.trim() !== ''),
        requirements: data.requirements.filter(item => item.trim() !== ''),
        deliverables: data.deliverables.filter(item => item.trim() !== ''),
      };
      
      // Update the service
      let updateData: Partial<Service> = cleanedData;
      
      // If image is removed, set image to null
      if (serviceData.image && !imagePreview) {
        updateData.image = null;
      }
      
      await updateService(params.id, updateData);
      
      // If there's a new image, upload it and update the service
      if (imageFile) {
        const imageUrl = await uploadServiceImage(imageFile, params.id);
        await updateService(params.id, { image: imageUrl });
      }
      
      toast.success('Service updated successfully');
      router.push('/admin/services');
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Skeleton className="h-8 w-64" />
        </div>
        
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/services')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Service</h1>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Update the basic details of this service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter service name" {...field} />
                    </FormControl>
                    <FormDescription>
                      The full name of the service as it will appear to clients
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shortDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief overview of the service" {...field} />
                    </FormControl>
                    <FormDescription>
                      A concise description (1-2 sentences) for service listings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Detailed description of the service" 
                        className="min-h-32"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      A comprehensive description explaining what the service includes
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ca-services">CA Services</SelectItem>
                          <SelectItem value="audit">Audit</SelectItem>
                          <SelectItem value="registration">Registration</SelectItem>
                          <SelectItem value="tax">Tax</SelectItem>
                          <SelectItem value="consulting">Consulting</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        The category the service belongs to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="one-time">One-time Service</SelectItem>
                          <SelectItem value="plan">Subscription Plan</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Whether this is a one-time service or subscription plan
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="estimatedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Duration</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 2-3 weeks, 1-2 months" {...field} />
                    </FormControl>
                    <FormDescription>
                      Approximate time required to complete the service
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Service Image (Optional)</FormLabel>
                <div className="mt-2">
                  {imagePreview ? (
                    <div className="relative w-full max-w-sm">
                      <img 
                        src={imagePreview} 
                        alt="Service preview" 
                        className="w-full h-auto rounded-md object-cover"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        type="button"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-md p-8 max-w-sm">
                      <label className="flex flex-col items-center gap-2 cursor-pointer">
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm font-medium">Upload Image</span>
                        <span className="text-xs text-muted-foreground">
                          PNG, JPG or WEBP, max 2MB
                        </span>
                        <Input
                          type="file"
                          accept="image/png, image/jpeg, image/webp"
                          className="hidden"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing Information</CardTitle>
              <CardDescription>
                Update the price and billing details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="price.amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price Amount</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field}
                          value={field.value}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        The price in INR
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price.billingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Billing Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select billing type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="one-time">One-time</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How the service is billed
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features & Requirements</CardTitle>
              <CardDescription>
                Update what the service includes and what's required
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <FormLabel>Features</FormLabel>
                <FormDescription className="mb-2">
                  List the key features and benefits of this service
                </FormDescription>
                
                {form.watch('features').map((_, index) => (
                  <div key={`feature-${index}`} className="flex items-start gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`features.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Enter a feature" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('features', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => addArrayItem('features')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>

              <Separator />

              <div>
                <FormLabel>Requirements</FormLabel>
                <FormDescription className="mb-2">
                  List what clients need to provide for this service
                </FormDescription>
                
                {form.watch('requirements').map((_, index) => (
                  <div key={`requirement-${index}`} className="flex items-start gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`requirements.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Enter a requirement" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('requirements', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => addArrayItem('requirements')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Requirement
                </Button>
              </div>

              <Separator />

              <div>
                <FormLabel>Deliverables</FormLabel>
                <FormDescription className="mb-2">
                  List what clients will receive upon completion
                </FormDescription>
                
                {form.watch('deliverables').map((_, index) => (
                  <div key={`deliverable-${index}`} className="flex items-start gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`deliverables.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder="Enter a deliverable" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeArrayItem('deliverables', index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  type="button"
                  variant="outline"
                  className="mt-2"
                  onClick={() => addArrayItem('deliverables')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deliverable
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/services')}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
} 