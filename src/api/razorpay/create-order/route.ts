import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/auth-admin';
import { db } from '@/lib/firebase/admin';
import Razorpay from 'razorpay';

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_yourkeyhere',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'yoursecrethere',
});

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split('Bearer ')[1];
    let decodedToken;
    
    try {
      decodedToken = await auth.verifyIdToken(token);
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { amount, currency, receipt, notes } = body;

    // Validate required fields
    if (!amount || !currency || !receipt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt,
      notes: notes || {},
      payment_capture: 1, // Auto-capture
    };

    // In production, use actual Razorpay API
    // For development/testing, create a mock order
    let order;
    try {
      // Create order with Razorpay
      order = await razorpay.orders.create(options);
      
      // Update the order in Firestore with Razorpay order ID
      const orderRef = db.collection('orders').doc(receipt);
      await orderRef.update({
        razorpayOrderId: order.id,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error creating Razorpay order:', error);
      
      // For development/testing, create a mock order if Razorpay fails
      if (process.env.NODE_ENV !== 'production') {
        order = {
          id: `order_${Date.now()}`,
          amount: options.amount,
          currency: options.currency,
          receipt: options.receipt,
          status: 'created',
        };
        
        // Update the order in Firestore with mock order ID
        const orderRef = db.collection('orders').doc(receipt);
        await orderRef.update({
          razorpayOrderId: order.id,
          updatedAt: new Date().toISOString(),
          isMockOrder: true,
        });
      } else {
        throw error; // Re-throw in production
      }
    }

    // Return success response with order details
    return NextResponse.json({
      id: order.id,
      amount: order.amount / 100, // Convert back to rupees
      currency: order.currency,
      receipt: order.receipt,
      status: order.status,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error processing Razorpay order:', error);
    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
