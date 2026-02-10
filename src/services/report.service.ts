/**
 * Report Service - Handles screening report operations
 */

import { promises as fs } from 'fs';
import { HttpClient } from '../core/http-client';
import {
  ScreeningReportResponse,
  DownloadPDFOptions,
  ReportPDFResponse,
  ScreeningReportComplete,
} from '../types';

/**
 * Service for retrieving screening reports and PDFs
 */
export class ReportService {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get screening report by purchase token
   *
   * @param purchaseToken - 32-character purchase token from screening request
   * @returns Screening report data (may be complete or in progress)
   *
   * @example
   * ```typescript
   * const report = await client.report.get('abc123def456...');
   *
   * if (report.success && 'singlekey_score' in report) {
   *   console.log('Score:', report.singlekey_score);
   *   console.log('Report URL:', report.report_url);
   * } else {
   *   console.log('Status:', report.detail);
   * }
   * ```
   */
  async get(purchaseToken: string): Promise<ScreeningReportResponse> {
    return this.http.get<ScreeningReportResponse>(`/api/report/${purchaseToken}`);
  }

  /**
   * Wait for screening report to complete with polling
   *
   * @param purchaseToken - Purchase token to poll
   * @param options - Polling options
   * @returns Complete screening report
   *
   * @example
   * ```typescript
   * const report = await client.report.waitForCompletion('abc123...', {
   *   maxAttempts: 60,
   *   intervalMs: 5000
   * });
   * console.log('Report completed with score:', report.singlekey_score);
   * ```
   */
  async waitForCompletion(
    purchaseToken: string,
    options: {
      /** Maximum number of polling attempts (default: 40) */
      maxAttempts?: number;
      /** Interval between polls in milliseconds (default: 10000) */
      intervalMs?: number;
    } = {}
  ): Promise<ScreeningReportComplete> {
    const maxAttempts = options.maxAttempts || 40;
    const intervalMs = options.intervalMs || 10000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const report = await this.get(purchaseToken);

      // Check if report is complete
      if (report.success && 'singlekey_score' in report) {
        return report as ScreeningReportComplete;
      }

      // Wait before next attempt
      if (attempt < maxAttempts - 1) {
        await this.sleep(intervalMs);
      }
    }

    throw new Error(
      `Report did not complete after ${maxAttempts} attempts (${(maxAttempts * intervalMs) / 1000}s)`
    );
  }

  /**
   * Download screening report PDF
   *
   * @param purchaseToken - Purchase token for the report
   * @param options - Download options
   * @returns PDF response with buffer and filename
   *
   * @example
   * ```typescript
   * // Save to file
   * await client.report.downloadPDF('abc123...', {
   *   outputPath: './reports/tenant_screening.pdf'
   * });
   *
   * // Get as buffer
   * const pdf = await client.report.downloadPDF('abc123...', {
   *   returnBuffer: true
   * });
   * // pdf.data is a Buffer
   * ```
   */
  async downloadPDF(
    purchaseToken: string,
    options: DownloadPDFOptions = {}
  ): Promise<ReportPDFResponse | void> {
    const response = await this.http.download(`/api/report_pdf/${purchaseToken}`);

    if (options.outputPath) {
      await fs.writeFile(options.outputPath, response.data);
      return;
    }

    if (options.returnBuffer) {
      return {
        data: response.data,
        filename: response.filename,
        contentType: response.contentType,
      };
    }

    // Default: save to current directory with server-provided filename
    await fs.writeFile(response.filename, response.data);
  }

  /**
   * Check if report is ready
   *
   * @param purchaseToken - Purchase token to check
   * @returns True if report is complete and ready
   */
  async isReady(purchaseToken: string): Promise<boolean> {
    try {
      const report = await this.get(purchaseToken);
      return report.success && 'singlekey_score' in report;
    } catch {
      return false;
    }
  }

  /**
   * Get report status message
   *
   * @param purchaseToken - Purchase token to check
   * @returns Human-readable status message
   */
  async getStatus(purchaseToken: string): Promise<string> {
    const report = await this.get(purchaseToken);
    return report.detail || 'Unknown status';
  }

  /**
   * Sleep utility for polling
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
