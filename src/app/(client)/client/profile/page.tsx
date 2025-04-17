'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUserProfile } from '@/lib/firebase/auth';
import { toast } from 'sonner';
import Link from 'next/link';
import { User, Phone, MapPin, Building, Loader2, CheckCircle, X, AlertTriangle, ChevronRight, Trash2, Save, Edit } from 'lucide-react';
import { ChangePassword } from '@/components/auth/change-password';
import { ProfileImageUpload } from '@/components/profile/profile-image-upload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';

// More comprehensive profile schema with proper validations
const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  company: z.string().max(100, 'Company name is too long').optional().or(z.literal('')),
  address: z.object({
    street: z.string().max(100, 'Street address is too long').optional().or(z.literal('')),
    city: z.string().max(50, 'City name is too long').optional().or(z.literal('')),
    state: z.string().max(50, 'State name is too long').optional().or(z.literal('')),
    postalCode: z.string().max(20, 'Postal code is too long').optional().or(z.literal('')),
    country: z.string().max(50, 'Country name is too long').optional().or(z.literal('')),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface NotificationSettings {
  emailUpdates: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
  serviceAnnouncements: boolean;
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailUpdates: true,
    orderUpdates: true,
    marketingEmails: false,
    serviceAnnouncements: true
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user?.displayName || '',
      phoneNumber: user?.phoneNumber || '',
      company: user?.company || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        postalCode: user?.address?.postalCode || '',
        country: user?.address?.country || '',
      },
    },
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        company: user.company || '',
        address: {
          street: user?.address?.street || '',
          city: user?.address?.city || '',
          state: user?.address?.state || '',
          postalCode: user?.address?.postalCode || '',
          country: user?.address?.country || '',
        },
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    if (!user?.uid) {
      setUpdateError('User not authenticated. Please sign in again.');
      toast.error('Authentication error. Please sign in again.');
      return;
    }

    setIsLoading(true);
    setUpdateSuccess(false);
    setUpdateError(null);

    try {
      // Update user profile in Firebase and Redux store
      await updateUserProfile(user.uid, {
        displayName: data.displayName,
        phoneNumber: data.phoneNumber || null,
        company: data.company || null,
        address: {
          street: data.address.street || null,
          city: data.address.city || null,
          state: data.address.state || null,
          postalCode: data.address.postalCode || null,
          country: data.address.country || null,
        },
      });

      // Show success message and update UI
      setUpdateSuccess(true);
      toast.success('Profile updated successfully');
      
      // Reset form's dirty state
      reset(data);
      
      // Automatically clear success message after 3 seconds
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Profile update error:', error);
      setUpdateError('Failed to update profile. Please try again.');
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof NotificationSettings, value: boolean) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // In a real implementation, you would update these settings in your database
    toast.success(`${key} notification setting updated`);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>
            You need to be signed in to view this page. Please sign in and try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
              <p className="text-sm text-gray-600">
                Manage your personal information and account preferences
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-6 pt-4">
              {/* Profile Image Upload */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Profile Picture</CardTitle>
                  <CardDescription>
                    Update your profile picture. It will be visible to our team and on your documents.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfileImageUpload />
                </CardContent>
              </Card>
              
              {/* Basic Information Form */}
              <form id="personal-info-form" onSubmit={handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                    <CardDescription>
                      This information will be displayed on your profile and documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Success message */}
                    {updateSuccess && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>
                          Your profile has been updated successfully.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Error message */}
                    {updateError && (
                      <Alert variant="destructive">
                        <X className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{updateError}</AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-sm font-medium text-gray-700">
                          Full Name
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <User className="h-5 w-5 text-gray-400" />
                          </span>
                          <Input
                            id="displayName"
                            {...register('displayName')}
                            className={`pl-10 ${errors.displayName ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          />
                        </div>
                        {errors.displayName && (
                          <p className="text-sm text-red-600 mt-1">{errors.displayName.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">
                          Phone Number
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </span>
                          <Input
                            id="phoneNumber"
                            type="tel"
                            placeholder="+91 98765 43210"
                            {...register('phoneNumber')}
                            className={`pl-10 ${errors.phoneNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          />
                        </div>
                        {errors.phoneNumber && (
                          <p className="text-sm text-red-600 mt-1">{errors.phoneNumber.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="company" className="text-sm font-medium text-gray-700">
                          Company Name
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Building className="h-5 w-5 text-gray-400" />
                          </span>
                          <Input
                            id="company"
                            {...register('company')}
                            placeholder="Your organization name (optional)"
                            className="pl-10"
                          />
                        </div>
                        {errors.company && (
                          <p className="text-sm text-red-600 mt-1">{errors.company.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-4 border-t bg-gray-50 px-6 py-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isDirty || isLoading}
                      onClick={() => reset()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="personal-info-form"
                      disabled={!isDirty || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </TabsContent>

            {/* Address Tab */}
            <TabsContent value="address" className="space-y-6 pt-4">
              <form id="address-form" onSubmit={handleSubmit(onSubmit)}>
                <Card>
                  <CardHeader>
                    <CardTitle>Address Information</CardTitle>
                    <CardDescription>
                      Your address will be used for billing and shipping documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Success message */}
                    {updateSuccess && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertTitle>Success</AlertTitle>
                        <AlertDescription>
                          Your address has been updated successfully.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Error message */}
                    {updateError && (
                      <Alert variant="destructive">
                        <X className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{updateError}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="street" className="text-sm font-medium text-gray-700">
                          Street Address
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </span>
                          <Input
                            id="street"
                            {...register('address.street')}
                            className="pl-10"
                          />
                        </div>
                        {errors.address?.street && (
                          <p className="text-sm text-red-600 mt-1">{errors.address.street.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                          City
                        </Label>
                        <Input
                          id="city"
                          {...register('address.city')}
                        />
                        {errors.address?.city && (
                          <p className="text-sm text-red-600 mt-1">{errors.address.city.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                          State / Province
                        </Label>
                        <Input
                          id="state"
                          {...register('address.state')}
                        />
                        {errors.address?.state && (
                          <p className="text-sm text-red-600 mt-1">{errors.address.state.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700">
                          Postal Code
                        </Label>
                        <Input
                          id="postalCode"
                          {...register('address.postalCode')}
                        />
                        {errors.address?.postalCode && (
                          <p className="text-sm text-red-600 mt-1">{errors.address.postalCode.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-sm font-medium text-gray-700">
                          Country
                        </Label>
                        <Input
                          id="country"
                          {...register('address.country')}
                        />
                        {errors.address?.country && (
                          <p className="text-sm text-red-600 mt-1">{errors.address.country.message}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-4 border-t bg-gray-50 px-6 py-4">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isDirty || isLoading}
                      onClick={() => reset()}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      form="address-form"
                      disabled={!isDirty || isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Changes'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6 pt-4">
              <ChangePassword />
              
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>
                    Manage your account security settings and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Add an extra layer of security to your account
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      Coming Soon
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Login Activity</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        View your recent login activity
                      </p>
                    </div>
                    <Button variant="outline" size="sm" disabled>
                      View Activity
                    </Button>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-medium text-red-600">Delete Account</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Permanently delete your account and all your data
                      </p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>Manage how and when you receive notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Email Notifications</h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-updates">Account Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive emails about your account activity
                        </p>
                      </div>
                      <Switch
                        id="email-updates"
                        checked={notificationSettings.emailUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('emailUpdates', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="order-updates">Order Updates</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive notifications about your order status changes
                        </p>
                      </div>
                      <Switch
                        id="order-updates"
                        checked={notificationSettings.orderUpdates}
                        onCheckedChange={(checked) => handleNotificationChange('orderUpdates', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="marketing-emails">Marketing Emails</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive promotional offers and newsletters
                        </p>
                      </div>
                      <Switch
                        id="marketing-emails"
                        checked={notificationSettings.marketingEmails}
                        onCheckedChange={(checked) => handleNotificationChange('marketingEmails', checked)}
                      />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="service-announcements">Service Announcements</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive updates about new services and features
                        </p>
                      </div>
                      <Switch
                        id="service-announcements"
                        checked={notificationSettings.serviceAnnouncements}
                        onCheckedChange={(checked) => handleNotificationChange('serviceAnnouncements', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                  <Button 
                    onClick={() => toast.success('Notification preferences saved')} 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Preferences'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Billing Information</CardTitle>
                  <CardDescription>Manage your payment methods and view billing history</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
                    <div className="border rounded-md p-4">
                      <div className="text-center py-6">
                        <p className="text-muted-foreground">No payment methods added yet</p>
                        <Button className="mt-4">
                          Add Payment Method
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium">Billing History</h3>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/client/orders">View All Orders</Link>
                      </Button>
                    </div>
                    
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Invoice
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Amount
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {/* Empty state */}
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">
                              No billing history available
                            </td>
                          </tr>
                          
                          {/* Example row (hidden for now)
                          <tr className="hidden">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              INV-2023-001
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              Jan 15, 2023
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              $299.00
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Paid
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button variant="ghost" size="sm">
                                Download
                              </Button>
                            </td>
                          </tr>
                          */}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="billing-name">Name on Card</Label>
                        <Input
                          id="billing-name"
                          placeholder="Full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="billing-email">Email</Label>
                        <Input
                          id="billing-email"
                          type="email"
                          placeholder="Email for receipts"
                          defaultValue={user?.email || ''}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="billing-address">Address</Label>
                        <Input
                          id="billing-address"
                          placeholder="Street address"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="billing-city">City</Label>
                          <Input
                            id="billing-city"
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billing-state">State</Label>
                          <Input
                            id="billing-state"
                            placeholder="State"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="billing-zip">ZIP</Label>
                          <Input
                            id="billing-zip"
                            placeholder="ZIP Code"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-6">
                  <Button onClick={() => toast.success('Billing information saved')}>
                    Save Billing Information
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
} 