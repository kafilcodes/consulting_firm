declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface PaymentOptions {
  amount: number;
  currency: string;
  orderId: string;
  name: string;
  description: string;
  image?: string;
  prefill: {
    name: string;
    email: string;
    contact?: string;
  };
  notes?: Record<string, string>;
}

export async function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function initializeRazorpayCheckout(options: PaymentOptions): Promise<any> {
  return new Promise((resolve, reject) => {
    const razorpay = new window.Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      ...options,
      handler: (response: any) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment cancelled'));
        },
      },
    });

    razorpay.open();
  });
}

export function formatAmountForRazorpay(amount: number): number {
  // Razorpay expects amount in smallest currency unit (paise for INR)
  return Math.round(amount * 100);
} 