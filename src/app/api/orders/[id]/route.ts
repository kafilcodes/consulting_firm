import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase/config';
import { getOrder } from '@/lib/firebase/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get the order ID from the URL params
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract the token
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await auth.verifyIdToken(token);
    if (!decodedToken) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    // Get the user ID from the token
    const userId = decodedToken.uid;

    // Get the order from Firestore
    const order = await getOrder(orderId);
    
    // Check if the order exists
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Check if the user has permission to view this order
    if (order.clientId !== userId) {
      return NextResponse.json(
        { error: 'You do not have permission to view this order' },
        { status: 403 }
      );
    }

    // Return the order
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error getting order:', error);
    return NextResponse.json(
      { error: 'Failed to get order' },
      { status: 500 }
    );
  }
} 