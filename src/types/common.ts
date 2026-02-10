/**
 * Common type definitions for SingleKey SDK
 */

/**
 * SDK Configuration options
 */
export interface SingleKeyConfig {
  /** API authentication token */
  apiToken: string;
  /** Environment: 'sandbox' or 'production' */
  environment?: 'sandbox' | 'production';
  /** Custom base URL (overrides environment) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Base API response
 */
export interface BaseResponse {
  success: boolean;
  detail?: string;
}

/**
 * API Error response
 */
export interface ErrorResponse extends BaseResponse {
  success: false;
  detail: string;
  errors?: string[];
}

/**
 * Generic success response with data
 */
export interface SuccessResponse extends BaseResponse {
  success: true;
  [key: string]: any;
}

/**
 * Currency codes
 */
export type Currency = 'CAD' | 'USD';

/**
 * Screening status values
 */
export type ScreeningStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'on_hold'
  | 'waiting_for_tenant'
  | 'waiting_for_landlord';

/**
 * Recommendation types
 */
export type Recommendation = 'approved' | 'conditional' | 'declined';

/**
 * Payment method types
 */
export type PaymentMethodType = 'card' | 'invoice';

/**
 * Card brands
 */
export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

/**
 * Residential status options
 */
export type ResidentialStatus =
  | 'Rent'
  | 'Own'
  | 'Live with parents/relatives'
  | 'Other';

/**
 * Webhook event types
 */
export type WebhookEventType =
  | 'screening.completed'
  | 'screening.submitted'
  | 'screening.payment_captured'
  | 'screening.failed'
  | 'form.opened'
  | 'invite.sent';

/**
 * Address format: "Street, City, Province/State, Country, Postal/Zip"
 */
export type AddressString = string;
