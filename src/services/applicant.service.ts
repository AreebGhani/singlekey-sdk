/**
 * Applicant Service - Handles applicant information retrieval
 */

import { HttpClient } from '../core/http-client';
import { ApplicantInfoResponse, ApplicantQueryParams } from '../types';

/**
 * Service for retrieving applicant (tenant) information
 */
export class ApplicantService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get applicant information by purchase token
   *
   * @param purchaseToken - Purchase token from screening request
   * @param params - Query parameters for additional data
   * @returns Applicant information including contact, addresses, employment, etc.
   *
   * @example
   * ```typescript
   * // Basic applicant info
   * const applicant = await client.applicant.get('abc123...');
   * console.log(applicant.first_name, applicant.last_name);
   * console.log('Income:', applicant.annual_income);
   *
   * // Detailed info with credit score
   * const detailed = await client.applicant.get('abc123...', {
   *   detailed: true,
   *   show_credit_score: true
   * });
   * console.log('Co-occupants:', detailed.co_occupants);
   * console.log('Credit Score:', detailed.credit_score);
   * ```
   */
  async get(
    purchaseToken: string,
    params?: ApplicantQueryParams
  ): Promise<ApplicantInfoResponse> {
    const queryParams = new URLSearchParams();

    if (params?.detailed) {
      queryParams.append('detailed', 'true');
    }

    if (params?.show_credit_score) {
      queryParams.append('show_credit_score', 'true');
    }

    const queryString = queryParams.toString();
    const url = `/api/applicant/${purchaseToken}${queryString ? `?${queryString}` : ''}`;

    return this.http.get<ApplicantInfoResponse>(url);
  }

  /**
   * Get detailed applicant information including co-occupants and guarantors
   *
   * @param purchaseToken - Purchase token from screening request
   * @returns Detailed applicant information
   */
  async getDetailed(purchaseToken: string): Promise<ApplicantInfoResponse> {
    return this.get(purchaseToken, { detailed: true });
  }

  /**
   * Get applicant information with credit score
   *
   * @param purchaseToken - Purchase token from screening request
   * @returns Applicant information with credit score included
   */
  async getWithScore(purchaseToken: string): Promise<ApplicantInfoResponse> {
    return this.get(purchaseToken, { show_credit_score: true });
  }

  /**
   * Get complete applicant information with all details and credit score
   *
   * @param purchaseToken - Purchase token from screening request
   * @returns Complete applicant information
   */
  async getComplete(purchaseToken: string): Promise<ApplicantInfoResponse> {
    return this.get(purchaseToken, {
      detailed: true,
      show_credit_score: true,
    });
  }
}
