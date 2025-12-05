import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';
import { env } from '../config/env';
import logger from '../utils/logger';
import { createError } from '../middleware/errorHandler';

export interface STKPushRequest {
  phoneNumber: string; // Format: 254712345678
  amount: number;
  accountReference: string; // Order ID or transaction reference
  transactionDesc: string; // Description of the transaction
}

export interface STKPushResponse {
  MerchantRequestID: string;
  CheckoutRequestID: string;
  ResponseCode: string;
  ResponseDescription: string;
  CustomerMessage: string;
}

export interface STKPushCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: Array<{
          Name: string;
          Value: string | number;
        }>;
      };
    };
  };
}

export interface MpesaAccessToken {
  access_token: string;
  expires_in: number;
}

class MpesaService {
  private axiosInstance: AxiosInstance;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    const baseURL =
      env.MPESA_ENVIRONMENT === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';

    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Get M-Pesa OAuth access token
   */
  private async getAccessToken(): Promise<string> {
    // Check if token is still valid (with 5 minute buffer)
    if (this.accessToken && Date.now() < this.tokenExpiry - 5 * 60 * 1000) {
      return this.accessToken;
    }

    try {
      const consumerKey = env.MPESA_CONSUMER_KEY;
      const consumerSecret = env.MPESA_CONSUMER_SECRET;

      if (!consumerKey || !consumerSecret) {
        throw createError(
          'M-Pesa credentials not configured',
          500,
          'MPESA_CONFIG_ERROR'
        );
      }

      const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
      const url = env.MPESA_ENVIRONMENT === 'production' 
        ? '/oauth/v1/generate?grant_type=client_credentials'
        : '/oauth/v1/generate?grant_type=client_credentials';

      const response = await this.axiosInstance.get<MpesaAccessToken>(url, {
        headers: {
          Authorization: `Basic ${auth}`,
        },
      });

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000;

      logger.info('M-Pesa access token obtained', {
        expiresIn: response.data.expires_in,
      });

      return this.accessToken;
    } catch (error: any) {
      logger.error('Failed to get M-Pesa access token', {
        error: error.message,
        response: error.response?.data,
      });
      throw createError(
        'Failed to authenticate with M-Pesa',
        500,
        'MPESA_AUTH_ERROR',
        error.response?.data
      );
    }
  }

  /**
   * Generate password for STK Push (Base64 encoded)
   */
  private generatePassword(): string {
    const shortcode = env.MPESA_SHORTCODE;
    const passkey = env.MPESA_PASSKEY;
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);

