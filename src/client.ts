/**
 * Main SingleKey SDK Client
 */

import { SingleKeyConfig } from './types';
import { ConfigurationError } from './errors';
import { HttpClient } from './core/http-client';
import { RequestService, ReportService, ApplicantService, PaymentService } from './services';

/**
 * SingleKey SDK Client
 *
 * Main entry point for interacting with the SingleKey Screening API
 *
 * @example
 * ```typescript
 * import { SingleKey } from '@singlekey/sdk';
 *
 * const client = new SingleKey({
 *   apiToken: process.env.SINGLEKEY_API_TOKEN!,
 *   environment: 'sandbox'
 * });
 *
 * // Create a screening request
 * const request = await client.request.createTenantForm({
 *   external_customer_id: 'landlord-123',
 *   external_tenant_id: 'tenant-456',
 *   tenant_form: true,
 *   ten_email: 'tenant@example.com',
 *   purchase_address: '123 Main St, Toronto, ON, Canada, M5V 1A1'
 * });
 *
 * // Get screening report
 * const report = await client.report.get(request.purchase_token);
 *
 * // Download PDF
 * await client.report.downloadPDF(request.purchase_token, {
 *   outputPath: './report.pdf'
 * });
 * ```
 */
export class SingleKey {
  /** Request service for creating screening requests */
  public readonly request: RequestService;

  /** Report service for retrieving screening reports */
  public readonly report: ReportService;

  /** Applicant service for retrieving tenant information */
  public readonly applicant: ApplicantService;

  /** Payment service for managing payment methods */
  public readonly payment: PaymentService;

  private readonly http: HttpClient;
  private readonly config: SingleKeyConfig;

  /**
   * Create a new SingleKey SDK client
   *
   * @param config - SDK configuration
   * @throws {ConfigurationError} If configuration is invalid
   *
   * @example
   * ```typescript
   * // Production environment
   * const client = new SingleKey({
   *   apiToken: 'sk_live_...',
   *   environment: 'production'
   * });
   *
   * // Sandbox environment
   * const sandboxClient = new SingleKey({
   *   apiToken: 'sk_test_...',
   *   environment: 'sandbox'
   * });
   *
   * // Custom base URL
   * const customClient = new SingleKey({
   *   apiToken: 'your_token',
   *   baseUrl: 'https://custom.singlekey.com'
   * });
   * ```
   */
  constructor(config: SingleKeyConfig) {
    this.validateConfig(config);
    this.config = config;

    // Initialize HTTP client
    this.http = new HttpClient(config);

    // Initialize services
    this.request = new RequestService(this.http);
    this.report = new ReportService(this.http);
    this.applicant = new ApplicantService(this.http);
    this.payment = new PaymentService(this.http);
  }

  /**
   * Validate SDK configuration
   */
  private validateConfig(config: SingleKeyConfig): void {
    if (!config.apiToken) {
      throw new ConfigurationError('API token is required');
    }

    if (typeof config.apiToken !== 'string' || config.apiToken.trim().length === 0) {
      throw new ConfigurationError('API token must be a non-empty string');
    }

    if (config.environment && !['sandbox', 'production'].includes(config.environment)) {
      throw new ConfigurationError('Environment must be "sandbox" or "production"');
    }

    if (config.timeout && (config.timeout < 0 || !Number.isFinite(config.timeout))) {
      throw new ConfigurationError('Timeout must be a positive number');
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): Readonly<SingleKeyConfig> {
    return { ...this.config };
  }

  /**
   * Get the base URL being used
   */
  getBaseUrl(): string {
    if (this.config.baseUrl) {
      return this.config.baseUrl;
    }

    return this.config.environment === 'sandbox'
      ? 'https://sandbox.singlekey.com'
      : 'https://platform.singlekey.com';
  }
}

/**
 * Create a SingleKey SDK client instance
 *
 * Convenience function for creating a new SDK client
 *
 * @param config - SDK configuration
 * @returns SingleKey client instance
 *
 * @example
 * ```typescript
 * import { createClient } from '@singlekey/sdk';
 *
 * const client = createClient({
 *   apiToken: process.env.SINGLEKEY_API_TOKEN!,
 *   environment: 'production'
 * });
 * ```
 */
export function createClient(config: SingleKeyConfig): SingleKey {
  return new SingleKey(config);
}
