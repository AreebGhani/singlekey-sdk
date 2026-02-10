/**
 * Type definitions for Report API
 */

import { BaseResponse, Currency, Recommendation, ScreeningStatus } from './common';

/**
 * Report cost information
 */
export interface ReportCost {
  /** Charge amount in cents */
  cost: number;
  /** Tax amount in cents */
  tax_collected: number;
  /** Currency code */
  currency: Currency;
}

/**
 * Report result information
 */
export interface ReportResult {
  /** Current status */
  status: ScreeningStatus;
  /** Credit score (300-900) or null */
  singlekey_score: number | null;
  /** Screening recommendation */
  recommendation?: Recommendation;
  /** Whether PDF report is available */
  pdf_report_ready: boolean;
}

/**
 * Report links
 */
export interface ReportLinks {
  /** S3 URL for PDF report (expires in 5 days) */
  report_url?: string;
  /** Web-viewable report URL */
  html_report_url?: string;
}

/**
 * Complete screening report response
 */
export interface ScreeningReportComplete extends BaseResponse, ReportCost, ReportLinks {
  success: true;
  /** Unique purchase token */
  purchase_token: string;
  /** Credit score (300-900) or null if not available */
  singlekey_score: number | null;
  /** Whether PDF is ready for download */
  pdf_report_ready: boolean;
  /** S3 URL for PDF report (expires in 5 days) */
  report_url?: string;
  /** Web-viewable report URL */
  html_report_url?: string;
  /** When screening was created */
  date_created: string;
  /** Your landlord identifier */
  external_customer_id: string;
  /** Your deal identifier */
  external_deal_id?: string;
  /** Landlord's email */
  landlord_email: string;
  /** Your tenant identifier */
  external_tenant_id: string;
  /** Tenant's email */
  tenant_email: string;
  /** Last 4 digits of payment card */
  credit_card_last_4?: string;
  /** Landlord provided tenant information */
  landlord_has_tenant_info: boolean;
  /** Tenant pays for screening */
  tenant_pays: boolean;
  /** Used embedded form flow */
  embedded_flow_request: boolean;
  /** Direct API without forms */
  api_only_purchase: boolean;
  /** Some data unavailable */
  partial: boolean;
}

/**
 * Report in progress response
 */
export interface ScreeningReportInProgress extends BaseResponse {
  success: true;
  purchase_token: string;
  detail: 'Report creation in progress';
  external_customer_id: string;
  external_tenant_id: string;
}

/**
 * Waiting for tenant submission
 */
export interface ScreeningReportWaitingTenant extends BaseResponse {
  success: false;
  purchase_token: string;
  detail: string;
  payment_status: string;
  form_url?: string;
  tenant_form_url?: string;
}

/**
 * Waiting for landlord submission
 */
export interface ScreeningReportWaitingLandlord extends BaseResponse {
  success: false;
  purchase_token: string;
  detail: 'Landlord has not submitted form';
  payment_status: string;
  form_url: string;
}

/**
 * Submission contains errors
 */
export interface ScreeningReportErrors extends BaseResponse {
  success: false;
  purchase_token: string;
  detail: 'Submission contains errors';
  errors: string[];
  form_url?: string;
}

/**
 * Union type for all possible report responses
 */
export type ScreeningReportResponse =
  | ScreeningReportComplete
  | ScreeningReportInProgress
  | ScreeningReportWaitingTenant
  | ScreeningReportWaitingLandlord
  | ScreeningReportErrors;

/**
 * Report PDF download options
 */
export interface DownloadPDFOptions {
  /** Output file path for saving PDF */
  outputPath?: string;
  /** Return PDF as buffer instead of saving to file */
  returnBuffer?: boolean;
}

/**
 * Report PDF response
 */
export interface ReportPDFResponse {
  /** PDF file data as buffer */
  data: Buffer;
  /** Suggested filename from server */
  filename: string;
  /** Content type */
  contentType: string;
}
