'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Check, ChevronRight, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Service } from '@/lib/services';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ServicePricingProps {
  service: Service;
}

export function ServicePricing({ service }: ServicePricingProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleOrderNow = async () => {
    try {
      setIsLoading(true);
      
      // Direct ordering - navigate to a new order page with the service ID
      router.push(`/client/orders/new?serviceId=${service.id}`);
      
      // Show notification
      toast.success('Redirecting to order form...');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Unable to process your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl shadow-sm border p-6"
    >
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Pricing & Delivery</h3>
        <div className="flex items-center gap-2 text-lg font-bold text-gray-900">
          {service.priceUnit === 'hourly' ? (
            <span>₹{service.price}/hour</span>
          ) : (
            <span>₹{service.price}</span>
          )}
          
          {service.popular && (
            <Badge variant="secondary" className="ml-2">Popular</Badge>
          )}
        </div>
        
        {service.estimatedDelivery && (
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <span>Estimated delivery: {service.estimatedDelivery}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4 mb-6">
        <h4 className="font-medium text-gray-900">What's included:</h4>
        <ul className="space-y-2">
          {(service.features || []).map((feature) => (
            <li key={feature.id} className="flex items-start gap-2">
              <div className="mt-1 flex-shrink-0">
                <Check className="h-4 w-4 text-green-500" />
              </div>
              <span className="text-gray-700">{feature.name}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <Button 
        onClick={handleOrderNow} 
        disabled={isLoading}
        className="w-full"
        size="lg"
      >
        {isLoading ? 'Processing...' : 'Order Now'}
        <ChevronRight className="ml-1 h-4 w-4" />
      </Button>
      
      <p className="text-xs text-gray-500 text-center mt-4">
        Secure payment processing • 100% satisfaction guarantee
      </p>
    </motion.div>
  );
} 