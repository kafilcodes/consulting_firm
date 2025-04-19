'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { updateUserProfile, updateCurrentUser } from '@/store/slices/authSlice';
import { toast } from 'sonner';
import Link from 'next/link';
import { User, Phone, MapPin, Building, Loader2, CheckCircle, X, AlertTriangle, ChevronRight } from 'lucide-react';
import { ChangePassword } from '@/components/auth/change-password';
import { ProfileImageUpload } from '@/components/profile/profile-image-upload';
import { DocumentUpload } from '@/components/profile/document-upload';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

// More comprehensive profile schema with proper validations
const profileSchema = z.object({
  displayName: z.string().min(2, 'Name must be at least 2 characters').max(50, 'Name is too long'),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number')
    .optional()
    .or(z.literal('')),
  company: z.string().max(100, 'Company name is too long').optional().or(z.literal('')),
  gstin: z.string()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, 'Please enter a valid GSTIN')
    .optional()
    .or(z.literal('')),
  panNumber: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number')
    .optional()
    .or(z.literal('')),
  aadharNumber: z.string()
    .regex(/^[0-9]{12}$/, 'Please enter a valid 12-digit Aadhar number')
    .optional()
    .or(z.literal('')),
  address: z.object({
    street: z.string().max(100, 'Street address is too long').optional().or(z.literal('')),
    city: z.string().max(50, 'City name is too long').optional().or(z.literal('')),
    state: z.string().max(50, 'State name is too long').optional().or(z.literal('')),
    postalCode: z.string().max(20, 'Postal code is too long').optional().or(z.literal('')),
    country: z.string().max(50, 'Country name is too long').optional().or(z.literal('')),
  }),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface NotificationPreference {
  emailUpdates: boolean;
  orderUpdates: boolean;
  marketingEmails: boolean;
  serviceAnnouncements: boolean;
}

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference>({
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
      gstin: user?.gstin || '',
      panNumber: user?.panNumber || '',
      aadharNumber: user?.aadharNumber || '',
      address: {
        street: user?.address?.street || '',
        city: user?.address?.city || '',
        state: user?.address?.state || '',
        postalCode: user?.address?.postalCode || '',
        country: user?.address?.country || '',
      },
    },
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/signin');
    }
  }, [user, authLoading, router]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        displayName: user.displayName || '',
        phoneNumber: user.phoneNumber || '',
        company: user.company || '',
        gstin: user.gstin || '',
        panNumber: user.panNumber || '',
        aadharNumber: user.aadharNumber || '',
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
      // Update user profile using the auth slice action
      await dispatch(updateUserProfile({
        uid: user.uid,
        displayName: data.displayName,
        phoneNumber: data.phoneNumber || null,
        company: data.company || null,
        gstin: data.gstin || null,
        panNumber: data.panNumber || null,
        aadharNumber: data.aadharNumber || null,
        address: {
          street: data.address.street || null,
          city: data.address.city || null,
          state: data.address.state || null,
          postalCode: data.address.postalCode || null,
          country: data.address.country || null,
        },
      })).unwrap();

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

  const handleNotificationToggle = (key: keyof NotificationPreference) => {
    setNotificationPreferences(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      
      // In a real app, save these preferences to Firebase
      console.log('Updating notification preferences:', updated);
      
      toast.success(`${key} notifications ${updated[key] ? 'enabled' : 'disabled'}`);
      return updated;
    });
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

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

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
        <div className="mt-4">
          <Button asChild>
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="address">Address</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
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

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="gstin" className="text-sm font-medium text-gray-700">
                          GSTIN
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            {/* GSTIN icon placeholder */}
                          </span>
                          <Input
                            id="gstin"
                            {...register('gstin')}
                            className={`pl-10 ${errors.gstin ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          />
                        </div>
                        {errors.gstin && (
                          <p className="text-sm text-red-600 mt-1">{errors.gstin.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="panNumber" className="text-sm font-medium text-gray-700">
                          PAN Number
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            {/* PAN icon placeholder */}
                          </span>
                          <Input
                            id="panNumber"
                            {...register('panNumber')}
                            className={`pl-10 ${errors.panNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          />
                        </div>
                        {errors.panNumber && (
                          <p className="text-sm text-red-600 mt-1">{errors.panNumber.message}</p>
                        )}
                      </div>

                      <div className="space-y-2 sm:col-span-2">
                        <Label htmlFor="aadharNumber" className="text-sm font-medium text-gray-700">
                          Aadhar Number
                        </Label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            {/* Aadhar icon placeholder */}
                          </span>
                          <Input
                            id="aadharNumber"
                            {...register('aadharNumber')}
                            className={`pl-10 ${errors.aadharNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                          />
                        </div>
                        {errors.aadharNumber && (
                          <p className="text-sm text-red-600 mt-1">{errors.aadharNumber.message}</p>
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

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-6 pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Manage Documents</CardTitle>
                  <CardDescription>
                    Upload and manage important documents related to your services and account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
} 