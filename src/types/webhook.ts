/**
 * Type definitions for Webhook payloads
 */

import { AddressString, Currency, PaymentMethodType, CardBrand, Recommendation } from './common';

/**
 * Base webhook payload structure
 */
export interface BaseWebhookPayload {
  /** Event type identifier */
  event: string;
  /** ISO 8601 timestamp when event occurred */
  timestamp: string;
  /** Unique identifier for this webhook delivery */
  webhook_id: string;
  /** API version for future compatibility */
  api_version: string;
  /** Event-specific payload data */
  data: Record<string, any>;
}

/**
 * Common data fields in webhook payloads
 */
export interface CommonWebhookData {
  /** Unique screening identifier */
  purchase_token: string;
  /** Your landlord ID */
  external_customer_id: string;
  /** Your tenant ID */
  external_tenant_id: string;
  /** Your deal/transaction ID (if provided) */
  external_deal_id?: string;
  /** Your listing ID (if provided) */
  external_listing_id?: string;
}

/**
 * Tenant information in webhook
 */
export interface WebhookTenant {
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Landlord information in webhook
 */
export interface WebhookLandlord {
  email: string;
  first_name: string;
  last_name: string;
}

/**
 * Property information in webhook
 */
export interface WebhookProperty {
  address: AddressString;
  rent: number;
  unit?: string;
}

/**
 * Screening result information
 */
export interface WebhookResult {
  status: 'completed';
  singlekey_score: number | null;
  recommendation: Recommendation;
  pdf_ready: boolean;
}

/**
 * Cost information in webhook
 */
export interface WebhookCost {
  amount: number;
  tax: number;
  currency: Currency;
}

/**
 * Report links in webhook
 */
export interface WebhookLinks {
  report: string;
  pdf: string;
}

/**
 * Payment method in webhook
 */
export interface WebhookPaymentMethod {
  type: PaymentMethodType;
  brand: CardBrand;
  last_4: string;
}

/**
 * Payment information in webhook
 */
export interface WebhookPayment {
  amount: number;
  tax: number;
  total: number;
  currency: Currency;
  method: WebhookPaymentMethod;
  paid_by: 'landlord' | 'tenant';
}

/**
 * screening.completed event payload
 */
export interface ScreeningCompletedPayload extends BaseWebhookPayload {
  event: 'screening.completed';
  data: CommonWebhookData & {
    tenant: WebhookTenant;
    landlord: WebhookLandlord;
    property: WebhookProperty;
    result: WebhookResult;
    cost: WebhookCost;
    links: WebhookLinks;
    created_at: string;
    completed_at: string;
  };
}

/**
 * screening.submitted event payload
 */
export interface ScreeningSubmittedPayload extends BaseWebhookPayload {
  event: 'screening.submitted';
  data: CommonWebhookData & {
    tenant: WebhookTenant;
    status: 'processing';
    submitted_at: string;
    estimated_completion: string;
  };
}

/**
 * screening.payment_captured event payload
 */
export interface ScreeningPaymentCapturedPayload extends BaseWebhookPayload {
  event: 'screening.payment_captured';
  data: CommonWebhookData & {
    payment: WebhookPayment;
    charged_at: string;
  };
}

/**
 * screening.failed event payload
 */
export interface ScreeningFailedPayload extends BaseWebhookPayload {
  event: 'screening.failed';
  data: CommonWebhookData & {
    status: 'failed';
    reason: string;
    errors: string[];
  };
}

/**
 * form.opened event payload
 */
export interface FormOpenedPayload extends BaseWebhookPayload {
  event: 'form.opened';
  data: CommonWebhookData & {
    tenant_email: string;
  };
}

/**
 * invite.sent event payload
 */
export interface InviteSentPayload extends BaseWebhookPayload {
  event: 'invite.sent';
  data: CommonWebhookData & {
    tenant_email: string;
    invite_type: string;
  };
}

/**
 * Union type for all webhook payloads
 */
export type WebhookPayload =
  | ScreeningCompletedPayload
  | ScreeningSubmittedPayload
  | ScreeningPaymentCapturedPayload
  | ScreeningFailedPayload
  | FormOpenedPayload
  | InviteSentPayload;

/**
 * Webhook headers sent by SingleKey
 */
export interface WebhookHeaders {
  'content-type': 'application/json';
  'x-singlekey-signature': string;
  'x-singlekey-event': string;
  'x-singlekey-timestamp': string;
  'user-agent': 'SingleKey-Webhook/1.0';
}

/**
 * Webhook verification options
 */
export interface WebhookVerificationOptions {
  /** Webhook secret for signature verification */
  secret: string;
  /** Maximum age of webhook in seconds (default: 300) */
  tolerance?: number;
}
