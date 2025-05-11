'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { seedServiceData } from '@/lib/firebase/services';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { ArrowLeft, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

// Sample service data to seed
const sampleServiceData = [
  {
    name: "Annual Tax Filing",
    shortDescription: "Complete yearly tax filing service for individuals and businesses",
    description: "Our comprehensive annual tax filing service ensures compliance with all tax regulations while maximizing legitimate deductions. Our expert CPAs will analyze your financial situation, prepare all necessary forms, and file your taxes on time. We handle both individual and business tax returns.",
    category: "tax",
    serviceType: "one-time",
    price: {
      amount: 5000,
      currency: "INR",
      billingType: "one-time"
    },
    features: [
      "Detailed tax analysis and planning",
      "All required tax forms preparation",
      "Digital and paper filing options",
      "Deduction optimization",
      "Audit protection"
    ],
    requirements: [
      "Income statements",
      "Previous year's tax returns",
      "Expense receipts",
      "Investment statements"
    ],
    deliverables: [
      "Completed tax returns",
      "Electronic filing with government",
      "Payment or refund processing",
      "Digital copies of all documents"
    ],
    estimatedDuration: "1-2 weeks"
  },
  {
    name: "Business Registration",
    shortDescription: "Complete business setup and registration services",
    description: "From sole proprietorships to corporations, our business registration service handles all aspects of establishing your business legally. We help you navigate the complex regulatory landscape, file the necessary paperwork, and establish your business structure correctly from day one.",
    category: "registration",
    serviceType: "one-time",
    price: {
      amount: 15000,
      currency: "INR",
      billingType: "one-time"
    },
    features: [
      "Business structure consultation",
      "Name availability check",
      "Government registration",
      "Tax ID application",
      "Business licenses coordination"
    ],
    requirements: [
      "Business owner identification",
      "Proposed business name options",
      "Business address confirmation",
      "Initial investment details"
    ],
    deliverables: [
      "Business registration certificate",
      "Tax identification numbers",
      "Required licenses and permits",
      "Compliance checklist"
    ],
    estimatedDuration: "3-4 weeks"
  },
  {
    name: "Financial Audit",
    shortDescription: "Comprehensive audit services for businesses of all sizes",
    description: "Our financial audit service provides an independent examination of your financial statements and accounting processes. We follow rigorous standards to ensure accuracy, compliance, and identify potential areas of improvement in your financial reporting systems.",
    category: "audit",
    serviceType: "one-time",
    price: {
      amount: 25000,
      currency: "INR",
      billingType: "one-time"
    },
    features: [
      "Risk assessment",
      "Internal controls evaluation",
      "Financial statement examination",
      "Compliance verification",
      "Management letter with recommendations"
    ],
    requirements: [
      "Financial statements",
      "General ledger access",
      "Transaction records",
      "Previous audit reports (if any)",
      "Company policies documentation"
    ],
    deliverables: [
      "Audit report",
      "Management letter",
      "Financial statements certification",
      "Presentation of findings"
    ],
    estimatedDuration: "4-6 weeks"
  },
  {
    name: "GST Filing & Compliance",
    shortDescription: "Regular GST filing and compliance management",
    description: "Stay compliant with Goods and Services Tax regulations with our comprehensive GST filing service. We handle monthly/quarterly filings, reconciliations, and ensure you meet all compliance requirements while optimizing your input tax credits.",
    category: "tax",
    serviceType: "plan",
    price: {
      amount: 3000,
      currency: "INR",
      billingType: "monthly"
    },
    features: [
      "Monthly/quarterly GST returns",
      "Input tax credit optimization",
      "GST reconciliation",
      "Compliance monitoring",
      "Regular updates on GST changes"
    ],
    requirements: [
      "Purchase and sales invoices",
      "GST registration details",
      "Bank statements",
      "Access to accounting software"
    ],
    deliverables: [
      "Filed GST returns",
      "Monthly reconciliation reports",
      "Compliance status updates",
      "Tax planning recommendations"
    ],
    estimatedDuration: "Ongoing service"
  },
  {
    name: "Business Consulting",
    shortDescription: "Strategic business advisory services",
    description: "Gain expert insights and strategic guidance for your business with our consulting services. Our experienced consultants will analyze your business, identify opportunities for growth, and help you navigate challenges. We provide actionable recommendations tailored to your specific business goals.",
    category: "consulting",
    serviceType: "plan",
    price: {
      amount: 10000,
      currency: "INR",
      billingType: "monthly"
    },
    features: [
      "Business performance analysis",
      "Strategic planning sessions",
      "Operational efficiency assessment",
      "Growth opportunity identification",
      "Regular strategy meetings"
    ],
    requirements: [
      "Financial statements",
      "Business objectives",
      "Current business plan",
      "Market information",
      "Operational metrics"
    ],
    deliverables: [
      "Strategic recommendations report",
      "Implementation roadmap",
      "Monthly performance reviews",
      "Market analysis updates"
    ],
    estimatedDuration: "Ongoing service"
  }
];

export default function SeedServicesPage() {
  const router = useRouter();
  const { user, userRole } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [serviceData, setServiceData] = useState(
    JSON.stringify(sampleServiceData, null, 2)
  );

  // Redirect if not an admin
  if (!user || userRole !== 'admin') {
    router.push('/auth/signin');
    return null;
  }

  const handleSeedServices = async () => {
    try {
      setIsLoading(true);
      
      // Parse the JSON data
      let data;
      try {
        data = JSON.parse(serviceData);
        if (!Array.isArray(data)) {
          throw new Error('Data must be an array of services');
        }
      } catch (parseError) {
        toast.error('Invalid JSON format. Please check your data.');
        console.error('JSON parse error:', parseError);
        setIsLoading(false);
        return;
      }
      
      // Seed the data to Firebase
      await seedServiceData(data);
      
      toast.success('Services seeded successfully');
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/services');
      }, 3000);
    } catch (error) {
      console.error('Error seeding services:', error);
      toast.error('Failed to seed services');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/services')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Services
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Seed Service Data</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Initialize Service Data</CardTitle>
          <CardDescription>
            Use this tool to populate your database with initial service offerings.
            This should only be run once when setting up your application.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start p-4 border rounded-md bg-amber-50 border-amber-200">
            <AlertCircle className="h-5 w-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-amber-800">Warning</h4>
              <p className="text-sm text-amber-700">
                This tool is intended for initial setup only. Running it multiple times may create duplicate services.
                Only proceed if you are setting up your application for the first time or want to add these sample services
                to your existing collection.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Service Data (JSON format)</label>
            <Textarea
              className="font-mono h-96"
              value={serviceData}
              onChange={(e) => setServiceData(e.target.value)}
              disabled={isLoading || success}
            />
            <p className="text-xs text-muted-foreground">
              Edit the service data above if needed before seeding the database.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/services')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          {success ? (
            <Button variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Services Seeded Successfully
            </Button>
          ) : (
            <Button 
              onClick={handleSeedServices}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">◌</span>
                  Seeding Services...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Seed Services
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
} 