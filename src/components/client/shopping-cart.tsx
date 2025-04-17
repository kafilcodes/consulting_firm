'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cart-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Minus, ShoppingCart, AlertCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export function ShoppingCartComponent() {
  const router = useRouter();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const getTotal = useCartStore((state) => state.getTotal);
  
  const { subtotal, tax, total } = getTotal();
  
  // Handle quantity changes
  const handleDecreaseQuantity = (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      if (item.quantity > 1) {
        updateQuantity(itemId, item.quantity - 1);
      } else {
        removeItem(itemId);
      }
    }
  };
  
  const handleIncreaseQuantity = (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    if (item) {
      updateQuantity(itemId, item.quantity + 1);
    }
  };
  
  // Handle checkout
  const handleCheckout = async () => {
    try {
      setIsCheckingOut(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to checkout page
      router.push('/client/checkout');
      
      // Show success toast
      toast.success('Proceeding to checkout');
    } catch (error) {
      toast.error('Error proceeding to checkout. Please try again.');
    } finally {
      setIsCheckingOut(false);
    }
  };
  
  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-gray-100">
          <ShoppingCart className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6 max-w-md">
          Looks like you haven't added any services to your cart yet.
        </p>
        <Button asChild>
          <Link href="/client/services">Browse Services</Link>
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Cart Items */}
      <div className="w-full md:w-2/3">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
            </h2>
          </div>
          
          <ScrollArea className="max-h-[500px]">
            <AnimatePresence initial={false}>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b last:border-b-0"
                >
                  <div className="flex items-start p-4 gap-4">
                    {/* Service Image */}
                    <div className="flex-shrink-0">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-md flex items-center justify-center">
                          <AlertCircle className="text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Service Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-medium text-gray-900 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">
                        {item.description}
                      </p>
                      <div className="flex items-center text-sm text-gray-700">
                        <span className="font-medium">
                          {formatCurrency(item.price)}
                        </span>
                        {item.oldPrice && (
                          <span className="ml-2 text-gray-400 line-through">
                            {formatCurrency(item.oldPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Quantity and Remove Controls */}
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center border rounded-md overflow-hidden">
                        <button
                          onClick={() => handleDecreaseQuantity(item.id)}
                          className="p-1 hover:bg-gray-50 text-gray-600"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 py-1 text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleIncreaseQuantity(item.id)}
                          className="p-1 hover:bg-gray-50 text-gray-600"
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 text-sm flex items-center"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </ScrollArea>
          
          <div className="p-4 border-t flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={clearCart}
              className="text-sm"
            >
              Clear Cart
            </Button>
            
            <Button 
              asChild
              variant="outline"
              className="text-sm"
            >
              <Link href="/client/services">
                Continue Shopping
              </Link>
            </Button>
          </div>
        </div>
      </div>
      
      {/* Order Summary */}
      <div className="w-full md:w-1/3">
        <div className="bg-white rounded-lg shadow-sm border p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">GST (18%)</span>
              <span className="font-medium">{formatCurrency(tax)}</span>
            </div>
            
            <div className="pt-3 border-t flex justify-between">
              <span className="font-semibold">Total</span>
              <span className="font-semibold text-blue-600">{formatCurrency(total)}</span>
            </div>
          </div>
          
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleCheckout}
            disabled={isCheckingOut}
          >
            {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
          </Button>
          
          <p className="text-xs text-center text-gray-500 mt-4">
            Taxes and shipping calculated at checkout
          </p>
          
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Need Help?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <Link 
                  href="/client/support"
                  className="hover:text-blue-600 hover:underline"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link 
                  href="/client/faq"
                  className="hover:text-blue-600 hover:underline"
                >
                  Frequently Asked Questions
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 