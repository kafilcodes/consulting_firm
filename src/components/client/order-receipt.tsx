'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  FileDown, 
  Printer, 
  Share2, 
  Receipt, 
  CreditCard, 
  Calendar, 
  Building, 
  User, 
  Package,
  Loader2,
  Eye,
  CheckCircle,
  Clock,
  BanknoteIcon,
  ShieldCheck,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { PDFDownloadLink, PDFViewer, Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface OrderReceiptProps {
  order: any;
  companyLogo?: string;
  companyName?: string;
  companyAddress?: string;
}

// PDF receipt styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  logo: {
    width: 120,
    height: 50,
    objectFit: 'contain',
  },
  companyInfo: {
    fontSize: 9,
    color: '#4b5563',
    textAlign: 'right',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1f2937',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  receipt: {
    fontSize: 11,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  section: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f9fafb',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#374151',
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    borderBottomStyle: 'solid',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    fontSize: 10,
  },
  label: {
    color: '#4b5563',
    maxWidth: '50%',
  },
  value: {
    fontWeight: 'bold',
    color: '#111827',
    maxWidth: '50%',
    textAlign: 'right',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    borderTopStyle: 'solid',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalLabel: {
    color: '#111827',
  },
  totalValue: {
    color: '#047857',
  },
  divider: {
    height: 1,
    backgroundColor: '#e5e7eb',
    marginVertical: 10,
  },
  footer: {
    marginTop: 25,
    padding: 10,
    backgroundColor: '#f3f4f6',
    borderRadius: 4,
  },
  footerText: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 3,
  },
  footerTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 6,
  },
  paymentBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: '#dcfce7',
    borderRadius: 10,
    color: '#059669',
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    fontSize: 10,
    marginBottom: 10,
  },
  signature: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#d1d5db',
    borderTopStyle: 'dashed',
    paddingTop: 8,
    width: '40%',
    alignSelf: 'flex-end',
  },
  signatureText: {
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  watermark: {
    position: 'absolute',
    bottom: 150,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 60,
    color: '#f3f4f6',
    transform: 'rotate(-45deg)',
    opacity: 0.3,
  },
  idBadge: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 3,
    backgroundColor: '#f3f4f6',
    padding: 4,
    borderRadius: 3,
    alignSelf: 'flex-start',
  },
  twoColumnContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  column: {
    flex: 1,
  },
  tableHeader: {
    flexDirection: 'row', 
    backgroundColor: '#f1f5f9', 
    padding: 8, 
    marginBottom: 6, 
    borderRadius: 3,
  },
  tableRow: {
    flexDirection: 'row', 
    padding: 6, 
    borderBottomWidth: 1, 
    borderBottomColor: '#f3f4f6', 
    borderBottomStyle: 'solid'
  },
  tableHeaderText: {
    fontWeight: 'bold', 
    fontSize: 10, 
    color: '#334155'
  }
});

