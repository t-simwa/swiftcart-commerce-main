# M-Pesa Payment Integration Setup Guide

This guide explains how to set up M-Pesa STK Push payment integration for the SwiftCart platform.

## 📋 Overview

The platform supports M-Pesa payments via Safaricom's **M-Pesa Express** API (also known as **Lipa na M-Pesa Online** or STK Push). This is a Merchant/Business initiated C2B (Customer to Business) transaction that allows customers to pay for orders directly from their mobile phones using M-Pesa without leaving the website.

**How It Works:**
1. Merchant captures payment details and sends API request
2. API validates request and sends acknowledgment
3. Network-initiated push request sent to customer's M-PESA-registered phone
4. Customer confirms payment by entering M-PESA PIN
5. M-PESA validates PIN, debits customer, and credits merchant
6. Results sent back to merchant via callback URL
7. Customer receives SMS confirmation

The integration handles payment initiation, callback processing, and transaction verification automatically.

---

## 🔧 Backend Setup

### 1. Install Dependencies

The required dependencies are already added to `package.json`. Install them:

```bash
# From root directory (recommended)
pnpm install

# Or from backend directory only
cd swiftcart-backend
pnpm install
```

Required packages:
- `axios` - HTTP client for M-Pesa API calls
- `crypto` - Built-in Node.js module for password generation

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# M-Pesa Configuration
MPESA_CONSUMER_KEY=your-mpesa-consumer-key
MPESA_CONSUMER_SECRET=your-mpesa-consumer-secret
MPESA_SHORTCODE=your-business-shortcode
MPESA_PASSKEY=your-mpesa-passkey
MPESA_ENVIRONMENT=sandbox  # or 'production'
BACKEND_URL=http://localhost:3000  # Your backend URL for callbacks
```

**Important**: 
- For development, use `sandbox` environment
- For production, use `production` environment
- `BACKEND_URL` must be accessible by Safaricom's servers (use ngrok for local development)

---

## 📱 Safaricom Developer Portal Setup

### Step 1: Create Safaricom Developer Account

1. Go to [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
2. Click **Sign Up** to create a new account
3. Verify your email address
4. Complete your profile information

### Step 2: Create an App

1. Log in to the Developer Portal
2. Navigate to **My Apps** > **Create App**
3. Fill in app details:
   - **App Name**: SwiftCart E-Commerce
   - **Description**: E-commerce platform payment integration
   - **App Type**: Web Application
4. Click **Create App**
5. Note your **Consumer Key** and **Consumer Secret** (you'll need these for `.env`)

### Step 3: Configure M-Pesa Express (STK Push)

1. In your app dashboard, navigate to **APIs** > **M-Pesa Express**
2. Click **Configure** on **M-Pesa Express** (this is the STK Push API, also known as Lipa na M-Pesa Online)
3. Set up your configuration:
   - **Business Shortcode**: Your M-Pesa Paybill or Till number
     - Sandbox: `174379` (test shortcode)
     - Production: Your actual Paybill/Till number
   - **Passkey**: 
     - Sandbox: Available in the simulator section test data
     - Production: Sent to your developer email after go-live
   - **CallBack URL**: Your backend callback endpoint
     - Development: `https://your-ngrok-url.ngrok.io/api/v1/payment/mpesa/callback`
     - Production: `https://api.yourdomain.com/api/v1/payment/mpesa/callback`
   - **Transaction Type**: 
     - `CustomerPayBillOnline` for PayBill Numbers
     - `CustomerBuyGoodsOnline` for Till Numbers
   - **Account Reference**: Order ID or Transaction Reference (max 12 characters)
   - **Transaction Description**: Description of the transaction (max 13 characters)

### Step 4: Get Sandbox Credentials (Development)

For testing in sandbox environment:

1. Go to **Sandbox** section in Developer Portal
2. Navigate to **Simulator** section for test data
3. Copy the following test credentials:
   - **Consumer Key**: Available in your app dashboard (My Apps)
   - **Consumer Secret**: Available in your app dashboard (My Apps)
   - **Shortcode**: `174379` (test shortcode)
   - **Passkey**: Available in simulator section test data
   - **Test Phone Numbers**: Available in simulator section
   - **Test PIN**: Available in simulator section (usually `174379`)

