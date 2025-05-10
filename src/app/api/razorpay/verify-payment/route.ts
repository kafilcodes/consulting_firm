import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { auth } from '@/lib/firebase/admin';
import { updateOrder } from '@/lib/firebase/services';

// Use environment variable for Razorpay secret key
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

export async function POST(request: Request) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized - No valid auth token provided' }, { status: 401 });
    }

    // Check if Firebase Admin is initialized
    if (!auth) {
      console.error('Firebase Admin SDK not initialized');
      return NextResponse.json({ 
        error: 'Server configuration error. Please contact support.' 
      }, { status: 500 });
    }

    // Check if Razorpay key is available
    if (!RAZORPAY_KEY_SECRET) {
      console.error('Razorpay key secret is missing');
      return NextResponse.json({ 
        error: 'Payment service configuration error. Please contact support.' 
      }, { status: 500 });
    }

    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await auth.verifyIdToken(token);
      
      if (!decodedToken.uid) {
        return NextResponse.json({ error: 'Invalid token - UID not found' }, { status: 401 });
      }
      
      console.log('User authenticated successfully for payment verification:', decodedToken.uid);

      // Extract payment data from request
      const { 
        orderId,
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature 
      } = await request.json();

      // Validate required fields
      if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        console.error('Missing payment verification fields:', { 
          hasOrderId: !!orderId, 
          hasPaymentId: !!razorpay_payment_id, 
          hasRazorpayOrderId: !!razorpay_order_id, 
          hasSignature: !!razorpay_signature 
        });
        
        return NextResponse.json({ 
          error: 'Missing required payment verification fields' 
        }, { status: 400 });
      }

      console.log('Verifying payment signature for order:', orderId);
      console.log('Payment ID:', razorpay_payment_id);
      console.log('Razorpay Order ID:', razorpay_order_id);

      // Verify signature
      const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest('hex');

      console.log('Generated signature:', expectedSignature.substring(0, 10) + '...');
      console.log('Received signature:', razorpay_signature.substring(0, 10) + '...');

      // Compare signatures
      if (expectedSignature !== razorpay_signature) {
        console.error('Payment signature verification failed');
        
        // Update order status to failed
        await updateOrder(orderId, {
          status: 'cancelled',
          paymentStatus: 'failed',
          paymentVerified: false,
          timeline: [{
            status: 'payment_failed',
            timestamp: new Date().toISOString(),
            message: 'Payment verification failed - invalid signature'
          }]
        });
        
        return NextResponse.json({ 
          error: 'Payment verification failed. Invalid signature.' 
        }, { status: 400 });
      }

      console.log('Payment signature verified successfully for order:', orderId);

      // If signature is valid, update order status in Firestore
      await updateOrder(orderId, {
        status: 'confirmed',
        paymentVerified: true,
        timeline: [{
          status: 'payment_verified',
          timestamp: new Date().toISOString(),
          message: 'Payment signature verified'
        }]
      });

      // Return success response
      return NextResponse.json({ 
        success: true,
        message: 'Payment verified successfully',
        orderId
      });
    } catch (authError) {
      console.error('Authentication error:', authError);
      return NextResponse.json({ 
        error: 'Authentication failed - ' + (authError instanceof Error ? authError.message : 'Unknown error')
      }, { status: 401 });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'An error occurred while verifying the payment'
    }, { status: 500 });
  }
} 