/**
 * Razorpay payment integration utilities
 */

// Define Razorpay window interface
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Payment response interface
export interface RazorpayPaymentResponse {
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
  error?: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

// Checkout options interface
export interface RazorpayCheckoutOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler?: (response: RazorpayPaymentResponse) => void;
}

// Payment options for our app
export interface PaymentOptions {
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  image?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
}

/**
 * Load the Razorpay script dynamically
 * @returns Promise<boolean> - True if script loaded successfully
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // If already loaded, resolve immediately
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Create script element
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };

    // Add script to document
    document.body.appendChild(script);
  });
};

/**
 * Initialize Razorpay checkout
 * @param options - Checkout options
 * @returns Promise with payment response
 */
export const initializeRazorpayCheckout = (
  options: RazorpayCheckoutOptions
): Promise<RazorpayPaymentResponse> => {
  return new Promise((resolve, reject) => {
    try {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK not loaded'));
        return;
      }

      // Create Razorpay instance
      const razorpay = new window.Razorpay({
        ...options,
        handler: function (response: RazorpayPaymentResponse) {
          resolve(response);
        },
      });

      // Add event listeners
      razorpay.on('payment.failed', function (response: { error: any }) {
        resolve({ error: response.error });
      });

      // Open checkout modal
      razorpay.open();
    } catch (error) {
      console.error('Razorpay initialization error:', error);
      reject(error);
    }
  });
};

/**
 * Format amount for Razorpay (converts to paise)
 * @param amount - Amount in rupees
 * @returns Amount in paise
 */
export const formatAmountForRazorpay = (amount: number): number => {
  return Math.round(amount * 100); // Convert to paise (1 INR = 100 paise)
};

/**
 * Format amount from Razorpay (converts from paise to rupees)
 * @param amount - Amount in rupees
 * @returns Amount in rupees
 */
export const formatAmountFromRazorpay = (amount: number): number => {
  return amount / 100; // Convert from paise to rupees
};

/**
 * Verify Razorpay payment signature (should be done on server side)
 * This is a placeholder - actual verification should happen on the server
 */
export const verifyPaymentSignature = (
  orderId: string, 
  paymentId: string, 
  signature: string
): boolean => {
  // In a real implementation, this should be server-side
  // The signature should be verified using the Razorpay secret key
  console.log('Payment verification should be implemented server-side');
  // Placeholder for demo purposes
  return true;
};

/**
 * Razorpay utility functions
 */

// Define types for Razorpay responses and options
export interface RazorpayOrderCreateOptions {
  amount: number;
  currency: string;
  receipt: string;
  payment_capture?: number;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

/**
 * Generate a short, unique receipt ID for Razorpay
 * Ensures the ID is shorter than 40 characters as required by Razorpay
 */
export function generateReceiptId(prefix = 'rcpt'): string {
  const timestamp = Date.now().toString().slice(-8);
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Generate Razorpay checkout options for the frontend
 */
export function generateRazorpayOptions(
  orderId: string,
  amount: number, 
  currency: string,
  keyId: string,
  user: any, 
  serviceName: string
) {
  return {
    key: keyId,
    amount: amount,
    currency: currency,
    name: 'SKS Consulting',
    description: `Payment for ${serviceName}`,
    order_id: orderId,
    prefill: {
      name: user?.displayName || '',
      email: user?.email || '',
      contact: user?.phoneNumber || ''
    },
    theme: {
      color: '#6366F1'
    }
  };
}

/**
 * Create a Razorpay order via server API
 */
export async function createRazorpayOrder(
  amount: number, 
  currency: string, 
  orderId: string,
  token: string
): Promise<{id: string, amount: number, currency: string, key_id: string}> {
  const response = await fetch('/api/razorpay/create-order', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount,
      currency,
      orderId
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || 'Failed to create payment order'
    );
  }

  return await response.json();
}

/**
 * Verify a Razorpay payment
 */
export async function verifyRazorpayPayment(
  paymentId: string, 
  orderId: string,
  signature: string, 
  token: string
): Promise<{success: boolean}> {
  const response = await fetch('/api/razorpay/verify-payment', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      razorpay_payment_id: paymentId,
      razorpay_order_id: orderId,
      razorpay_signature: signature
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      errorData.error || 'Failed to verify payment'
    );
  }

  return await response.json();
}