    const password = Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
    return password;
  }

  /**
   * Get timestamp for STK Push (YYYYMMDDHHmmss format)
   */
  private getTimestamp(): string {
    return new Date()
      .toISOString()
      .replace(/[^0-9]/g, '')
      .slice(0, -3);
  }

  /**
   * Format phone number to M-Pesa format (254XXXXXXXXX)
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');

    // Convert to M-Pesa format
    if (cleaned.startsWith('0')) {
      // Kenyan number starting with 0
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('+254')) {
      // Kenyan number with +254
      cleaned = cleaned.substring(1);
    } else if (!cleaned.startsWith('254')) {
      // Assume it's a Kenyan number without country code
      cleaned = '254' + cleaned;
    }

    // Validate length (should be 12 digits: 254 + 9 digits)
    if (cleaned.length !== 12) {
      throw createError(
        'Invalid phone number format. Use format: 254712345678',
        400,
        'INVALID_PHONE_NUMBER'
      );
    }

    return cleaned;
  }

  /**
   * Initiate STK Push payment
   */
  async initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
    try {
      const accessToken = await this.getAccessToken();
      const phoneNumber = this.formatPhoneNumber(request.phoneNumber);
      const shortcode = env.MPESA_SHORTCODE;
      const passkey = env.MPESA_PASSKEY;

      if (!shortcode || !passkey) {
        throw createError(
          'M-Pesa shortcode and passkey not configured',
          500,
          'MPESA_CONFIG_ERROR'
        );
      }

      const timestamp = this.getTimestamp();
      const password = this.generatePassword();

      // Callback URL - should be your backend endpoint
      // In production, this should be your actual backend URL
      const backendUrl = process.env.BACKEND_URL || `http://localhost:${env.PORT}`;
      const callbackUrl = `${backendUrl}/api/v1/payment/mpesa/callback`;

      const stkPushUrl = env.MPESA_ENVIRONMENT === 'production'
        ? '/mpesa/stkpush/v1/processrequest'
        : '/mpesa/stkpush/v1/processrequest';

      const payload = {
        BusinessShortCode: parseInt(shortcode),
        Password: password,
        Timestamp: timestamp,
        TransactionType: 'CustomerPayBillOnline',
        Amount: Math.floor(request.amount), // M-Pesa requires integer amount
        PartyA: phoneNumber,
        PartyB: parseInt(shortcode),
        PhoneNumber: phoneNumber,
        CallBackURL: callbackUrl,
        AccountReference: request.accountReference.substring(0, 12), // Max 12 chars
        TransactionDesc: request.transactionDesc.substring(0, 13), // Max 13 chars
      };

      logger.info('Initiating STK Push', {
        phoneNumber: phoneNumber.substring(0, 3) + '****' + phoneNumber.substring(7), // Masked
        amount: request.amount,
        accountReference: request.accountReference,
      });

      const response = await this.axiosInstance.post<STKPushResponse>(
        stkPushUrl,
        payload,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.data.ResponseCode !== '0') {
        logger.error('STK Push failed', {
          responseCode: response.data.ResponseCode,
          responseDescription: response.data.ResponseDescription,
        });
        throw createError(
          response.data.ResponseDescription || 'STK Push request failed',
          400,
          'MPESA_STK_PUSH_ERROR',
          {
            responseCode: response.data.ResponseCode,
            merchantRequestID: response.data.MerchantRequestID,
            checkoutRequestID: response.data.CheckoutRequestID,
          }
        );
      }

      logger.info('STK Push initiated successfully', {
        merchantRequestID: response.data.MerchantRequestID,
        checkoutRequestID: response.data.CheckoutRequestID,
      });

      return response.data;
    } catch (error: any) {
      logger.error('STK Push initiation error', {
        error: error.message,
        stack: error.stack,
        response: error.response?.data,
      });

      if (error.statusCode) {
        throw error;
      }

      throw createError(
        'Failed to initiate M-Pesa payment',
        500,
        'MPESA_ERROR',
        error.response?.data || error.message
      );
    }
  }

  /**
   * Query STK Push status
   */
  async querySTKStatus(checkoutRequestID: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();
      const shortcode = env.MPESA_SHORTCODE;
      const passkey = env.MPESA_PASSKEY;
      const timestamp = this.getTimestamp();
      const password = this.generatePassword();

      const queryUrl = env.MPESA_ENVIRONMENT === 'production'
        ? '/mpesa/stkpushquery/v1/query'
        : '/mpesa/stkpushquery/v1/query';

      const payload = {
        BusinessShortCode: parseInt(shortcode),
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID,
      };

      const response = await this.axiosInstance.post(queryUrl, payload, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error: any) {
      logger.error('STK Query error', {
        error: error.message,
        checkoutRequestID,
      });
      throw createError(
        'Failed to query STK Push status',
        500,
        'MPESA_QUERY_ERROR'
      );
    }
  }

  /**
   * Process M-Pesa callback
   */
  processCallback(callback: STKPushCallback): {
    merchantRequestID: string;
    checkoutRequestID: string;
    resultCode: number;
    resultDesc: string;
    receiptNumber?: string;
    amount?: number;
    phoneNumber?: string;
    transactionDate?: string;
  } {
    const stkCallback = callback.Body.stkCallback;
    const result: any = {
      merchantRequestID: stkCallback.MerchantRequestID,
      checkoutRequestID: stkCallback.CheckoutRequestID,
      resultCode: stkCallback.ResultCode,
      resultDesc: stkCallback.ResultDesc,
    };

    // Extract metadata if payment was successful
    if (stkCallback.ResultCode === 0 && stkCallback.CallbackMetadata) {
      const metadata = stkCallback.CallbackMetadata.Item;
      metadata.forEach((item) => {
        switch (item.Name) {
          case 'MpesaReceiptNumber':
            result.receiptNumber = String(item.Value);
            break;
          case 'Amount':
            result.amount = Number(item.Value);
            break;
          case 'PhoneNumber':
            result.phoneNumber = String(item.Value);
            break;
          case 'TransactionDate':
            result.transactionDate = String(item.Value);
            break;
        }
      });
    }

    return result;
  }
}

export const mpesaService = new MpesaService();

