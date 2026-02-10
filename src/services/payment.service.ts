/**
 * Payment Service - Handles payment method operations
 */

import { HttpClient } from '../core/http-client';
import {
  GetPaymentMethodsResponse,
  AddPaymentMethodRequest,
  AddPaymentMethodResponse,
  PurchaseValidationResponse,
} from '../types';

/**
 * Service for managing payment methods and validating purchases
 */
export class PaymentService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get saved payment methods
   *
   * @returns Payment method information
   *
   * @example
   * ```typescript
   * const payment = await client.payment.getPaymentMethods();
   *
   * if (payment.has_payment_method) {
   *   console.log('Card on file:', payment.payment_method.brand, '****' + payment.payment_method.last_4);
   * } else {
   *   console.log('No payment method on file');
   * }
   * ```
   */
  async getPaymentMethods(): Promise<GetPaymentMethodsResponse> {
    return this.http.get<GetPaymentMethodsResponse>('/api/payments');
  }

  /**
   * Add a new payment method
   *
   * @param paymentData - Credit card information
   * @returns Added payment method details
   *
   * @example
   * ```typescript
   * const result = await client.payment.addPaymentMethod({
   *   card_number: '4242424242424242',
   *   exp_month: 12,
   *   exp_year: 2025,
   *   cvc: '123',
   *   name: 'John Smith'
   * });
   *
   * console.log('Payment method added:', result.payment_method.brand);
   * ```
   */
  async addPaymentMethod(paymentData: AddPaymentMethodRequest): Promise<AddPaymentMethodResponse> {
    return this.http.post<AddPaymentMethodResponse>('/api/payments', paymentData);
  }

  /**
   * Validate screening data before processing
   *
   * @param screeningId - Screening purchase ID to validate
   * @returns Validation result with any errors found
   *
   * @example
   * ```typescript
   * const validation = await client.payment.validatePurchase(12345);
   *
   * if (validation.success) {
   *   console.log('No errors found');
   * } else {
   *   console.log('Validation errors:', validation.errors);
   * }
   * ```
   */
  async validatePurchase(screeningId: number | string): Promise<PurchaseValidationResponse> {
    return this.http.post<PurchaseValidationResponse>(`/api/purchase_errors/${screeningId}`);
  }

  /**
   * Check if payment method is on file
   *
   * @returns True if payment method exists
   */
  async hasPaymentMethod(): Promise<boolean> {
    const response = await this.getPaymentMethods();
    return response.has_payment_method;
  }
}