**Note**: The passkey for sandbox is available in the simulator section, not in the app configuration. In production, the passkey will be sent to your developer email after go-live.

### Step 5: Request Production Credentials

For production environment:

**Prerequisites:**
- Live M-PESA PayBill or Till number
- Business Admin/Manager operators created
- Business registration documents

**Steps:**
1. Complete your app configuration
2. Submit your app for review (if required)
3. Request production credentials:
   - Go to **Production** section
   - Fill in the production credentials request form
   - Provide business registration documents
   - Provide your PayBill/Till number
   - Wait for approval (usually 1-3 business days)
4. Once approved, you'll receive via email:
   - Production Consumer Key
   - Production Consumer Secret
   - Your Business Shortcode (PayBill/Till number)
   - Production Passkey (sent to developer email after go-live)

---

## 🔵 Local Development Setup

### Step 1: Install ngrok (for Callback URL)

M-Pesa requires a publicly accessible callback URL. For local development, use ngrok:

1. Download ngrok from [ngrok.com](https://ngrok.com/)
2. Install and authenticate:
   ```bash
   ngrok config add-authtoken YOUR_AUTH_TOKEN
   ```
3. Start ngrok tunnel:
   ```bash
   ngrok http 3000
   ```
4. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
5. Update your `.env`:
   ```env
   BACKEND_URL=https://abc123.ngrok.io
   ```
6. Update callback URL in Safaricom Developer Portal to use ngrok URL

### Step 2: Configure Environment Variables

Create or update `.env` file in `swiftcart-backend/`:

```env
# M-Pesa Sandbox Configuration (Development)
MPESA_CONSUMER_KEY=your_sandbox_consumer_key
MPESA_CONSUMER_SECRET=your_sandbox_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=your_sandbox_passkey
MPESA_ENVIRONMENT=sandbox
BACKEND_URL=https://your-ngrok-url.ngrok.io

# Other required variables
MONGODB_URI=mongodb://localhost:27017/swiftcart
JWT_SECRET=your-jwt-secret
FRONTEND_URL=http://localhost:8080
```

### Step 3: Update Callback URL in Developer Portal

1. Go to your app in Safaricom Developer Portal
2. Navigate to **APIs** > **M-Pesa Express**
3. Update **CallBack URL** to:
   ```
   https://your-ngrok-url.ngrok.io/api/v1/payment/mpesa/callback
   ```
4. Save changes

---

## 🎨 Frontend Setup

The frontend is already configured with M-Pesa payment integration. No additional setup is required.

### Payment Flow

1. Customer adds items to cart and proceeds to checkout
2. Customer enters shipping address
3. Customer enters M-Pesa phone number (format: 254712345678)
4. Customer clicks "Initiate M-Pesa Payment"
5. STK Push prompt appears on customer's phone
6. Customer enters M-Pesa PIN
7. Payment is processed and order status updates automatically

---

## 🧪 Testing M-Pesa Integration

### Postman Collection

Safaricom provides a Postman collection with pre-configured API requests. After clicking "Use API" on the M-Pesa Express page, you'll receive a JSON file (`Safaricom APIs.postman_collection.json`) that you can import into Postman.

**To use the Postman collection:**

1. **Import into Postman:**
   - Open Postman
   - Click **Import** button
   - Select the `Safaricom APIs.postman_collection.json` file
   - The collection will be imported with all API endpoints

2. **Key Endpoints in the Collection:**
   - **Generate an OAuth Access Token** - Get access token for authentication
   - **Initiate a Lipa na M-Pesa Online Payment** - STK Push initiation
   - **Query the status of a Lipa na M-Pesa Online Payment** - Check payment status

3. **Setting Up Variables:**
   - The collection uses variables like `{{access_token}}` and `{{apigee-token}}`
   - Set these in Postman's environment variables or collection variables
   - For sandbox, use your Consumer Key and Consumer Secret

4. **Testing STK Push:**
   - First, run "Generate an OAuth Access Token" to get a token
   - Copy the token and set it as `{{access_token}}` variable
   - Then run "Initiate a Lipa na M-Pesa Online Payment" with test data:
     ```json
     {
       "BusinessShortCode": "174379",
       "Password": "base64_encoded_password",
       "Timestamp": "20250925124519",
       "Amount": "1",
       "PartyA": "254708374149",
       "PartyB": "174379",
       "TransactionType": "CustomerPayBillOnline",
       "PhoneNumber": "254708374149",
       "TransactionDesc": "Test",
       "AccountReference": "Test",
       "CallBackURL": "https://your-ngrok-url.ngrok.io/api/v1/payment/mpesa/callback"
     }
     ```

**Note**: The Postman collection is useful for:
- Testing API endpoints directly
- Understanding request/response formats
- Debugging integration issues
- Learning API structure

However, your SwiftCart implementation already handles all of this automatically through the `mpesaService.ts` file.

### Test in Sandbox Environment

1. **Start the backend server:**
   ```bash
   # From root directory
   pnpm dev:backend
   
   # Or from backend directory
   cd swiftcart-backend
   pnpm dev
   ```

2. **Start ngrok tunnel:**
   ```bash
   ngrok http 3000
   ```
   Copy the HTTPS URL and update `.env` and Developer Portal callback URL.

3. **Start the frontend server:**
   ```bash
   # From root directory
   pnpm dev:frontend
   
   # Or from frontend directory
   cd swiftcart-frontend
   pnpm dev
   ```

4. **Test Payment Flow:**
   - Navigate to `http://localhost:8080`
   - Add items to cart
   - Go to checkout
   - Fill in shipping address
   - Enter test phone number: `254708374149`
   - Click "Initiate M-Pesa Payment"
   - Check your phone for STK Push prompt
   - Enter test PIN: `174379` (sandbox test PIN)
   - Verify payment is processed

### Test Phone Numbers (Sandbox)

- **Phone Number**: `254708374149`
- **M-Pesa PIN**: `174379`
- **Shortcode**: `174379`

**Note**: These are test credentials. Real money is not transferred in sandbox mode.

### Test Callback Manually

You can test the callback endpoint manually:

```bash
curl -X POST http://localhost:3000/api/v1/payment/mpesa/callback \
  -H "Content-Type: application/json" \
  -d '{
    "Body": {
      "stkCallback": {
        "MerchantRequestID": "test-merchant-request-id",
        "CheckoutRequestID": "test-checkout-request-id",
        "ResultCode": 0,
        "ResultDesc": "The service request is processed successfully.",
        "CallbackMetadata": {
          "Item": [
            {"Name": "Amount", "Value": 100},
            {"Name": "MpesaReceiptNumber", "Value": "ABC123XYZ"},
            {"Name": "PhoneNumber", "Value": "254712345678"},
            {"Name": "TransactionDate", "Value": "20231205123456"}
          ]
        }
      }
    }
  }'
```

Expected response:
```json
{
  "ResultCode": 0,
  "ResultDesc": "Callback processed successfully"
}
```

---

## 🔒 Security Considerations

1. **Never commit `.env` file** - Keep M-Pesa credentials secure
2. **Use HTTPS in production** - M-Pesa requires secure connections for callbacks
3. **Validate callback signatures** - Verify callbacks are from Safaricom (implement if needed)
4. **Rotate credentials regularly** - Change M-Pesa credentials periodically
5. **Monitor transactions** - Watch for suspicious payment activity
6. **Rate limiting** - Already implemented on checkout endpoints
7. **Phone number validation** - System validates phone number format
8. **Transaction logging** - All transactions are logged for audit trail

---

## 🐛 Troubleshooting

### "Invalid Consumer Key/Secret" Error

- Verify Consumer Key and Consumer Secret are correct
- Check if credentials are for the right environment (sandbox vs production)
- Ensure credentials are copied without extra spaces
- Regenerate credentials in Developer Portal if needed

### "Callback URL Not Accessible" Error

- Ensure ngrok is running and accessible
- Verify callback URL in Developer Portal matches ngrok URL exactly
- Check if backend server is running on port 3000
- Test callback URL manually with curl

### "STK Push Not Received" Error

- Verify phone number format (must be 254XXXXXXXXX)
- Check if phone number is registered with M-Pesa
- Ensure sufficient M-Pesa balance (for production)
- Check Developer Portal for any API errors
- Verify STK Push is enabled in your app configuration

### "Transaction Status Not Updating" Error

- Check backend logs for callback errors
- Verify callback endpoint is accessible
- Check MongoDB connection
- Verify transaction record exists in database
- Check order status update logic

### "Amount Mismatch" Error

- Verify order total matches payment amount
- Check for currency conversion issues
- Ensure amount is sent as integer (M-Pesa requirement)
- Check order calculation logic

### Callback Not Working

- Check backend logs for errors
- Verify callback URL is correct in Developer Portal
- Ensure callback endpoint accepts POST requests
- Check CORS settings
- Verify callback handler is registered in routes
- Test callback endpoint manually

### ngrok URL Changes

If ngrok URL changes (free tier):
1. Update `.env` with new ngrok URL
2. Update callback URL in Developer Portal
3. Restart backend server
4. Test payment flow again

**Tip**: Use ngrok paid plan for static domain, or deploy to staging server for stable callback URL.

---

## 📝 API Endpoints

### M-Pesa Express API (Safaricom)

**Environments:**
- **Sandbox**: `https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`
- **Production**: `https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest`

**Request Body:**
```json
{
  "BusinessShortCode": 174379,
  "Password": "base64_encoded_string",
  "Timestamp": "20210628092408",
  "TransactionType": "CustomerPayBillOnline",
  "Amount": "1",
  "PartyA": "254722000000",
  "PartyB": "174379",
  "PhoneNumber": "254722111111",
  "CallBackURL": "https://mydomain.com/path",
  "AccountReference": "accountref",
  "TransactionDesc": "txndesc"
}
```

**Request Parameters:**
- `BusinessShortCode`: M-PESA Shortcode (5-6 digits)
- `Password`: Base64 encoded (Shortcode + Passkey + Timestamp)
- `Timestamp`: Format YYYYMMDDHHmmss
- `TransactionType`: `CustomerPayBillOnline` (PayBill) or `CustomerBuyGoodsOnline` (Till)
- `Amount`: Transaction amount (numeric)
- `PartyA`: Phone number sending money (2547XXXXXXXX)
- `PartyB`: Organization receiving funds (shortcode)
- `PhoneNumber`: Mobile number to receive USSD prompt (2547XXXXXXXX)
- `CallBackURL`: URL for payment result callback
- `AccountReference`: Alpha-numeric identifier (max 12 characters)
- `TransactionDesc`: Additional information (max 13 characters)

### SwiftCart Payment Endpoints

- **Initiate Payment**: `POST /api/v1/payment/initiate`
  - Requires authentication
  - Body: `{ orderId, phoneNumber, gateway }`
  - Returns: Transaction and STK Push details

- **M-Pesa Callback**: `POST /api/v1/payment/mpesa/callback`
  - Public endpoint (called by Safaricom)
  - Receives payment confirmation
  - Updates transaction and order status

- **Get Transaction Status**: `GET /api/v1/payment/transaction/:transactionId`
  - Requires authentication
  - Returns: Transaction status and order details

- **Get Order Payment Status**: `GET /api/v1/payment/order/:orderId/status`
  - Requires authentication
  - Returns: Order payment status and transaction history

### Order Endpoints

- **Create Order**: `POST /api/v1/orders`
  - Requires authentication
  - Body: `{ items, shippingAddress, notes }`
  - Returns: Created order

- **Get Orders**: `GET /api/v1/orders`
  - Requires authentication
  - Query params: `page`, `limit`, `status`
  - Returns: List of user's orders

- **Get Order**: `GET /api/v1/orders/:orderId`
  - Requires authentication
  - Returns: Order details

---

## 💰 Pricing & Limits

### Sandbox Environment

- **Free**: Unlimited testing
- **No real money**: Transactions are simulated
- **Test credentials**: Provided by Safaricom

### Production Environment

- **Transaction Fee**: Varies by transaction amount (check Safaricom pricing)
- **Minimum Amount**: KSh 1
- **Maximum Amount**: KSh 70,000 per transaction
- **Daily Limit**: Varies by account tier
- **Monthly Limit**: Varies by account tier

**Note**: Check current M-Pesa pricing and limits on Safaricom's website.

---

## 🔄 Payment Flow Details

### 1. Order Creation
- Customer creates order with items and shipping address
- Order status: `pending`
- Order total calculated (subtotal + shipping)

### 2. Payment Initiation
- Customer initiates M-Pesa payment
- System creates transaction record
- STK Push sent to customer's phone
- Transaction status: `pending`

### 3. Customer Payment
- Customer receives STK Push prompt
- Customer enters M-Pesa PIN
- Payment processed by Safaricom

### 4. Callback Processing
- Safaricom sends callback to your server
- System processes callback
- Transaction status updated: `success` or `failed`
- Order status updated: `processing` (if successful)

### 5. Payment Verification
- Customer can check payment status
- System queries M-Pesa for latest status if needed
- Order moves to fulfillment

---

## 📊 Transaction Statuses

- **pending**: Payment initiated, waiting for customer confirmation
- **success**: Payment completed successfully
- **failed**: Payment failed or was cancelled
- **cancelled**: Payment was cancelled by customer or system

---

## 🎯 Best Practices

1. **Always validate phone numbers** - Ensure correct format (254XXXXXXXXX)
2. **Handle timeouts** - STK Push can timeout, implement retry logic
3. **Log all transactions** - Maintain complete audit trail
4. **Monitor callbacks** - Set up alerts for failed callbacks
5. **Test thoroughly** - Test all payment scenarios before production
6. **Implement retry logic** - Allow customers to retry failed payments
7. **Clear error messages** - Provide user-friendly error messages
8. **Status polling** - Poll for payment status if callback delayed
9. **Secure credentials** - Never expose M-Pesa credentials
10. **Regular testing** - Test payment flow regularly

---

## 📚 Additional Resources

- [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
- [M-Pesa API Documentation](https://developer.safaricom.co.ke/docs)
- [M-Pesa Express API Reference](https://developer.safaricom.co.ke/APIs/MpesaExpress) (Lipa na M-Pesa Online / STK Push)
- [Authorization API](https://developer.safaricom.co.ke/APIs/Authorization) (Get Access Token)
- [M-Pesa Business Pricing](https://www.safaricom.co.ke/business/m-pesa/business-solutions/m-pesa-for-business)
- [ngrok Documentation](https://ngrok.com/docs)

## 🔑 Important Notes

### Password Generation

The password parameter must be Base64 encoded using the format:
```
base64.encode(BusinessShortCode + Passkey + Timestamp)
```

Example:
- BusinessShortCode: `174379`
- Passkey: `bfb279f9aa9bdbcf158e97dd71a467cd2e05cbc`
- Timestamp: `20210628092408`
- Password: `MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjEwNjI4MDkyNDA4`

### Transaction Types

- **CustomerPayBillOnline**: Use for PayBill Numbers (e.g., 174379)
- **CustomerBuyGoodsOnline**: Use for Till Numbers

### Phone Number Format

All phone numbers must be in the format: `2547XXXXXXXX` (12 digits total)
- Starts with country code `254`
- Followed by 9 digits (Safaricom number)

### Account Reference & Transaction Description

- **AccountReference**: Max 12 characters (alpha-numeric)
- **TransactionDesc**: Max 13 characters

### Asynchronous API

This API is asynchronous. The response you receive immediately is just an acknowledgment. The actual payment result comes via the callback URL. Always implement proper callback handling.

---

## ✅ Verification Checklist

Before going to production, ensure:

- [ ] Sandbox testing completed successfully
- [ ] Production credentials obtained
- [ ] Callback URL configured correctly
- [ ] Environment variables set correctly
- [ ] Error handling tested
- [ ] Transaction logging verified
- [ ] Order status updates working
- [ ] Payment verification tested
- [ ] Security measures in place
- [ ] Monitoring and alerts configured

---

**Note**: M-Pesa integration is production-ready. Ensure you have valid credentials and proper callback URL configuration before processing real payments. Test thoroughly in sandbox environment before deploying to production.