// The PDF Document component
const OrderReceiptDocument = ({ order, companyName, companyAddress, companyLogo }: OrderReceiptProps) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM dd, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  const isPaid = order.paymentStatus === 'completed';

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            {companyLogo ? (
              <Image src={companyLogo} style={styles.logo} />
            ) : (
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#111827' }}>{companyName || 'SKS Consulting'}</Text>
            )}
            <Text style={{ fontSize: 9, color: '#6b7280', marginTop: 3 }}>Professional Consulting Services</Text>
          </View>
          <View style={styles.companyInfo}>
            <Text style={{ fontSize: 12, fontWeight: 'bold', marginBottom: 3, color: '#111827' }}>{companyName || 'SKS Consulting'}</Text>
            <Text>{companyAddress || '123 Business Ave, Suite 100'}</Text>
            <Text>New Delhi, 110001, India</Text>
            <Text>info@sksconsulting.com</Text>
            <Text>+91 123-456-7890</Text>
            <Text style={{ marginTop: 3 }}>GST: 07AABCS1429B1Z3</Text>
          </View>
        </View>

        {/* Title and Receipt Number */}
        <View style={{ marginBottom: 15 }}>
          <Text style={styles.title}>Payment Receipt</Text>
          <Text style={styles.receipt}>Receipt #{order.id.substring(0, 8).toUpperCase()}</Text>
          
          {isPaid && (
            <View style={styles.paymentBadge}>
              <Text>PAID</Text>
            </View>
          )}
        </View>

        {/* Two Column Layout for Customer & Order Info */}
        <View style={styles.twoColumnContainer}>
          {/* Left Column: Customer Information */}
          <View style={[styles.section, styles.column]}>
            <Text style={styles.sectionTitle}>Customer Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Client Name:</Text>
              <Text style={styles.value}>{order.userName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{order.userEmail}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>User ID:</Text>
              <Text style={styles.value}>{order.userId ? order.userId.substring(0, 8) + '...' : 'N/A'}</Text>
            </View>
          </View>
          
          {/* Right Column: Order Information */}
          <View style={[styles.section, styles.column]}>
            <Text style={styles.sectionTitle}>Order Information</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Order Date:</Text>
              <Text style={styles.value}>{formatDate(order.createdAt)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Order Status:</Text>
              <Text style={styles.value}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Payment Status:</Text>
              <Text style={{ ...styles.value, color: isPaid ? '#059669' : '#dc2626' }}>
                {isPaid ? 'Paid' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Service Details - Table Format */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Service</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Type</Text>
            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Amount</Text>
          </View>
          
          {/* Table Row */}
          <View style={styles.tableRow}>
            <Text style={{ flex: 2, fontSize: 10 }}>{order.serviceName}</Text>
            <Text style={{ flex: 1, fontSize: 10, textAlign: 'center' }}>{order.serviceType || 'Standard'}</Text>
            <Text style={{ flex: 1, fontSize: 10, textAlign: 'right' }}>{formatCurrency(order.amount, order.currency)}</Text>
          </View>
          
          {/* Billing Cycle (if applicable) */}
          {order.billingCycle && (
            <View style={{ ...styles.row, marginTop: 8 }}>
              <Text style={styles.label}>Billing Cycle:</Text>
              <Text style={styles.value}>{order.billingCycle}</Text>
            </View>
          )}
          
          {/* Total Amount */}
          <View style={styles.total}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.amount, order.currency)}</Text>
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Information</Text>
          
          {/* Transaction & Order IDs */}
          {order.razorpayPaymentId && (
            <View style={styles.row}>
              <Text style={styles.label}>Transaction ID:</Text>
              <Text style={styles.value}>{order.razorpayPaymentId}</Text>
            </View>
          )}
          
          {order.razorpayOrderId && (
            <View style={styles.row}>
              <Text style={styles.label}>Razorpay Order ID:</Text>
              <Text style={styles.value}>{order.razorpayOrderId}</Text>
            </View>
          )}
          
          {/* Payment Method & Date */}
          <View style={styles.row}>
            <Text style={styles.label}>Payment Method:</Text>
            <Text style={styles.value}>Online Payment</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Payment Date:</Text>
            <Text style={styles.value}>{formatDate(order.updatedAt || order.createdAt)}</Text>
          </View>
        </View>

        {/* Footer Section with Signature */}
        <View style={{ marginTop: 'auto' }}>
          {/* Digital Signature */}
          <View style={styles.signature}>
            <Text style={[styles.signatureText, { fontWeight: 'bold' }]}>SKS Consulting</Text>
            <Text style={styles.signatureText}>Authorized Signature</Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>Thank you for your business!</Text>
            <Text style={styles.footerText}>This is a computer-generated receipt and does not require a physical signature.</Text>
            <Text style={styles.footerText}>For any queries, please contact our support team at support@sksconsulting.com</Text>
            <Text style={styles.footerText}>Terms & Conditions apply. For full details, visit www.sksconsulting.com/terms</Text>
          </View>
          
          {/* Document ID */}
          <View style={{ position: 'absolute', bottom: 10, left: 40 }}>
            <Text style={styles.idBadge}>Receipt ID: {order.id}</Text>
          </View>
        </View>
        
        {/* Watermark for Paid Orders */}
        {isPaid && (
          <Text style={styles.watermark}>PAID</Text>
        )}
      </Page>
    </Document>
  );
};

