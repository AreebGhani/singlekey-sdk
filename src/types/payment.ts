/**
 * Type definitions for Payment API
 */

import { BaseResponse, CardBrand } from './common';

/**
 * Payment method information
 */
export interface PaymentMethod {
  /** Card brand (visa, mastercard, etc.) */
  brand: CardBrand;
  /** Last 4 digits of card number */
  last_4: string;
  /** Card expiration month (1-12) */
  exp_month: number;
  /** Card expiration year (YYYY) */
  exp_year: number;
}

/**
 * Get payment methods response
 */
export interface GetPaymentMethodsResponse extends BaseResponse {
  success: true;
  /** Whether a payment method is saved on file */
  has_payment_method: boolean;
  /** Payment method details if available */
  payment_method: PaymentMethod | null;
}

/**
 * Add payment method request
 */
export interface AddPaymentMethodRequest {
  /** Full credit card number */
  card_number: string;
  /** Expiration month (1-12) */
  exp_month: number;
  /** Expiration year (YYYY) */
  exp_year: number;
  /** Card security code (3-4 digits) */
  cvc: string;
  /** Cardholder name */
  name?: string;
}

/**
 * Add payment method success response
 */
export interface AddPaymentMethodResponse extends BaseResponse {
  success: true;
  detail: 'Payment method added successfully';
  /** Newly added payment method details */
  payment_method: PaymentMethod;
}

/**
 * Validation errors for purchase
 */
export interface PurchaseValidationResponse extends BaseResponse {
  success: boolean;
  detail: string;
  /** List of validation errors (empty if valid) */
  errors: string[];
  /** The screening purchase ID */
  purchase_id: number;
  /** The purchase token */
  token: string;
}
