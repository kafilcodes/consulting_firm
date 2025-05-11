'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { 
  getServices, 
  getServiceCategories,
  deleteService,
  createService,
  uploadServiceImage
} from '@/lib/firebase/services';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';
import { 
  Search, 
  Plus, 
  PenLine, 
  Trash2, 
  MoreHorizontal, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Package,
  ArrowLeft,
  Edit,
  Eye,
  Trash,
  X,
  Upload
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  features: string[];
  deliverables: string[];
  isActive: boolean;
  image?: string;
}

const serviceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters'),
  description: z.string().min(30, 'Description must be at least 30 characters'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(1, 'Price must be greater than 0'),
  features: z.array(z.string()),
  deliverables: z.array(z.string()),
  isActive: z.boolean().default(true),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

export default function AdminServicesPage() {
  const router = useRouter();
  const { user, userRole, isLoading: authLoading } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Service; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc'
  });
  const [activeTab, setActiveTab] = useState('all');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      price: 0,
      features: [''],
      deliverables: [''],
      isActive: true,
    },
  });

  useEffect(() => {
    if (!authLoading && (!user || userRole !== 'admin')) {
      router.push('/auth/signin');
      return;
    }

    const fetchServices = async () => {
      try {
        setIsLoading(true);
        const data = await getServices();
        setServices(data);
        
        // Fetch categories
        const categoriesResponse = await getServiceCategories();
        setCategories(categoriesResponse.map(c => c.name));
      } catch (error) {
        console.error('Error fetching services:', error);
        toast.error('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    if (user && userRole === 'admin') {
      fetchServices();
    }
  }, [user, userRole, authLoading, router]);

  // Filter and sort services
  const filteredServices = services
    .filter(service => {
      // Category filter
      if (categoryFilter && service.category !== categoryFilter) {
        return false;
      }
      
      // Active/Inactive filter
      if (activeTab === 'active' && !service.isActive) {
        return false;
      }
      if (activeTab === 'inactive' && service.isActive) {
        return false;
      }
      
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          service.name.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower) ||
          service.category.toLowerCase().includes(searchLower)
        );
      }
      
      return true;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleSort = (key: keyof Service) => {
    if (sortConfig.key === key) {
      // Toggle direction if already sorting by this key
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      // Default to ascending for new sort key
      setSortConfig({
        key,
        direction: 'asc'
      });
    }
  };

  const handleDelete = (service: Service) => {
    setSelectedService(service);
    setConfirmationCode('');
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedService) return;
    
    try {
      // Check if confirmation code matches environment variable
      if (confirmationCode !== process.env.NEXT_PUBLIC_SKS_CODE) {
        toast.error('Invalid confirmation code');
        return;
      }
      
      await deleteService(selectedService.id);
      
      // Update local state
      setServices(prevServices => prevServices.filter(s => s.id !== selectedService.id));
      
      toast.success('Service deleted successfully');
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting service:', error);
      toast.error('Failed to delete service');
    }
  };

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

  const addArrayItem = (fieldName: 'features' | 'deliverables') => {
    const currentItems = form.getValues(fieldName);
    form.setValue(fieldName, [...currentItems, '']);
  };

  const removeArrayItem = (fieldName: 'features' | 'deliverables', index: number) => {
    const currentItems = form.getValues(fieldName);
    if (currentItems.length > 1) {
      const newItems = [...currentItems];
      newItems.splice(index, 1);
      form.setValue(fieldName, newItems);
    }
  };

  const onSubmit = async (data: ServiceFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Filter out empty array items
      const cleanedData = {
        ...data,
        features: data.features.filter(item => item.trim() !== ''),
        deliverables: data.deliverables.filter(item => item.trim() !== ''),
      };
      
      // Create the service
      const serviceId = await createService(cleanedData);
      
      // If there's an image, upload it and update the service
      if (imageFile) {
        await uploadServiceImage(imageFile, serviceId);
      }
      
      // Update local state
      const newService = {
        id: serviceId,
        ...cleanedData
      };
      
      setServices(prev => [...prev, newService as Service]);
      
      toast.success('Service created successfully');
      setIsCreateDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error creating service:', error);
      toast.error('Failed to create service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (service: Service) => {
    setSelectedService(service);
    
    // Set form values
    form.reset({
      name: service.name,
      description: service.description,
      category: service.category,
      price: service.price,
      features: service.features.length > 0 ? service.features : [''],
      deliverables: service.deliverables.length > 0 ? service.deliverables : [''],
      isActive: service.isActive,
    });
    
    // Set image preview if exists
    if (service.image) {
      setImagePreview(service.image);
    } else {
      setImagePreview(null);
    }
    
    setIsEditDialogOpen(true);
  };

  const handleUpdateService = async (data: ServiceFormValues) => {
    if (!selectedService) return;
    
    try {
      setIsSubmitting(true);
      
      // Filter out empty array items
      const cleanedData = {
        ...data,
        features: data.features.filter(item => item.trim() !== ''),
        deliverables: data.deliverables.filter(item => item.trim() !== ''),
      };
      
      // Update the service
      await updateService(selectedService.id, cleanedData);
      
      // If there's a new image, upload it and update the service
      if (imageFile) {
        const imageUrl = await uploadServiceImage(imageFile, selectedService.id);
        await updateService(selectedService.id, { image: imageUrl });
      }
      
      // Update local state
      setServices(prev => 
        prev.map(s => 
          s.id === selectedService.id 
            ? { ...s, ...cleanedData } 
            : s
        )
      );
      
      toast.success('Service updated successfully');
      setIsEditDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error('Error updating service:', error);
      toast.error('Failed to update service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    form.reset({
      name: '',
      description: '',
      category: '',
      price: 0,
      features: [''],
      deliverables: [''],
      isActive: true,
    });
    setImageFile(null);
    setImagePreview(null);
    setSelectedService(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-12 w-full" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-6 w-6" />
            Services Management
          </h1>
          <p className="text-muted-foreground">
            Manage the services offered by your consulting firm
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Service
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search services..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[120px]">
                <Filter className="h-4 w-4 mr-2" />
                Category
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setCategoryFilter(null)}
                className={!categoryFilter ? 'bg-accent text-accent-foreground' : ''}
              >
                All Categories
              </DropdownMenuItem>
              {categories.map(category => (
                <DropdownMenuItem 
                  key={category}
                  onClick={() => setCategoryFilter(category)}
                  className={categoryFilter === category ? 'bg-accent text-accent-foreground' : ''}
                >
                  {category}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[100px]">
                {sortConfig.direction === 'asc' ? 
                  <SortAsc className="h-4 w-4 mr-2" /> : 
                  <SortDesc className="h-4 w-4 mr-2" />
                }
                Sort
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleSort('name')}
                className={sortConfig.key === 'name' ? 'bg-accent text-accent-foreground' : ''}
              >
                Service Name
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSort('price')}
                className={sortConfig.key === 'price' ? 'bg-accent text-accent-foreground' : ''}
              >
                Price
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => handleSort('category')}
                className={sortConfig.key === 'category' ? 'bg-accent text-accent-foreground' : ''}
              >
                Category
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Services</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {filteredServices.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <Package className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No services found</h3>
            <p className="text-muted-foreground text-center max-w-sm">
              {searchTerm || categoryFilter ? 
                'No services match your search criteria. Try adjusting your filters.' : 
                'You haven\'t added any services yet. Add your first service to get started.'}
            </p>
            {!searchTerm && !categoryFilter && (
              <Button 
                className="mt-6" 
                onClick={() => router.push('/admin/services/new')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Service
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map(service => (
            <Card key={service.id} className={!service.isActive ? 'opacity-70' : ''}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleEdit(service)}>
                        <PenLine className="h-4 w-4 mr-2" />
                        Edit Service
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-500 focus:text-red-500" 
                        onClick={() => handleDelete(service)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Service
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex justify-between items-center">
                  <CardDescription>{service.category}</CardDescription>
                  <Badge variant={service.isActive ? 'default' : 'outline'}>
                    {service.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {service.description}
                </p>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium">Features:</p>
                    <ul className="text-sm list-disc list-inside">
                      {service.features?.slice(0, 3).map((feature, index) => (
                        <li key={index} className="text-muted-foreground truncate">
                          {feature}
                        </li>
                      ))}
                      {service.features?.length > 3 && (
                        <li className="text-muted-foreground">
                          +{service.features.length - 3} more
                        </li>
                      )}
                    </ul>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">{formatCurrency(service.price, 'INR')}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => router.push(`/admin/services/${service.id}`)}
                >
                  View Details
                </Button>
                <Button 
                  className="flex-1"
                  onClick={() => router.push(`/admin/services/${service.id}/edit`)}
                >
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the service
              and remove it from the database.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <p className="text-sm font-medium">Service to delete:</p>
              <p className="font-bold">{selectedService?.name}</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="confirmationCode" className="text-sm font-medium">
                Enter confirmation code to delete:
              </label>
              <Input
                id="confirmationCode"
                placeholder="Enter confirmation code"
                type="password"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Please enter the confirmation code to proceed with deletion.
                This helps prevent accidental service deletion.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Delete Service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Service Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Service</DialogTitle>
            <DialogDescription>
              Add a new service to your catalog. Fill out the form below with the service details.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tax Filing Service" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the service in detail..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Service Image</FormLabel>
                <div className="mt-2 flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Service preview" 
                        className="h-32 w-32 object-cover rounded-md" 
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Upload image</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Features</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('features')}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Feature
                  </Button>
                </div>
                {form.watch('features').map((_, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`features.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`Feature ${index + 1}`} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {form.watch('features').length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('features', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Deliverables</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('deliverables')}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Deliverable
                  </Button>
                </div>
                {form.watch('deliverables').map((_, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`deliverables.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`Deliverable ${index + 1}`} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {form.watch('deliverables').length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('deliverables', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Active Service</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating...' : 'Create Service'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Service Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the service details. Make your changes below.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdateService)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Tax Filing Service" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the service in detail..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (₹)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <FormLabel>Service Image</FormLabel>
                <div className="mt-2 flex items-center gap-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Service preview" 
                        className="h-32 w-32 object-cover rounded-md" 
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center h-32 w-32 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-xs text-gray-500">Upload image</p>
                      </div>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Features</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('features')}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Feature
                  </Button>
                </div>
                {form.watch('features').map((_, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`features.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`Feature ${index + 1}`} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {form.watch('features').length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('features', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <FormLabel>Deliverables</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => addArrayItem('deliverables')}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Deliverable
                  </Button>
                </div>
                {form.watch('deliverables').map((_, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <FormField
                      control={form.control}
                      name={`deliverables.${index}`}
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input placeholder={`Deliverable ${index + 1}`} {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    {form.watch('deliverables').length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeArrayItem('deliverables', index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Active Service</FormLabel>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Updating...' : 'Update Service'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 