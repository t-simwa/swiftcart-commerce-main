# Postman Collection Setup Guide for M-Pesa Express

## 📋 Overview

After clicking "Use API" on the M-Pesa Express page in Safaricom Developer Portal, you receive a Postman collection JSON file. This guide explains how to use it to test your M-Pesa integration.

---

## 🔧 Importing the Collection

### Step 1: Import into Postman

1. **Open Postman** (download from [postman.com](https://www.postman.com/) if needed)
2. Click **Import** button (top left)
3. Select **File** tab
4. Choose the `Safaricom APIs.postman_collection.json` file
5. Click **Import**

The collection will appear in your Postman sidebar with all Safaricom API endpoints.

---

## 🔑 Setting Up Authentication

### Step 1: Generate Access Token

1. Find **"Generate an OAuth Access Token"** in the collection
2. Click on it to open the request
3. Set up Basic Auth:
   - **Username**: Your Consumer Key (from Developer Portal)
   - **Password**: Your Consumer Secret (from Developer Portal)
4. Click **Send**
5. Copy the `access_token` from the response

### Step 2: Set Collection Variables

1. Right-click on **"Safaricom APIs"** collection
2. Select **Edit**
3. Go to **Variables** tab
4. Add/edit variables:
   - `access_token`: Paste the token you copied
   - `apigee-token`: Same token (used by some requests)

**Or** set environment variables:
1. Click **Environments** in sidebar
2. Create new environment: "Safaricom Sandbox"
3. Add variables:
   - `access_token`: Your token
   - `apigee-token`: Your token
4. Select this environment from dropdown

---

## 📱 Testing M-Pesa Express (STK Push)

### Step 1: Initiate STK Push

1. Find **"Initiate a Lipa na M-Pesa Online Payment"** in the collection
2. Click on it to open the request
3. The request should have:
   - **Method**: POST
   - **URL**: `https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest`
   - **Headers**: 
     - `Authorization: Bearer {{access_token}}`
     - `Content-Type: application/json`

4. **Update the Request Body** with your test data:
   ```json
   {
     "BusinessShortCode": "174379",
     "Password": "MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjUwOTI1MTI0NTE5",
     "Timestamp": "20250925124519",
     "Amount": "1",
     "PartyA": "254708374149",
     "PartyB": "174379",
     "TransactionType": "CustomerPayBillOnline",
     "PhoneNumber": "254708374149",
     "TransactionDesc": "Test Payment",
     "AccountReference": "Test123",
     "CallBackURL": "https://your-ngrok-url.ngrok.io/api/v1/payment/mpesa/callback"
   }
   ```

5. **Important**: Update these values:
   - `Password`: Generate using `base64(Shortcode + Passkey + Timestamp)`
   - `Timestamp`: Current timestamp in format `YYYYMMDDHHmmss`
   - `CallBackURL`: Your ngrok URL or production callback URL
   - `PhoneNumber`: Test phone number (254708374149 for sandbox)

6. Click **Send**

7. **Expected Response**:
   ```json
   {
     "MerchantRequestID": "29115-34620561-1",
     "CheckoutRequestID": "ws_CO_1912202310203631234567890",
     "ResponseCode": "0",
     "ResponseDescription": "Success. Request accepted for processing",
     "CustomerMessage": "Success. Request accepted for processing"
   }
   ```

8. Check your test phone for STK Push prompt

### Step 2: Query Payment Status

1. Find **"Query the status of a Lipa na M-Pesa Online Payment"** in the collection
2. Use the `CheckoutRequestID` from Step 1
3. Update request body:
   ```json
   {
     "BusinessShortCode": "174379",
     "Password": "base64_encoded_password",
     "Timestamp": "20250925124519",
     "CheckoutRequestID": "ws_CO_1912202310203631234567890"
   }
   ```
4. Click **Send**

---

## 🔍 Understanding the Collection Structure

The Postman collection contains these main sections:

### M-Pesa Express Related:
- ✅ **Generate an OAuth Access Token** - Get authentication token
- ✅ **Initiate a Lipa na M-Pesa Online Payment** - STK Push
- ✅ **Query the status of a Lipa na M-Pesa Online Payment** - Check status

### Other APIs (Not needed for basic integration):
- B2B Payment Request
- B2C Payment Request
- Transaction Status Query
- Account Balance Query
- C2B Simulation
- Reversals
- And more...

**For SwiftCart, you only need the M-Pesa Express endpoints.**

---

## 🛠️ Generating Password Dynamically

The `Password` field needs to be Base64 encoded. In Postman, you can use Pre-request Script:

1. Open **"Initiate a Lipa na M-Pesa Online Payment"** request
2. Go to **Pre-request Script** tab
3. Add this script:

```javascript
// Set your credentials
const shortcode = "174379";
const passkey = "your_passkey_here"; // Get from simulator section

// Generate timestamp
const now = new Date();
const timestamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0');

// Generate password
const passwordString = shortcode + passkey + timestamp;
const password = btoa(passwordString); // Base64 encode

// Set variables
pm.environment.set("timestamp", timestamp);
pm.environment.set("password", password);
```

4. Update request body to use variables:
   ```json
   {
     "BusinessShortCode": "174379",
     "Password": "{{password}}",
     "Timestamp": "{{timestamp}}",
     ...
   }
   ```

---

## ✅ Testing Checklist

- [ ] Postman collection imported successfully
- [ ] Access token generated and set as variable
- [ ] STK Push request sent successfully
- [ ] Received `CheckoutRequestID` in response
- [ ] STK Push prompt appeared on test phone
- [ ] Payment completed on phone
- [ ] Callback received at your callback URL
- [ ] Payment status query works

---

## 🐛 Troubleshooting

### "Invalid Access Token" Error
- Regenerate access token (tokens expire after 1 hour)
- Ensure token is set correctly in variables
- Check Consumer Key/Secret are correct

### "Invalid Password" Error
- Regenerate password with current timestamp
- Ensure Passkey is correct (from simulator section)
- Check Base64 encoding is correct

### "STK Push Not Received"
- Verify phone number format (254XXXXXXXXX)
- Check phone number is registered with M-Pesa
- Ensure sufficient balance (for production)
- Verify shortcode is correct

### "Callback Not Working"
- Ensure ngrok is running (for local development)
- Verify callback URL is accessible
- Check callback URL matches exactly in request

---

## 📚 Additional Resources

- [Postman Documentation](https://learning.postman.com/docs/)
- [Safaricom Developer Portal](https://developer.safaricom.co.ke/)
- [M-Pesa Express API Docs](https://developer.safaricom.co.ke/APIs/MpesaExpress)

---

**Note**: The Postman collection is great for testing, but your SwiftCart implementation (`mpesaService.ts`) already handles all of this automatically. Use Postman to:
- Test API connectivity
- Debug issues
- Understand request/response formats
- Verify credentials work

Your production code handles password generation, timestamp creation, and token management automatically!

