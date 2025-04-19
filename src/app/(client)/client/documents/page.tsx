'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { File, Filter, Search, User, Folder, Clock, FileText, Plus } from 'lucide-react';
import { useAppSelector } from '@/store/hooks';
import { DocumentUpload } from '@/components/profile/document-upload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentCategory } from '@/types';
import { toast } from 'sonner';

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

export default function DocumentsPage() {
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/auth/signin');
      return;
    }
    
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [user, router]);

  // Document categories for filter
  const categories = [
    { id: 'all', name: 'All Documents' },
    { id: 'identification', name: 'Identification' },
    { id: 'financial', name: 'Financial' },
    { id: 'contract', name: 'Contracts' },
    { id: 'report', name: 'Reports' },
    { id: 'invoice', name: 'Invoices' },
    { id: 'legal', name: 'Legal Documents' },
    { id: 'other', name: 'Other' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-8"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
            <p className="text-gray-600">Upload, organize, and manage your important documents</p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Upload New Document
          </Button>
        </motion.div>

        {/* Search and Filter */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-2/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input
              type="text"
              placeholder="Search documents by name..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-1/3">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full">
                <div className="flex items-center">
                  <Filter className="mr-2 h-4 w-4 text-gray-500" />
                  <SelectValue placeholder="All Categories" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Document Management Interface */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Documents</TabsTrigger>
              <TabsTrigger value="recent">Recently Added</TabsTrigger>
              <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Your Documents</CardTitle>
                  <CardDescription>
                    View, download, and manage all your uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recent" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recently Added Documents</CardTitle>
                  <CardDescription>
                    Access your most recently uploaded documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="upload" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload New Documents</CardTitle>
                  <CardDescription>
                    Upload and categorize important documents for your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DocumentUpload />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Document Categories Section */}
        <motion.div variants={itemVariants} className="mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Categories</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {categories.filter(c => c.id !== 'all').map((category) => (
              <Card 
                key={category.id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center">
                    <Folder className="h-5 w-5 mr-2 text-blue-500" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-3">
                    Manage your {category.name.toLowerCase()}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => setSelectedCategory(category.id)}>
                    View Documents
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 