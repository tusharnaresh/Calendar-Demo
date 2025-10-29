# Calendar App - Stripe Payment Integration Architecture

## 📋 Table of Contents
1. [Overview](#overview)
2. [Payment Flow - Step by Step](#payment-flow---step-by-step)
3. [File Structure & Responsibilities](#file-structure--responsibilities)
4. [Client-Side Implementation](#client-side-implementation)
5. [Server-Side Implementation](#server-side-implementation)
6. [Expo API Routes Explained](#expo-api-routes-explained)
7. [Development vs Production](#development-vs-production)
8. [Cost & Pricing Implications](#cost--pricing-implications)
9. [Security Considerations](#security-considerations)
10. [Testing & Debugging](#testing--debugging)

---

## Overview

This React Native Expo app integrates Stripe payments to charge users $15.00 for calendar events. The implementation uses:

- **Frontend**: React Native with `@stripe/stripe-react-native` SDK
- **Backend**: Expo API Routes (serverless functions)
- **Payment Processor**: Stripe
- **Storage**: AsyncStorage for payment status persistence

---

## Payment Flow - Step by Step

### 1. User Initiates Payment
**Location**: `components/calendar/event-details-modal.tsx`

```
User clicks event → Modal opens → User sees "Pay $15.00" button
```

**What happens:**
- Event details modal component renders
- `useEffect` hook loads saved payment status from AsyncStorage
- If event is unpaid, "Pay $15.00" button is displayed
- If event is paid, success message is shown

### 2. Payment Intent Creation
**Location**: `services/payment-service.ts` → `createPaymentIntent()`

```
Button clicked → handlePayment() → createPaymentIntent() → Expo API Route
```

**What happens:**
1. Client calls `createPaymentIntent(eventId, 15.0)`
2. Function makes POST request to `/api/create-payment-intent`
3. Request body: `{ eventId: "event-123", amount: 15.0 }`
4. **This goes to the Expo API Route on the server**

### 3. Server Creates Payment Intent
**Location**: `app/api/create-payment-intent+api.ts`

```
Expo API Route receives request → Validates → Calls Stripe API → Returns client secret
```

**What happens:**
1. Server receives POST request
2. Extracts `eventId` and `amount` from request body
3. Validates both fields are present
4. Initializes Stripe with **secret key** (server-side only)
5. Creates Stripe PaymentIntent:
   ```typescript
   stripe.paymentIntents.create({
     amount: 1500, // $15.00 in cents
     currency: 'usd',
     metadata: { eventId: "event-123" },
     automatic_payment_methods: { enabled: true }
   })
   ```
6. Returns `clientSecret` and `paymentIntentId` to client

**Critical**: The secret key is NEVER exposed to the client. Only used server-side.

### 4. Initialize Payment Sheet
**Location**: `components/calendar/event-details-modal.tsx` → `handlePayment()`

```
Client receives clientSecret → initPaymentSheet() → Stripe SDK configured
```

**What happens:**
1. Client receives `clientSecret` from server
2. Calls Stripe's `initPaymentSheet()` with:
   - `paymentIntentClientSecret`: The secret from step 3
   - `merchantDisplayName`: "Calendar Events"
   - `defaultBillingDetails`: Optional pre-filled info
3. Stripe SDK prepares the payment UI

### 5. Present Payment Sheet
**Location**: `components/calendar/event-details-modal.tsx`

```
Payment sheet initialized → presentPaymentSheet() → User enters card details
```

**What happens:**
1. Stripe's pre-built payment sheet UI opens
2. User enters:
   - Card number (e.g., 4242 4242 4242 4242)
   - Expiry date
   - CVC
   - Billing details
3. User confirms payment
4. Stripe processes payment **directly with their servers**
5. Returns success/failure to app

**Important**: Card details NEVER touch your server. They go directly to Stripe.

### 6. Payment Confirmation
**Location**: `services/payment-service.ts` → `confirmPayment()`

```
Payment successful → confirmPayment() → Expo API Route verifies → Update status
```

**What happens:**
1. Client calls `confirmPayment(paymentIntentId)`
2. Makes POST request to `/api/confirm-payment`
3. Request body: `{ paymentIntentId: "pi_xxxxx" }`

### 7. Server Verifies Payment
**Location**: `app/api/confirm-payment+api.ts`

```
Expo API Route → Stripe.paymentIntents.retrieve() → Returns status
```

**What happens:**
1. Server receives paymentIntentId
2. Calls Stripe API to retrieve payment status:
   ```typescript
   const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
   ```
3. Returns payment status: `succeeded`, `processing`, or `failed`
4. Also returns `eventId` from metadata

### 8. Update Local Storage
**Location**: `services/payment-service.ts` → `savePaymentStatus()`

```
Payment confirmed → savePaymentStatus() → AsyncStorage updated
```

**What happens:**
1. Payment status saved locally:
   ```typescript
   {
     "event-123": {
       status: "paid",
       paymentIntentId: "pi_xxxxx",
       updatedAt: "2025-10-29T10:30:00Z"
     }
   }
   ```
2. UI updates to show "Paid" badge
3. "Pay $15.00" button is hidden
4. Success message displayed

---

## File Structure & Responsibilities

### Client-Side Files

#### 1. `components/calendar/event-details-modal.tsx`
**Role**: UI and payment orchestration

**Responsibilities:**
- Renders event details
- Displays payment section with amount and status
- Handles "Pay $15.00" button click
- Orchestrates entire payment flow
- Shows loading states during payment
- Displays success/error messages
- Updates UI based on payment status

**Key Functions:**
- `handlePayment()`: Main payment flow coordinator
- `loadPaymentStatus()`: Loads saved payment state on mount
- `getPaymentStatusColor()`: Returns color based on status
- `getPaymentStatusText()`: Returns display text for status

**State Management:**
```typescript
const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
const [isProcessing, setIsProcessing] = useState(false)
```

**Stripe Hooks:**
```typescript
const { initPaymentSheet, presentPaymentSheet } = useStripe()
```

#### 2. `services/payment-service.ts`
**Role**: Payment business logic and API communication

**Responsibilities:**
- Makes API calls to Expo routes
- Handles payment intent creation
- Handles payment confirmation
- Manages AsyncStorage for payment status
- Provides error handling and logging

**Exported Functions:**

**`createPaymentIntent(eventId, amount)`**
- Makes POST to `/api/create-payment-intent`
- Returns: `{ clientSecret, paymentIntentId }`
- Logs request/response for debugging

**`confirmPayment(paymentIntentId)`**
- Makes POST to `/api/confirm-payment`
- Returns: `{ status, eventId }`
- Verifies payment completion

**`savePaymentStatus(eventId, status, paymentIntentId?)`**
- Saves payment state to AsyncStorage
- Persists across app restarts
- Returns: void

**`getPaymentStatus(eventId)`**
- Retrieves payment state from AsyncStorage
- Returns: `{ status, paymentIntentId } | null`

**`clearPaymentData()`**
- Clears all payment data (for testing)
- Returns: void

#### 3. `data/mockEvents.ts`
**Role**: Event data structure and type definitions

**Payment-Related Fields:**
```typescript
interface Event {
  // ... other fields
  paymentStatus?: 'unpaid' | 'paid' | 'processing' | 'failed'
  paymentIntentId?: string
  paymentAmount?: number // Amount in dollars (e.g., 15.00)
}
```

**Purpose:**
- Defines event structure
- Includes payment metadata
- Provides mock data for testing

#### 4. `app/_layout.tsx`
**Role**: App-level configuration and providers

**Responsibilities:**
- Wraps entire app with `<StripeProvider>`
- Provides publishable key to Stripe SDK
- Configures Apple Pay merchant identifier
- Makes Stripe available to all components

**Configuration:**
```typescript
<StripeProvider
  publishableKey={stripePublishableKey}
  merchantIdentifier="merchant.com.tush38.Calendar"
>
```

---

### Server-Side Files

#### 1. `app/api/create-payment-intent+api.ts`
**Role**: Stripe PaymentIntent creation endpoint

**Functionality:**
```typescript
export async function POST(request: Request): Promise<Response>
```

**Request Body:**
```json
{
  "eventId": "event-123",
  "amount": 15.0
}
```

**Process:**
1. Validates request body
2. Converts amount to cents (15.0 → 1500)
3. Creates Stripe PaymentIntent with:
   - Amount in cents
   - Currency: USD
   - Metadata: eventId for tracking
   - Automatic payment methods enabled
4. Returns client secret

**Response (Success):**
```json
{
  "clientSecret": "pi_xxxxx_secret_yyyyy",
  "paymentIntentId": "pi_xxxxx"
}
```

**Response (Error):**
```json
{
  "error": "Event ID and amount are required"
}
```

**Security:**
- Uses `STRIPE_SECRET_KEY` from environment
- Secret key never exposed to client
- Validates all inputs before processing

#### 2. `app/api/confirm-payment+api.ts`
**Role**: Payment verification endpoint

**Functionality:**
```typescript
export async function POST(request: Request): Promise<Response>
```

**Request Body:**
```json
{
  "paymentIntentId": "pi_xxxxx"
}
```

**Process:**
1. Validates paymentIntentId
2. Retrieves PaymentIntent from Stripe:
   ```typescript
   const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
   ```
3. Returns current status and event metadata

**Response (Success):**
```json
{
  "status": "succeeded",
  "eventId": "event-123"
}
```

**Possible Status Values:**
- `succeeded`: Payment completed successfully
- `processing`: Payment being processed (async payment methods)
- `requires_payment_method`: Payment failed, needs retry
- `requires_confirmation`: Needs additional confirmation
- `canceled`: Payment was canceled

---

### Configuration Files

#### 1. `app.config.js`
**Role**: Expo configuration with environment variables

**Key Configuration:**
```javascript
import 'dotenv/config'

export default {
  expo: {
    // ... other config
    extra: {
      stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY
    }
  }
}
```

**Purpose:**
- Loads environment variables from `.env`
- Makes Stripe publishable key available to app
- Uses `dotenv` package for .env file support

#### 2. `.env`
**Role**: Environment variables storage

**Contents:**
```bash
# Publishable key - Safe for client-side
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx

# Secret key - Server-side only
STRIPE_SECRET_KEY=sk_test_xxxxx
```

**Security:**
- Added to `.gitignore` (NEVER commit to git)
- `EXPO_PUBLIC_` prefix makes key available to client
- Secret key only accessible in API routes

#### 3. `.env.example`
**Role**: Template for environment variables

**Purpose:**
- Shows required environment variables
- Safe to commit to git (no actual keys)
- Helps other developers set up their environment

---

## Client-Side Implementation

### How the Client Works

#### 1. Initialization Phase
```
App starts → _layout.tsx loads → StripeProvider initialized
```

**What happens:**
- Expo loads environment variables
- StripeProvider wraps entire app
- Publishable key is provided to Stripe SDK
- Stripe SDK is ready for use throughout app

#### 2. Event Display Phase
```
User navigates → Calendar loads → Events displayed
```

**What happens:**
- Mock events loaded from `data/mockEvents.ts`
- Each event may have `paymentStatus` and `paymentAmount`
- Events render in calendar/list views
- User can tap any event to see details

#### 3. Payment UI Phase
```
Event tapped → Modal opens → Load payment status → Display UI
```

**In `event-details-modal.tsx`:**
```typescript
useEffect(() => {
  if (event) {
    loadPaymentStatus() // Check AsyncStorage
  }
}, [event])
```

**UI States:**
- **Unpaid**: Shows "Pay $15.00" button
- **Processing**: Shows loading spinner
- **Paid**: Shows green checkmark and "Payment completed"
- **Failed**: Shows retry button

#### 4. Payment Initiation Phase
```
Button clicked → Create intent → Init sheet → Present sheet
```

**Detailed Flow:**
```typescript
const handlePayment = async () => {
  setIsProcessing(true)
  
  try {
    // Step 1: Create payment intent (server call)
    const { clientSecret, paymentIntentId } = await createPaymentIntent(
      event.id, 
      15.0
    )
    
    // Step 2: Initialize payment sheet
    const { error: initError } = await initPaymentSheet({
      merchantDisplayName: 'Calendar Events',
      paymentIntentClientSecret: clientSecret,
      defaultBillingDetails: { name: 'Customer' }
    })
    
    if (initError) {
      Alert.alert('Error', initError.message)
      return
    }
    
    // Step 3: Present payment sheet to user
    const { error: presentError } = await presentPaymentSheet()
    
    if (presentError) {
      // User canceled or payment failed
      if (presentError.code !== 'Canceled') {
        Alert.alert('Payment Failed', presentError.message)
      }
      return
    }
    
    // Step 4: Confirm payment on server
    const confirmation = await confirmPayment(paymentIntentId)
    
    if (confirmation.status === 'succeeded') {
      await savePaymentStatus(event.id, 'paid', paymentIntentId)
      setPaymentStatus('paid')
      Alert.alert('Payment Successful', 'Your payment has been processed!')
    }
  } catch (error) {
    Alert.alert('Error', error.message)
  } finally {
    setIsProcessing(false)
  }
}
```

#### 5. Data Persistence
```
Payment completes → Save to AsyncStorage → Persist across sessions
```

**Storage Structure:**
```typescript
{
  "@calendar_payments": {
    "event-1": {
      status: "paid",
      paymentIntentId: "pi_xxxxx",
      updatedAt: "2025-10-29T10:30:00Z"
    },
    "event-2": {
      status: "unpaid",
      updatedAt: "2025-10-29T09:15:00Z"
    }
  }
}
```

**Benefits:**
- Survives app restarts
- Quick status checks (no API calls needed)
- Offline-first approach

---

## Server-Side Implementation

### Expo API Routes Architecture

#### What are Expo API Routes?

Expo API Routes are **serverless functions** that run on the Expo development server (dev) or can be deployed to serverless platforms (production).

**File Naming Convention:**
```
app/api/[route-name]+api.ts
```

Examples:
- `app/api/create-payment-intent+api.ts` → `/api/create-payment-intent`
- `app/api/confirm-payment+api.ts` → `/api/confirm-payment`

**The `+api.ts` suffix** tells Expo this is an API route, not a screen.

#### How API Routes Work in Development

```
Client request → Expo Dev Server → API Route Handler → Response
```

**Network Flow:**
```
iOS/Android App (192.168.1.x)
    ↓
    fetch('/api/create-payment-intent')
    ↓
Expo Dev Server (192.168.1.3:8081)
    ↓
app/api/create-payment-intent+api.ts executes
    ↓
Stripe API (api.stripe.com)
    ↓
Response flows back to client
```

**Key Points:**
- API routes run on your development machine
- Environment variables loaded from `.env`
- Hot reload works (change code → auto-reload)
- Logs visible in terminal

#### Request Handling

**Supported HTTP Methods:**
```typescript
export async function GET(request: Request): Promise<Response>
export async function POST(request: Request): Promise<Response>
export async function PUT(request: Request): Promise<Response>
export async function DELETE(request: Request): Promise<Response>
```

**Request Object:**
```typescript
interface Request {
  method: string
  headers: Headers
  json(): Promise<any>  // Parse JSON body
  text(): Promise<string>
  formData(): Promise<FormData>
}
```

**Response Object:**
```typescript
// Success response
return Response.json({ 
  clientSecret: "pi_xxx_secret_yyy" 
})

// Error response
return Response.json(
  { error: "Invalid request" },
  { status: 400 }
)
```

#### Environment Variables in API Routes

**How They Work:**
```typescript
// In app/api/create-payment-intent+api.ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
```

**Loading Process:**
1. `app.config.js` imports `dotenv/config`
2. `.env` file is parsed
3. Variables available via `process.env`
4. **Only available on server-side** (API routes)

**Security Model:**
```
EXPO_PUBLIC_* → Available on client AND server
Other variables → Available ONLY on server (API routes)
```

Example:
```bash
# Client + Server
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx

# Server ONLY
STRIPE_SECRET_KEY=sk_test_xxx
```

#### Stripe Integration in API Routes

**Initialization:**
```typescript
import Stripe from 'stripe'

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY not defined')
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-10-28.acacia' as any,
  typescript: true
})
```

**Creating Payment Intent:**
```typescript
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(amount * 100), // Convert dollars to cents
  currency: 'usd',
  metadata: {
    eventId: eventId,
    source: 'calendar-app'
  },
  automatic_payment_methods: {
    enabled: true  // Supports cards, Apple Pay, Google Pay
  }
})
```

**Retrieving Payment Status:**
```typescript
const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

// Returns full payment object including:
// - status: 'succeeded', 'processing', etc.
// - amount
// - currency
// - metadata
// - payment_method details
```

---

## Development vs Production

### Development Environment

#### Network Architecture
```
┌─────────────────┐
│  iOS Simulator  │
│  192.168.1.5    │
└────────┬────────┘
         │ fetch('/api/...')
         ↓
┌─────────────────────────┐
│   Expo Dev Server       │
│   192.168.1.3:8081      │
│   (Your Mac/PC)         │
├─────────────────────────┤
│  - Bundles JavaScript   │
│  - Runs API routes      │
│  - Loads .env file      │
│  - Hot reload           │
└────────┬────────────────┘
         │ Stripe API calls
         ↓
┌─────────────────┐
│   Stripe API    │
│   api.stripe.com│
└─────────────────┘
```

#### Characteristics

**API Routes:**
- Run on your local development machine
- Accessed via relative paths: `/api/create-payment-intent`
- Expo dev server proxies requests to API route handlers
- Full access to `process.env` from `.env` file
- Console logs appear in your terminal
- Hot reload works - changes reflect immediately

**Stripe Configuration:**
- Uses **test mode** keys (`pk_test_...`, `sk_test_...`)
- Test card numbers only (4242 4242 4242 4242)
- No real money is charged
- Stripe Dashboard shows test data separately
- Can reset test data anytime

**Debugging:**
- React Native Debugger works
- Network requests visible in Flipper
- Console.log outputs to terminal
- Stripe Dashboard logs all test transactions

**Development Commands:**
```bash
# Start dev server
npm start

# View logs
# Terminal shows both app logs and API route logs

# Test payment
# Use card: 4242 4242 4242 4242
```

---

### Production Environment

#### Deployment Options

**Option 1: EAS Build + Serverless Deployment**
```
Mobile App (iOS/Android)
    ↓
Expo EAS Build (compiled native app)
    ↓
API Routes deployed to:
    - Vercel Functions
    - AWS Lambda
    - Google Cloud Functions
    - Netlify Functions
```

**Option 2: Separate Backend**
```
Mobile App
    ↓
API Gateway / Load Balancer
    ↓
Node.js Server (Express/Fastify)
    - EC2 / Cloud Run / App Engine
    - Handles payment API calls
```

**Option 3: Expo Router API Routes on Vercel**
```
Mobile App
    ↓
Vercel Edge Functions
    - app/api routes deployed as serverless functions
    - Auto-scaling
    - Global CDN
```

#### Production Network Flow

**Recommended Architecture:**
```
┌──────────────────┐
│   Mobile App     │
│   (Production)   │
└────────┬─────────┘
         │ HTTPS
         │ https://api.yourcalendar.com/api/create-payment-intent
         ↓
┌──────────────────────────┐
│   API Gateway / CDN      │
│   (CloudFlare / Vercel)  │
└────────┬─────────────────┘
         │
         ↓
┌──────────────────────────┐
│   Serverless Functions   │
│   (Lambda / Vercel)      │
├──────────────────────────┤
│  API Route Handlers      │
│  - create-payment-intent │
│  - confirm-payment       │
└────────┬─────────────────┘
         │ Stripe SDK
         ↓
┌──────────────────┐
│   Stripe API     │
│  (Production)    │
└──────────────────┘
```

#### Production Configuration

**Environment Variables:**
```bash
# Use LIVE mode keys
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
STRIPE_SECRET_KEY=sk_live_xxxxx

# API base URL
API_BASE_URL=https://api.yourcalendar.com
```

**Update `payment-service.ts`:**
```typescript
const getApiUrl = () => {
  if (__DEV__) {
    return '' // Development: relative paths
  }
  return process.env.API_BASE_URL || 'https://api.yourcalendar.com'
}

// Use in functions:
const response = await fetch(`${getApiUrl()}/api/create-payment-intent`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ eventId, amount })
})
```

#### Stripe Production Mode

**Activation Steps:**
1. Complete Stripe account verification
2. Add business information
3. Connect bank account for payouts
4. Verify identity documents
5. Switch dashboard to "Live Mode"
6. Get live API keys

**Live vs Test Mode Differences:**

| Feature | Test Mode | Live Mode |
|---------|-----------|-----------|
| API Keys | `pk_test_...` / `sk_test_...` | `pk_live_...` / `sk_live_...` |
| Card Numbers | Test cards only | Real cards only |
| Money | Simulated | Real charges |
| Dashboard | Separate test data | Production data |
| Payouts | No real payouts | Real bank transfers |
| Webhooks | Test webhook endpoints | Production endpoints |

#### Security Hardening for Production

**1. Environment Variables:**
```bash
# Never commit these!
# Use platform-specific secret management:

# Vercel
vercel env add STRIPE_SECRET_KEY production

# AWS Lambda
aws secretsmanager create-secret --name stripe-secret-key

# Google Cloud
gcloud secrets create stripe-secret-key
```

**2. Request Validation:**
```typescript
// Add request signature verification
import { createHmac } from 'crypto'

function verifyRequest(request: Request): boolean {
  const signature = request.headers.get('x-signature')
  const timestamp = request.headers.get('x-timestamp')
  
  // Implement HMAC signature verification
  // Prevents unauthorized API calls
}
```

**3. Rate Limiting:**
```typescript
// Implement rate limiting to prevent abuse
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
```

**4. HTTPS Only:**
```typescript
// Ensure all API calls use HTTPS
if (request.headers.get('x-forwarded-proto') !== 'https') {
  return Response.json({ error: 'HTTPS required' }, { status: 403 })
}
```

---

## Cost & Pricing Implications

### Stripe Fees

#### Standard Pricing (US)
```
Per successful card charge:
2.9% + $0.30

Example: $15.00 payment
- Stripe fee: $0.74 (2.9% × $15 + $0.30)
- You receive: $14.26
```

#### Breakdown by Payment Method

| Payment Method | Fee | Example on $15 |
|----------------|-----|----------------|
| Credit Card | 2.9% + $0.30 | $0.74 |
| Debit Card | 2.9% + $0.30 | $0.74 |
| Apple Pay | 2.9% + $0.30 | $0.74 |
| Google Pay | 2.9% + $0.30 | $0.74 |
| International Cards | 3.9% + $0.30 | $0.89 |
| Currency Conversion | +1% | +$0.15 |

#### Volume Discounts

**Stripe's tiered pricing:**
- 0-1 million: Standard 2.9% + $0.30
- Custom pricing available for higher volumes
- Contact Stripe sales for enterprise pricing

#### Failed Payments

**No charge for:**
- Declined cards
- Canceled payments
- Failed transactions
- Test mode transactions

**Disputes/Chargebacks:**
- $15.00 fee per dispute
- Refunded if you win the dispute
- Lost disputes: fee + refunded amount

### Infrastructure Costs

#### Development (FREE)
```
Expo Dev Server: $0
Local API routes: $0
Stripe test mode: $0
AsyncStorage: $0

Total monthly: $0
```

#### Production - Option 1: Vercel
```
Vercel Hobby (Free tier):
- 100GB bandwidth: $0
- Serverless functions: 100 execution hours
- Good for: Side projects, testing

Vercel Pro ($20/month):
- 1TB bandwidth
- Unlimited serverless functions
- Good for: Small businesses, < 10k users

Estimated API route costs:
- 1,000 payments/month: ~$0 (within free tier)
- 10,000 payments/month: ~$20-50
- 100,000 payments/month: ~$200-500
```

#### Production - Option 2: AWS Lambda
```
AWS Free Tier:
- 1M free requests/month
- 400,000 GB-seconds compute

Pay-as-you-go:
- $0.20 per 1M requests
- $0.0000166667 per GB-second

Example costs (10,000 payments/month):
- Lambda requests: $0.002
- Compute time: ~$0.50
- API Gateway: $0.035
- Total: ~$0.55/month
```

#### Production - Option 3: Dedicated Server
```
AWS EC2 t3.small:
- Cost: ~$15-20/month
- Handles: ~50,000 payments/month
- Fixed cost regardless of usage

Good for: Predictable traffic, cost control
```

### Total Cost of Operation Examples

#### Scenario 1: Small Business (100 payments/month)
```
Revenue (100 × $15): $1,500.00
Stripe fees: -$74.00
Vercel hosting: $0.00
Net revenue: $1,426.00

Cost per transaction: $0.74 (4.9%)
```

#### Scenario 2: Growing Business (1,000 payments/month)
```
Revenue (1,000 × $15): $15,000.00
Stripe fees: -$740.00
Vercel Pro hosting: -$20.00
Net revenue: $14,240.00

Cost per transaction: $0.76 (5.1%)
```

#### Scenario 3: Established Business (10,000 payments/month)
```
Revenue (10,000 × $15): $150,000.00
Stripe fees: -$7,400.00
AWS infrastructure: -$100.00
Support/monitoring: -$200.00
Net revenue: $142,300.00

Cost per transaction: $0.77 (5.1%)
```

### Cost Optimization Strategies

#### 1. Increase Transaction Amount
```
At $15:
- Stripe fee: $0.74 (4.9%)

At $30:
- Stripe fee: $1.17 (3.9%)

At $50:
- Stripe fee: $1.75 (3.5%)
```
**Strategy**: Bundle services, offer packages to increase average transaction value.

#### 2. ACH/Bank Transfers (US only)
```
Stripe ACH fees: 0.8%, capped at $5.00

On $15 payment:
- Card: $0.74
- ACH: $0.12

Savings: $0.62 per transaction
```
**Trade-off**: Slower (3-5 business days), higher friction

#### 3. Subscription Model
```
Stripe Billing:
- 0.5% on top of standard fees
- Better for recurring payments

Monthly subscription at $15:
- One-time setup fee: $0.74
- Recurring charge: Lower processing overhead
```

#### 4. Regional Optimization
```
Use local payment methods:
- iDEAL (Netherlands): €0.29
- SEPA (Europe): €0.35
- Interac (Canada): 1% + $0.25

Saves on international card fees
```

### Hidden Costs to Consider

#### 1. Refunds
```
Stripe refunds the fee MINUS the fixed portion:
- Original charge: $15.00 → Fee $0.74
- Refund $15.00 → Fee refunded: $0.44
- Net cost: $0.30 (lost)
```

#### 2. Disputed Payments
```
Per dispute: $15.00
If lost: Additional $15.00 charge + refund
Total potential loss: $30.00 per dispute

Mitigation: Clear descriptions, good support
```

#### 3. Currency Conversion
```
Customer pays in EUR, you settle in USD:
- Standard fee: 2.9% + $0.30
- FX conversion: +1%
- Total: 3.9% + $0.30

On €15:
- Converts to ~$16.50
- Fee: $0.78
- You receive: $15.72 (in USD)
```

#### 4. Compliance & PCI
```
Stripe handles PCI compliance: Included
However, you may need:
- Privacy policy: $0-500 (legal fees)
- Terms of service: $0-500
- GDPR compliance tools: $0-100/month
```

### ROI Calculation

#### Break-Even Analysis
```
Fixed costs (monthly):
- Hosting: $20
- Domain: $1
- Monitoring: $10
Total: $31

Net per transaction: $14.26 ($15 - $0.74)

Break-even: 31 / 14.26 = 2.17 transactions
You need at least 3 payments/month to break even
```

#### Profitability Scenarios
```
Target: $5,000/month profit

Required revenue:
$5,000 profit + $31 fixed + Stripe fees
= ~352 payments × $15
= 352 transactions/month

Stripe fees at this volume: ~$260
Total revenue needed: $5,280
Total payments: ~355/month
```

---

## Security Considerations

### API Key Security

#### Types of Keys

**1. Publishable Key (`pk_test_...` / `pk_live_...`)**
```
✓ Safe to expose in client code
✓ Included in JavaScript bundles
✓ Can be visible in network requests
✓ Limited permissions (create payment intents only)
✗ Cannot complete charges
✗ Cannot access sensitive data
```

**Usage:**
```typescript
// In client code - SAFE
<StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY}>
```

**2. Secret Key (`sk_test_...` / `sk_live_...`)**
```
✗ NEVER expose to client
✗ NEVER commit to git
✗ NEVER include in app bundle
✓ Server-side only (API routes)
✓ Full Stripe account access
✓ Can complete payments, refunds, etc.
```

**Usage:**
```typescript
// In API routes - SAFE
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
```

#### Key Storage Best Practices

**Development:**
```bash
# .env file (gitignored)
STRIPE_SECRET_KEY=sk_test_xxxxx

# .gitignore
.env
.env.local
.env.*.local
```

**Production:**
```bash
# Use platform secret management
# Vercel:
vercel env add STRIPE_SECRET_KEY

# AWS:
aws secretsmanager create-secret

# Never hardcode in files!
```

### PCI Compliance

#### What Stripe Handles (You Don't Need To)

**Stripe SAQ-A Compliance:**
- ✅ Card data never touches your server
- ✅ Stripe Elements / Payment Sheet is PCI compliant
- ✅ Stripe stores card details securely
- ✅ Tokenization handled by Stripe
- ✅ Encryption in transit and at rest

**Your Responsibility:**
- ✅ Use Stripe's official SDKs (we are ✓)
- ✅ HTTPS only for API calls
- ✅ Don't log card numbers (we don't ✓)
- ✅ Keep dependencies updated

**What This Means:**
```
Traditional payment flow (PCI-DSS required):
User → Your Server → Card Data → Payment Processor
❌ Complex compliance, annual audits, security scans

Stripe payment flow (SAQ-A):
User → Stripe → Card Data → Stripe Servers
✅ Minimal compliance requirements, no audits needed
```

### Data Security

#### Sensitive Data Storage

**DO NOT store:**
```typescript
❌ Full card numbers
❌ CVV codes
❌ Expiration dates
❌ Cardholder names (for payment)
❌ Any PCI-regulated data
```

**Safe to store:**
```typescript
✅ Payment intent IDs (pi_xxxxx)
✅ Customer IDs (cus_xxxxx)
✅ Payment status
✅ Transaction timestamps
✅ Last 4 digits (if provided by Stripe)
✅ Event metadata
```

**Our Implementation:**
```typescript
// SAFE - stored in AsyncStorage
{
  "event-123": {
    status: "paid",
    paymentIntentId: "pi_xxxxx",  // ✓ Safe to store
    updatedAt: "2025-10-29T10:30:00Z"
  }
}

// NEVER DO THIS:
{
  cardNumber: "4242424242424242",  // ❌ ILLEGAL
  cvv: "123",                       // ❌ ILLEGAL
  expiry: "12/25"                   // ❌ ILLEGAL
}
```

#### AsyncStorage Security

**Current Implementation:**
```typescript
await AsyncStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(payments))
```

**Considerations:**
- AsyncStorage is NOT encrypted by default
- Data persists on device
- Accessible to jailbroken/rooted devices

**Enhanced Security (Optional):**
```typescript
import * as SecureStore from 'expo-secure-store'

// Use SecureStore for sensitive data
await SecureStore.setItemAsync('payments', JSON.stringify(payments))
```

**Benefits:**
- Encrypted storage
- Keychain (iOS) / Keystore (Android)
- Protected from device compromise

### Network Security

#### HTTPS Enforcement

**Development:**
```typescript
// Expo dev server uses HTTP locally
// This is OK for development only
http://192.168.1.3:8081/api/create-payment-intent
```

**Production:**
```typescript
// MUST use HTTPS
https://api.yourcalendar.com/api/create-payment-intent

// Enforce in API routes:
export async function POST(request: Request) {
  if (request.headers.get('x-forwarded-proto') !== 'https') {
    return Response.json({ error: 'HTTPS required' }, { status: 403 })
  }
  // ... rest of code
}
```

#### Request Validation

**Current Implementation:**
```typescript
// Basic validation
if (!eventId || !amount) {
  return Response.json({ error: 'Invalid request' }, { status: 400 })
}
```

**Enhanced Security:**
```typescript
import { z } from 'zod'

const PaymentIntentSchema = z.object({
  eventId: z.string().uuid(),
  amount: z.number().min(0.50).max(999999.99)
})

export async function POST(request: Request) {
  const body = await request.json()
  
  try {
    const { eventId, amount } = PaymentIntentSchema.parse(body)
    // Validated data, proceed safely
  } catch (error) {
    return Response.json({ error: 'Invalid input' }, { status: 400 })
  }
}
```

### Authentication & Authorization

#### Current State
```
⚠️ No authentication implemented
Anyone with API access can create payments
```

#### Recommended Implementation

**1. Add User Authentication:**
```typescript
// Use Expo Auth Session or Clerk
import { useAuth } from '@clerk/clerk-expo'

const { userId, getToken } = useAuth()

// Include auth token in API calls
const token = await getToken()
fetch('/api/create-payment-intent', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  // ...
})
```

**2. Verify in API Routes:**
```typescript
import { verifyToken } from '@clerk/backend'

export async function POST(request: Request) {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  
  if (!token) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { userId } = await verifyToken(token)
    // User authenticated, proceed
  } catch (error) {
    return Response.json({ error: 'Invalid token' }, { status: 401 })
  }
}
```

**3. Prevent Duplicate Payments:**
```typescript
// Check if event already paid
const paymentStatus = await getPaymentStatus(eventId)
if (paymentStatus?.status === 'paid') {
  return Response.json({ error: 'Already paid' }, { status: 400 })
}
```

### Webhook Security

**When You Add Webhooks (Future):**
```typescript
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!
  
  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
    
    // Process verified webhook
    if (event.type === 'payment_intent.succeeded') {
      // Update database
    }
  } catch (error) {
    return Response.json({ error: 'Invalid signature' }, { status: 400 })
  }
}
```

---

## Testing & Debugging

### Test Cards

#### Successful Payments
```
Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/34)
CVC: Any 3 digits (e.g., 123)
ZIP: Any valid code (e.g., 12345)

Result: Payment succeeds immediately
```

#### Authentication Required (3D Secure)
```
Card: 4000 0025 0000 3155
Result: Opens authentication modal, then succeeds
```

#### Declined Payments
```
Card: 4000 0000 0000 9995
Result: Payment declined (generic_decline)
```

```
Card: 4000 0000 0000 9987
Result: Declined (insufficient_funds)
```

```
Card: 4000 0000 0000 0069
Result: Declined (expired_card)
```

#### Other Test Scenarios
```
Card: 4000 0000 0000 0341
Result: Declined (incorrect_cvc)
```

```
Card: 4000 0000 0000 0002
Result: Declined (card_declined)
```

### Logging Strategy

#### Client-Side Logging
```typescript
// payment-service.ts
console.log('Creating payment intent for event:', eventId, 'amount:', amount)
console.log('Response status:', response.status)
console.log('Payment intent created successfully')
```

**View logs:**
- Metro bundler terminal
- React Native Debugger console
- Expo Dev Tools

#### Server-Side Logging
```typescript
// app/api/create-payment-intent+api.ts
console.log('Received payment intent request:', { eventId, amount })
console.log('Payment intent created:', paymentIntent.id)
console.error('Error creating payment intent:', error)
```

**View logs:**
- Terminal running Expo dev server
- Vercel Function Logs (production)
- CloudWatch Logs (AWS)

#### Stripe Dashboard
```
https://dashboard.stripe.com/test/logs

View all:
- API requests
- Response codes
- Payment intents created
- Payment statuses
- Errors and failures
```

### Debugging Common Issues

#### Issue 1: "Network Error" when creating payment
```
Error: Network Error (AxiosError)

Cause: API route not accessible

Solutions:
1. Check Expo dev server is running
2. Verify API route file exists: app/api/create-payment-intent+api.ts
3. Check network connectivity
4. Try relative path: '/api/create-payment-intent'
5. Check for typos in URL
```

#### Issue 2: "Invalid API Key"
```
Error: Invalid API key provided

Cause: Stripe key is wrong or not loaded

Solutions:
1. Check .env file exists
2. Verify STRIPE_SECRET_KEY is set correctly
3. Restart Expo dev server (to reload .env)
4. Check key format: sk_test_... or sk_live_...
5. Verify key in Stripe Dashboard matches
```

#### Issue 3: Payment Sheet Doesn't Open
```
Error: initPaymentSheet error

Cause: Client secret invalid or expired

Solutions:
1. Check clientSecret is returned from API
2. Verify payment intent was created successfully
3. Check console logs for API errors
4. Ensure EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is set
5. Verify StripeProvider is wrapping the app
```

#### Issue 4: "Payment Intent Already Succeeded"
```
Error: This PaymentIntent's source has already been canceled

Cause: Trying to pay same intent twice

Solutions:
1. Create new payment intent for each attempt
2. Check payment status before retrying
3. Clear AsyncStorage if testing: clearPaymentData()
```

#### Issue 5: Amount in Cents Error
```
Error: Invalid amount (must be integer)

Cause: Sending dollars instead of cents

Solution:
// Correct:
amount: Math.round(amount * 100) // $15.00 → 1500 cents

// Wrong:
amount: 15.0 // Stripe expects 1500
```

### Testing Workflow

#### 1. Test Successful Payment
```
1. Start app: npm start
2. Open event details
3. Click "Pay $15.00"
4. Enter test card: 4242 4242 4242 4242
5. Complete payment
6. Verify:
   ✓ Payment status shows "Paid"
   ✓ Button changes to green checkmark
   ✓ AsyncStorage updated
   ✓ Stripe Dashboard shows payment
```

#### 2. Test Failed Payment
```
1. Click "Pay $15.00"
2. Enter declined card: 4000 0000 0000 9995
3. Attempt payment
4. Verify:
   ✓ Error alert appears
   ✓ Status remains "Unpaid"
   ✓ Can retry payment
   ✓ Stripe Dashboard shows declined payment
```

#### 3. Test Authentication Flow
```
1. Click "Pay $15.00"
2. Enter 3DS card: 4000 0025 0000 3155
3. Complete authentication modal
4. Verify:
   ✓ Authentication UI appears
   ✓ Payment succeeds after authentication
   ✓ Status updates to "Paid"
```

#### 4. Test Persistence
```
1. Complete successful payment
2. Close app completely
3. Reopen app
4. Open same event
5. Verify:
   ✓ Payment status still shows "Paid"
   ✓ AsyncStorage persisted correctly
   ✓ No "Pay" button shown
```

#### 5. Test Network Errors
```
1. Turn off WiFi/cellular
2. Click "Pay $15.00"
3. Verify:
   ✓ Error message appears
   ✓ Status remains "Unpaid"
   ✓ Can retry when network returns
```

### Monitoring & Alerts

#### Key Metrics to Track

**Payment Success Rate:**
```
(Successful payments / Total attempts) × 100

Target: > 95%
Alert if: < 90%
```

**Average Payment Time:**
```
Time from button click to success

Target: < 5 seconds
Alert if: > 10 seconds
```

**Error Rate:**
```
(Failed API calls / Total API calls) × 100

Target: < 1%
Alert if: > 5%
```

#### Stripe Dashboard Metrics
```
View at: https://dashboard.stripe.com

Monitor:
- Successful payments
- Declined payments
- Dispute rate
- Refund rate
- Revenue trends
```

---

## Summary

### Architecture Recap

```
┌─────────────────────────────────────────────────────────────┐
│                         MOBILE APP                          │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐  │
│  │  Event Modal   │→ │ Payment Service│→ │ AsyncStorage │  │
│  │  (UI & Flow)   │  │  (API Calls)   │  │  (Persist)   │  │
│  └────────┬───────┘  └────────┬───────┘  └──────────────┘  │
│           │                   │                              │
│           ↓                   ↓                              │
│  ┌────────────────────────────────────┐                     │
│  │      Stripe React Native SDK       │                     │
│  │    (Payment Sheet, Card Input)     │                     │
│  └────────────────┬───────────────────┘                     │
└───────────────────┼─────────────────────────────────────────┘
                    │
                    ↓ HTTPS
┌───────────────────┼─────────────────────────────────────────┐
│                   │        EXPO API ROUTES                  │
│  ┌────────────────▼──────────────┐  ┌────────────────────┐ │
│  │  create-payment-intent+api.ts │  │ confirm-payment    │ │
│  │  - Creates PaymentIntent      │  │ - Verifies status  │ │
│  │  - Returns client secret      │  │ - Returns result   │ │
│  └────────────────┬──────────────┘  └──────────┬─────────┘ │
│                   │                             │           │
└───────────────────┼─────────────────────────────┼───────────┘
                    │                             │
                    ↓                             ↓
                ┌───────────────────────────────────┐
                │         STRIPE API                │
                │  - Process payments               │
                │  - Store card details securely    │
                │  - Return payment status          │
                └───────────────────────────────────┘
```

### Key Takeaways

1. **Client handles UI** - Payment modal, loading states, success/error display
2. **Server creates intents** - API routes talk to Stripe, never expose secret key
3. **Stripe processes payments** - Card data never touches your servers
4. **AsyncStorage persists state** - Payment status survives app restarts
5. **Costs are predictable** - 2.9% + $0.30 per transaction + minimal hosting
6. **Security is built-in** - PCI compliance via Stripe, no card data stored
7. **Dev is free** - Test mode, local API routes, no charges
8. **Production requires setup** - Live keys, HTTPS, deployed API routes

---

## Additional Resources

- [Stripe API Documentation](https://stripe.com/docs/api)
- [Stripe React Native SDK](https://stripe.dev/stripe-react-native)
- [Expo API Routes](https://docs.expo.dev/router/reference/api-routes/)
- [Stripe Testing Guide](https://stripe.com/docs/testing)
- [Stripe Dashboard](https://dashboard.stripe.com)
- [PCI Compliance Guide](https://stripe.com/docs/security/guide)

---

**Document Version**: 1.0  
**Last Updated**: October 29, 2025  
**Maintained By**: Development Team
