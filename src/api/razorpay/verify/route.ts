import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/firebase/admin';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { 
      razorpay_payment_id, 
      razorpay_order_id, 
      razorpay_signature,
      orderId 
    } = body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get the Razorpay secret key from environment variables
    const secret = process.env.RAZORPAY_KEY_SECRET || 'yoursecrethere';

    // Verify signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      secret
    );

    if (!isValidSignature && process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Update order status in Firestore
    const orderRef = db.collection('orders').doc(orderId);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order with payment details
    await orderRef.update({
      paymentId: razorpay_payment_id,
      razorpayOrderId: razorpay_order_id,
      paymentSignature: razorpay_signature,
      paymentStatus: 'completed',
      status: 'processing', // Order is now being processed
      paymentVerified: isValidSignature,
      updatedAt: new Date().toISOString(),
    });

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      orderId,
      paymentId: razorpay_payment_id,
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}

/**
 * Verify Razorpay payment signature
 */
function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string,
  secret: string
): boolean {
  try {
    // Create HMAC SHA256 instance with secret key
    const hmac = crypto.createHmac('sha256', secret);
    
    // Update with the data to be verified (order_id + "|" + payment_id)
    hmac.update(`${orderId}|${paymentId}`);
    
    // Get the generated signature
    const generatedSignature = hmac.digest('hex');
    
    // Compare the generated signature with the provided signature
    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}
