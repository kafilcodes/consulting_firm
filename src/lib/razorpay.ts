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
  amount: number; // in paise
  currency: string;
  orderId: string;
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
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_yourkeyhere', // Use test key or environment variable
        amount: options.amount,
        currency: options.currency,
        name: options.name,
        description: options.description,
        order_id: options.orderId,
        prefill: options.prefill,
        notes: options.notes,
        theme: options.theme || { color: '#3182ce' },
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
 * @param amount - Amount in paise
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