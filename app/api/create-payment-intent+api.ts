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
    const body = await request.json() as { eventId?: string; amount?: number };
    const { eventId, amount } = body;

    if (!eventId || !amount) {
      return Response.json(
        { error: 'Event ID and amount are required' },
        { status: 400 }
      );
    }

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        eventId,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    return Response.json(
      { error: error.message || 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
