/**
 * Type definitions for Screening Request API
 */

import { AddressString, BaseResponse, ResidentialStatus } from './common';

/**
 * Base screening request fields (always required)
 */
export interface BaseRequestFields {
  /** Your unique identifier for the landlord/property manager */
  external_customer_id: string;
  /** Your unique identifier for the tenant/applicant */
  external_tenant_id: string;
  /** Webhook URL for receiving event notifications */
  callback_url?: string;
  /** Your unique deal/transaction identifier */
  external_deal_id?: string;
  /** Your unique property/listing identifier */
  external_property_id?: string;
}

/**
 * Landlord information fields
 */
export interface LandlordFields {
  /** Landlord's first name */
  ll_first_name: string;
  /** Landlord's last name */
  ll_last_name: string;
  /** Landlord's email address */
  ll_email: string;
  /** Landlord's phone number (10 digits) */
  ll_tel?: string;
  /** Landlord's address */
  ll_address?: AddressString;
  /** Role description (e.g., "Property Manager") */
  ll_description?: string;
  /** Number of properties managed */
  ll_n_properties?: number;
}

/**
 * Basic tenant information
 */
export interface BasicTenantFields {
  /** Tenant's first name */
  ten_first_name: string;
  /** Tenant's middle name(s) */
  ten_middle_names?: string;
  /** Tenant's last name */
  ten_last_name: string;
  /** Tenant's email address */
  ten_email: string;
  /** Tenant's phone number (10 digits) */
  ten_tel?: string;
}

/**
 * Tenant date of birth (required for direct API)
 */
export interface TenantDateOfBirth {
  /** Birth year (4 digits, e.g., 1990) */
  ten_dob_year: number;
  /** Birth month (1-12) */
  ten_dob_month: number;
  /** Birth day (1-31) */
  ten_dob_day: number;
}

/**
 * Tenant identification
 */
export interface TenantIdentification {
  /** Social Insurance Number (Canada) or SSN (USA) - 9 digits */
  ten_sin?: string;
  /** Driver's license number */
  ten_drivers_license_number?: string;
}

/**
 * Tenant current address information
 */
export interface TenantCurrentAddress {
  /** Current address */
  ten_address: AddressString;
  /** Unit/apartment number */
  ten_address_unit?: string;
  /** Year moved in */
  ten_address_year?: number;
  /** Month moved in (1-12) */
  ten_address_month?: number;
  /** Day moved in (1-31) */
  ten_address_day?: number;
  /** Residential status */
  address_residential_status?: ResidentialStatus;
}

/**
 * Current landlord reference
 */
export interface CurrentLandlordReference {
  /** Current landlord's name */
  current_ll_name?: string;
  /** Current landlord's email */
  current_ll_email?: string;
  /** Current landlord's phone */
  current_ll_tel?: string;
  /** Permission to contact current landlord */
  agree_to_contact_current_ll?: boolean;
}

/**
 * Tenant previous address information
 */
export interface TenantPreviousAddress {
  /** Previous address */
  ten_prev_address?: AddressString;
  /** Year moved in to previous address */
  ten_prev_address_year?: number;
  /** Month moved in to previous address */
  ten_prev_address_month?: number;
  /** Day moved in to previous address */
  ten_prev_address_day?: number;
  /** Residential status at previous address */
  prev_address_residential_status?: ResidentialStatus;
}

/**
 * Previous landlord reference
 */
export interface PreviousLandlordReference {
  /** Previous landlord's name */
  prev_ll_name?: string;
  /** Previous landlord's email */
  prev_ll_email?: string;
  /** Previous landlord's phone */
  prev_ll_tel?: string;
  /** Permission to contact previous landlord */
  agree_to_contact_prev_ll?: boolean;
}

/**
 * Employment and income information
 */
export interface EmploymentIncome {
  /** Current job title */
  job_title?: string;
  /** Current employer name */
  employer?: string;
  /** Employer's website */
  employer_website?: string;
  /** Time with current employer */
  employment_length?: string;
  /** Tenant's annual income */
  income?: number;
  /** Partner's or co-applicant's combined annual income */
  partner_income?: number;
  /** Additional employment notes (max 250 chars) */
  additional_job_info?: string;
}

/**
 * Property information
 */
export interface PropertyFields {
  /** Property address for screening */
  purchase_address: AddressString;
  /** Monthly rent amount */
  purchase_rent?: number;
  /** Unit/apartment number */
  purchase_unit?: string;
}

/**
 * Vehicles and pets information
 */
export interface VehiclesPets {
  /** Tenant owns a vehicle */
  car?: boolean;
  /** Vehicle details (max 63 chars) */
  car_info?: string;
  /** Tenant has pets */
  pet?: boolean;
  /** Pet details (max 63 chars) */
  pet_info?: string;
}

/**
 * Declarations and background
 */
export interface Declarations {
  /** Tenant is a smoker */
  smoke?: boolean;
  /** Has declared bankruptcy */
  bankruptcy?: boolean;
  /** Bankruptcy details (max 63 chars) */
  bankruptcy_info?: string;
  /** Has been evicted */
  evicted?: boolean;
  /** Has refused to pay rent */
  refused_to_pay_rent?: boolean;
  /** Has felony conviction */
  felony?: boolean;
  /** Additional application notes (max 330 chars) */
  additional_info?: string;
}

/**
 * Control flags for request processing
 */
export interface RequestControlFlags {
  /** Process immediately with direct API (no forms) */
  run_now?: boolean;
  /** Use tenant form flow instead of landlord form */
  tenant_form?: boolean;
  /** Tenant provides payment instead of landlord */
  tenant_pays?: boolean;
  /** Force new report generation (bypass cache) */
  update?: boolean;
}

/**
 * Complete screening request with all possible fields
 */
export type ScreeningRequestData = BaseRequestFields &
  Partial<LandlordFields> &
  Partial<BasicTenantFields> &
  Partial<TenantDateOfBirth> &
  Partial<TenantIdentification> &
  Partial<TenantCurrentAddress> &
  Partial<CurrentLandlordReference> &
  Partial<TenantPreviousAddress> &
  Partial<PreviousLandlordReference> &
  Partial<EmploymentIncome> &
  Partial<PropertyFields> &
  Partial<VehiclesPets> &
  Partial<Declarations> &
  Partial<RequestControlFlags>;

/**
 * Form-based request (landlord form) - minimal required fields
 */
export interface LandlordFormRequest extends BaseRequestFields, LandlordFields, BasicTenantFields {
  run_now?: false;
  tenant_form?: false;
}

/**
 * Form-based request (tenant form) - minimal required fields
 */
export interface TenantFormRequest extends BaseRequestFields {
  tenant_form: true;
  ten_email: string;
  purchase_address: AddressString;
}

/**
 * Direct API request - all tenant data required
 */
export interface DirectAPIRequest
  extends BaseRequestFields,
    LandlordFields,
    BasicTenantFields,
    TenantDateOfBirth,
    TenantCurrentAddress {
  run_now: true;
  ten_tel: string;
  ten_sin?: string;
}

/**
 * Screening request response
 */
export interface ScreeningRequestResponse extends BaseResponse {
  success: true;
  /** Unique purchase token for this screening */
  purchase_token: string;
  /** Landlord form URL (if applicable) */
  form_url?: string;
  /** Tenant form URL (if applicable) */
  tenant_form_url?: string;
  /** Your landlord identifier (echoed back) */
  external_customer_id: string;
  /** Your tenant identifier (echoed back) */
  external_tenant_id: string;
  /** Status detail message */
  detail?: string;
}
