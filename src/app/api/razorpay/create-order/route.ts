import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/firebase/admin';

// Use environment variables for Razorpay credentials
const RAZORPAY_KEY_ID = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    // Verify authentication if Firebase Admin is initialized
    if (auth) {
      const authHeader = request.headers.get('authorization');
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return NextResponse.json({ error: 'Unauthorized - No valid auth token provided' }, { status: 401 });
      }

      try {
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth.verifyIdToken(token);
        
        if (!decodedToken.uid) {
          return NextResponse.json({ error: 'Invalid token - UID not found' }, { status: 401 });
        }
        
        console.log('User authenticated successfully:', decodedToken.uid);
      } catch (authError) {
        console.error('Authentication error:', authError);
        return NextResponse.json({ 
          error: 'Authentication failed - ' + (authError instanceof Error ? authError.message : 'Unknown error') 
        }, { status: 401 });
      }
    } else {
      console.warn('Firebase Auth not initialized, skipping authentication check');
    }

    // Extract order data from request
    const { amount, currency = 'INR', orderId } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    // Calculate amount with GST (18%)
    const totalAmount = Math.round(amount * 1.18 * 100); // Convert to paise and add GST

    // Generate receipt ID (ensure it's shorter than 40 chars)
    const shorterRandomStr = Math.random().toString(36).substring(2, 8);
    const receiptId = `rcpt_${Date.now().toString().slice(-8)}_${shorterRandomStr}`;

    // Create Razorpay order options
    const options = {
      amount: totalAmount,
      currency,
      receipt: receiptId,
      payment_capture: 1 // Auto capture payment
    };

    console.log('Creating Razorpay order with options:', options);
    console.log('Using Razorpay credentials - Key ID:', RAZORPAY_KEY_ID);

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing!');
      return NextResponse.json({ error: 'Payment gateway configuration error' }, { status: 500 });
    }

    // Make API call to Razorpay to create order
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64')}`
      },
      body: JSON.stringify(options)
    });

    // Handle Razorpay API response
    if (!response.ok) {
      let errorMessage = 'Failed to create payment order';
      let errorDetails = '';
      
      try {
        const errorData = await response.json();
        console.error('Razorpay order creation failed:', errorData);
        errorMessage = errorData.error?.description || errorMessage;
        errorDetails = JSON.stringify(errorData);
      } catch (e) {
        console.error('Failed to parse Razorpay error response', e);
      }
      
      console.error(`Razorpay API error (${response.status}): ${errorMessage}`);
      console.error('Response details:', errorDetails || 'No details available');
      
      return NextResponse.json({ 
        error: errorMessage,
        status: response.status,
        details: errorDetails || undefined
      }, { status: response.status });
    }

    const razorpayOrder = await response.json();
    console.log('Razorpay order created successfully:', razorpayOrder);

    // Return data needed for the frontend
    return NextResponse.json({
      id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key_id: RAZORPAY_KEY_ID
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An error occurred while creating the payment order' 
    }, { status: 500 });
  }
} 