export function OrderReceipt({ order, companyLogo, companyName, companyAddress }: OrderReceiptProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPdfReady, setIsPdfReady] = useState(false);
  
  useEffect(() => {
    if (isDialogOpen) {
      // Wait a bit for the dialog to fully render before displaying PDF
      const timer = setTimeout(() => {
        setIsPdfReady(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setIsPdfReady(false);
    }
  }, [isDialogOpen]);
  
  if (!order) return null;
  
  const isPaid = order.paymentStatus === 'completed';
  const isOrderCompleted = order.status === 'completed';
  
  // Only show receipt if payment is completed, regardless of order status
  const canDownload = isPaid;
  
  return (
    <div>
      <Card className="overflow-hidden border-2 border-primary/10 shadow-md">
        <CardHeader className="bg-muted/30">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-primary" />
            Payment Receipt
          </CardTitle>
          <CardDescription>
            {canDownload 
              ? "Download or view your payment receipt" 
              : "Receipt will be available after payment is completed"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium text-lg">{formatCurrency(order.amount, order.currency)}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Payment Status:</span>
              <Badge variant={isPaid ? "success" : "secondary"} className="capitalize">
                <div className="flex items-center gap-1">
                  {isPaid ? (
                    <>
                      <CheckCircle className="h-3 w-3" />
                      <span>Paid</span>
                    </>
                  ) : (
                    <>
                      <Clock className="h-3 w-3" />
                      <span>{order.paymentStatus}</span>
                    </>
                  )}
                </div>
              </Badge>
            </div>
            
            {order.razorpayPaymentId && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono text-xs bg-muted/50 p-1 rounded truncate max-w-[200px]">{order.razorpayPaymentId}</span>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>
                {(() => {
                  try {
                    return format(new Date(order.createdAt), 'MMM dd, yyyy');
                  } catch (error) {
                    return order.createdAt;
                  }
                })()}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t bg-muted/20 p-4">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-1/2">
                <Eye className="mr-2 h-4 w-4" />
                View Receipt
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[calc(100vh-100px)]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-primary" />
                  Receipt Preview
                </DialogTitle>
                <DialogDescription>
                  {canDownload 
                    ? "You can print this receipt or download it as a PDF" 
                    : "Preview only - Receipt will be available for download after payment is completed"}
                </DialogDescription>
              </DialogHeader>
              <div className="h-full w-full overflow-hidden rounded-md border">
                {isPdfReady ? (
                  <PDFViewer width="100%" height="600px" className="border-0">
                    <OrderReceiptDocument 
                      order={order} 
                      companyLogo={companyLogo} 
                      companyName={companyName} 
                      companyAddress={companyAddress} 
                    />
                  </PDFViewer>
                ) : (
                  <div className="flex items-center justify-center h-[600px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    toast.info('Printing receipt...');
                    window.print();
                  }}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
                
                {canDownload && (
                  <PDFDownloadLink
                    document={
                      <OrderReceiptDocument 
                        order={order} 
                        companyLogo={companyLogo} 
                        companyName={companyName} 
                        companyAddress={companyAddress} 
                      />
                    }
                    fileName={`receipt-${order.id.substring(0, 8)}.pdf`}
                  >
                    {({ loading, error }) => (
                      <Button disabled={loading} variant="default">
                        {loading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Preparing...
                          </>
                        ) : (
                          <>
                            <FileDown className="mr-2 h-4 w-4" />
                            Download
                          </>
                        )}
                      </Button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </DialogContent>
          </Dialog>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-1/2 ml-2">
                  {canDownload ? (
                    <PDFDownloadLink
                      document={
                        <OrderReceiptDocument 
                          order={order} 
                          companyLogo={companyLogo} 
                          companyName={companyName} 
                          companyAddress={companyAddress} 
                        />
                      }
                      fileName={`receipt-${order.id.substring(0, 8)}.pdf`}
                      className="w-full"
                    >
                      {({ loading, error }) => (
                        <Button disabled={loading} className="w-full">
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Preparing...
                            </>
                          ) : (
                            <>
                              <FileDown className="mr-2 h-4 w-4" />
                              Download
                            </>
                          )}
                        </Button>
                      )}
                    </PDFDownloadLink>
                  ) : (
                    <Button disabled className="w-full" variant="secondary">
                      <FileDown className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  )}
                </div>
              </TooltipTrigger>
              {!canDownload && (
                <TooltipContent>
                  <p>Receipt download will be available when payment is completed</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </div>
  );
} 