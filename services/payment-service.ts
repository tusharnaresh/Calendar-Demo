import { Event } from '@/data/mockEvents';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PAYMENT_STORAGE_KEY = '@calendar_payments';

type PaymentStatus = 'unpaid' | 'paid' | 'processing' | 'failed';

interface PaymentIntent {
  clientSecret: string;
  paymentIntentId: string;
}

interface PaymentConfirmation {
  status: string;
  eventId: string;
}

/**
 * Create a payment intent for an event
 */
export const createPaymentIntent = async (
  eventId: string,
  amount: number = 15.0
): Promise<PaymentIntent> => {
  try {
    console.log('Creating payment intent for event:', eventId, 'amount:', amount);
    
    const response = await fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventId,
        amount,
      }),
    });

    console.log('Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create payment intent');
    }

    const data = await response.json();
    console.log('Payment intent created successfully');
    return data;
  } catch (error: any) {
    console.error('Error creating payment intent:', error);
    throw new Error(
      error.message || 'Failed to create payment intent'
    );
  }
};

/**
 * Confirm a payment
 */
export const confirmPayment = async (
  paymentIntentId: string
): Promise<PaymentConfirmation> => {
  try {
    console.log('Confirming payment:', paymentIntentId);
    
    const response = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentIntentId,
      }),
    });

    console.log('Confirm response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to confirm payment');
    }

    const data = await response.json();
    console.log('Payment confirmed successfully');
    return data;
  } catch (error: any) {
    console.error('Error confirming payment:', error);
    throw new Error(
      error.message || 'Failed to confirm payment'
    );
  }
};

/**
 * Save payment status to local storage
 */
export const savePaymentStatus = async (
  eventId: string,
  status: PaymentStatus,
  paymentIntentId?: string
): Promise<void> => {
  try {
    const paymentsJson = await AsyncStorage.getItem(PAYMENT_STORAGE_KEY);
    const payments = paymentsJson ? JSON.parse(paymentsJson) : {};

    payments[eventId] = {
      status,
      paymentIntentId,
      updatedAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments));
  } catch (error) {
    console.error('Error saving payment status:', error);
  }
};

/**
 * Get payment status from local storage
 */
export const getPaymentStatus = async (
  eventId: string
): Promise<{
  status: PaymentStatus;
  paymentIntentId?: string;
} | null> => {
  try {
    const paymentsJson = await AsyncStorage.getItem(PAYMENT_STORAGE_KEY);
    if (!paymentsJson) return null;

    const payments = JSON.parse(paymentsJson);
    return payments[eventId] || null;
  } catch (error) {
    console.error('Error getting payment status:', error);
    return null;
  }
};

/**
 * Clear all payment data (useful for testing)
 */
export const clearPaymentData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PAYMENT_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing payment data:', error);
  }
};
