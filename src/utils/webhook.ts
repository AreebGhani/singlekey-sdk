/**
 * Webhook utilities for verifying and handling webhook events
 */

import * as crypto from 'crypto';
import { WebhookPayload, WebhookVerificationOptions, WebhookEventType } from '../types';
import { SingleKeyError } from '../errors';

/**
 * Error thrown when webhook verification fails
 */
export class WebhookVerificationError extends SingleKeyError {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookVerificationError';
    Object.setPrototypeOf(this, WebhookVerificationError.prototype);
  }
}

/**
 * Webhook handler for receiving and processing SingleKey webhook events
 */
export class WebhookHandler {
  private readonly secret?: string;
  private readonly tolerance: number;

  constructor(options?: WebhookVerificationOptions) {
    this.secret = options?.secret;
    this.tolerance = options?.tolerance || 300; // 5 minutes default
  }

  /**
   * Verify webhook signature to ensure authenticity
   *
   * @param payload - Raw webhook payload string
   * @param signature - X-SingleKey-Signature header value
   * @param timestamp - X-SingleKey-Timestamp header value
   * @returns True if signature is valid
   *
   * @example
   * ```typescript
   * const handler = new WebhookHandler({ secret: 'your_webhook_secret' });
   *
   * // In your webhook endpoint
   * const isValid = handler.verifySignature(
   *   req.body,
   *   req.headers['x-singlekey-signature'],
   *   req.headers['x-singlekey-timestamp']
   * );
   *
   * if (!isValid) {
   *   return res.status(401).send('Invalid signature');
   * }
   * ```
   */
  verifySignature(payload: string, signature: string, timestamp: string): boolean {
    if (!this.secret) {
      throw new WebhookVerificationError('Webhook secret not configured');
    }

    // Check timestamp to prevent replay attacks
    const currentTime = Math.floor(Date.now() / 1000);
    const webhookTime = parseInt(timestamp, 10);

    if (isNaN(webhookTime)) {
      throw new WebhookVerificationError('Invalid timestamp format');
    }

    if (Math.abs(currentTime - webhookTime) > this.tolerance) {
      throw new WebhookVerificationError('Webhook timestamp too old or from the future');
    }

    // Compute expected signature
    const signedPayload = `${timestamp}.${payload}`;
    const expectedSignature = crypto
      .createHmac('sha256', this.secret)
      .update(signedPayload, 'utf8')
      .digest('hex');

    // Use constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Parse and verify webhook payload
   *
   * @param rawPayload - Raw webhook payload string
   * @param signature - X-SingleKey-Signature header
   * @param timestamp - X-SingleKey-Timestamp header
   * @returns Parsed webhook payload
   *
   * @example
   * ```typescript
   * const handler = new WebhookHandler({ secret: 'your_secret' });
   *
   * const webhook = handler.parseWebhook(
   *   JSON.stringify(req.body),
   *   req.headers['x-singlekey-signature'],
   *   req.headers['x-singlekey-timestamp']
   * );
   *
   * if (webhook.event === 'screening.completed') {
   *   console.log('Screening completed:', webhook.data.purchase_token);
   * }
   * ```
   */
  parseWebhook(rawPayload: string, signature: string, timestamp: string): WebhookPayload {
    if (this.secret) {
      if (!this.verifySignature(rawPayload, signature, timestamp)) {
        throw new WebhookVerificationError('Invalid webhook signature');
      }
    }

    try {
      return JSON.parse(rawPayload) as WebhookPayload;
    } catch (error) {
      throw new WebhookVerificationError('Invalid webhook payload JSON');
    }
  }

  /**
   * Create a webhook event handler with type-safe callbacks
   *
   * @param handlers - Event-specific handler functions
   * @returns Handler function for processing webhooks
   *
   * @example
   * ```typescript
   * const processWebhook = handler.on({
   *   'screening.completed': (data) => {
   *     console.log('Score:', data.result.singlekey_score);
   *     // Type-safe access to screening.completed fields
   *   },
   *   'screening.failed': (data) => {
   *     console.error('Failed:', data.reason);
   *     // Type-safe access to screening.failed fields
   *   }
   * });
   *
   * // Use in your webhook endpoint
   * processWebhook(webhook);
   * ```
   */
  on(handlers: Partial<Record<WebhookEventType, (data: any) => void | Promise<void>>>) {
    return async (webhook: WebhookPayload) => {
      const handler = handlers[webhook.event as WebhookEventType];
      if (handler) {
        await handler(webhook.data);
      }
    };
  }
}

/**
 * Construct webhook signature (for testing)
 *
 * @param payload - Webhook payload string
 * @param secret - Webhook secret
 * @param timestamp - Unix timestamp
 * @returns HMAC-SHA256 signature
 */
export function constructWebhookSignature(
  payload: string,
  secret: string,
  timestamp?: number
): { signature: string; timestamp: string } {
  const ts = timestamp || Math.floor(Date.now() / 1000);
  const signedPayload = `${ts}.${payload}`;
  const signature = crypto.createHmac('sha256', secret).update(signedPayload, 'utf8').digest('hex');

  return {
    signature,
    timestamp: ts.toString(),
  };
}

/**
 * Express/Node.js middleware for handling SingleKey webhooks
 *
 * @param options - Webhook verification options
 * @returns Express middleware function
 *
 * @example
 * ```typescript
 * import express from 'express';
 * import { webhookMiddleware } from '@singlekey/sdk';
 *
 * const app = express();
 *
 * app.post('/webhooks/singlekey',
 *   express.raw({ type: 'application/json' }),
 *   webhookMiddleware({ secret: process.env.WEBHOOK_SECRET }),
 *   (req, res) => {
 *     const webhook = req.singlekeyWebhook;
 *     console.log('Event:', webhook.event);
 *     res.sendStatus(200);
 *   }
 * );
 * ```
 */
export function webhookMiddleware(options: WebhookVerificationOptions) {
  const handler = new WebhookHandler(options);

  return (req: any, res: any, next: any) => {
    try {
      const rawBody = req.body.toString('utf8');
      const signature = req.headers['x-singlekey-signature'] as string;
      const timestamp = req.headers['x-singlekey-timestamp'] as string;

      if (!signature || !timestamp) {
        return res.status(400).json({ error: 'Missing webhook headers' });
      }

      const webhook = handler.parseWebhook(rawBody, signature, timestamp);
      req.singlekeyWebhook = webhook;
      next();
    } catch (error) {
      if (error instanceof WebhookVerificationError) {
        return res.status(401).json({ error: error.message });
      }
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }
  };
}
