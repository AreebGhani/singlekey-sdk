/**
 * Request Service - Handles screening request operations
 */

import { HttpClient } from '../core/http-client';
import {
  ScreeningRequestData,
  ScreeningRequestResponse,
  LandlordFormRequest,
  TenantFormRequest,
  DirectAPIRequest,
} from '../types';

/**
 * Service for creating and managing screening requests
 */
export class RequestService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Create a screening request
   *
   * @param data - Screening request data
   * @returns Screening request response with purchase_token and form URLs
   *
   * @example
   * ```typescript
   * // Form-based (landlord form)
   * const response = await client.request.create({
   *   external_customer_id: 'landlord-123',
   *   external_tenant_id: 'tenant-456',
   *   ll_first_name: 'John',
   *   ll_last_name: 'Smith',
   *   ll_email: 'john@example.com',
   *   ll_tel: '5551234567',
   *   ten_first_name: 'Jane',
   *   ten_last_name: 'Doe',
   *   ten_email: 'jane@example.com',
   * });
   * ```
   */
  async create(data: ScreeningRequestData): Promise<ScreeningRequestResponse> {
    return this.http.post<ScreeningRequestResponse>('/api/request', data);
  }

  /**
   * Create a landlord form-based request
   * Landlord completes most tenant information via hosted form
   *
   * @param data - Landlord form request data
   * @returns Screening request response with form_url
   */
  async createLandlordForm(data: LandlordFormRequest): Promise<ScreeningRequestResponse> {
    return this.create(data);
  }

  /**
   * Create a tenant form-based request
   * Tenant completes application via direct form
   *
   * @param data - Tenant form request data
   * @returns Screening request response with tenant_form_url
   *
   * @example
   * ```typescript
   * const response = await client.request.createTenantForm({
   *   external_customer_id: 'landlord-123',
   *   external_tenant_id: 'tenant-456',
   *   tenant_form: true,
   *   ten_email: 'tenant@example.com',
   *   purchase_address: '123 Main St, Toronto, ON, Canada, M5V 1A1',
   * });
   *
   * // Send tenant to response.tenant_form_url
   * ```
   */
  async createTenantForm(data: TenantFormRequest): Promise<ScreeningRequestResponse> {
    return this.create(data);
  }

  /**
   * Create a direct API request with immediate processing
   * All tenant data provided upfront, no forms required
   *
   * @param data - Direct API request data with full tenant information
   * @returns Screening request response, screening begins immediately
   *
   * @example
   * ```typescript
   * const response = await client.request.createDirect({
   *   external_customer_id: 'landlord-123',
   *   external_tenant_id: 'tenant-456',
   *   run_now: true,
   *   ll_first_name: 'John',
   *   ll_last_name: 'Smith',
   *   ll_email: 'john@example.com',
   *   ten_first_name: 'Jane',
   *   ten_last_name: 'Doe',
   *   ten_email: 'jane@example.com',
   *   ten_tel: '5551234567',
   *   ten_dob_year: 1990,
   *   ten_dob_month: 6,
   *   ten_dob_day: 15,
   *   ten_address: '456 Oak Ave, Toronto, ON, Canada, M5V 2B3',
   *   ten_sin: '123456789',
   * });
   * ```
   */
  async createDirect(data: DirectAPIRequest): Promise<ScreeningRequestResponse> {
    return this.create(data);
  }
}
