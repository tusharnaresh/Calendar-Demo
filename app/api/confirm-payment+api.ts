import Stripe from 'stripe';

// Initialize Stripe with secret key
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia' as any,
  typescript: true,
});

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json() as { paymentIntentId?: string };
    const { paymentIntentId } = body;

    if (!paymentIntentId) {
      return Response.json(
        { error: 'Payment Intent ID is required' },
        { status: 400 }
      );
    }

    // Retrieve the PaymentIntent to check its status
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    return Response.json({
      status: paymentIntent.status,
      eventId: paymentIntent.metadata.eventId,
    });
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    return Response.json(
      { error: error.message || 'Failed to confirm payment' },
      { status: 500 }
    );
  }
}
