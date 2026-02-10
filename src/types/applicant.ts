/**
 * Type definitions for Applicant API
 */

import { AddressString, BaseResponse } from './common';

/**
 * Address with move-in/out dates
 */
export interface ApplicantAddress {
  /** Full address string */
  address: AddressString;
  /** Move-in date (ISO format or date string) */
  move_in_date: string | null;
  /** Move-out date (ISO format or date string), null if current */
  move_out_date: string | null;
  /** Monthly rent at this address */
  rent: number | null;
}

/**
 * Employment information
 */
export interface ApplicantEmployment {
  /** Employer name */
  employer: string;
  /** Job title */
  job_title: string;
  /** Length of employment (e.g., "3 years") */
  employment_length: string;
  /** Annual income from this employment */
  income: number;
}

/**
 * Pet information
 */
export interface ApplicantPet {
  /** Type of pet (e.g., "dog", "cat") */
  type: string;
  /** Breed */
  breed?: string;
  /** Pet's name */
  name?: string;
}

/**
 * Vehicle information
 */
export interface ApplicantVehicle {
  /** Vehicle make */
  make: string;
  /** Vehicle model */
  model: string;
  /** Vehicle year */
  year: number;
}

/**
 * Declaration responses
 */
export interface ApplicantDeclarations {
  /** Is a smoker */
  smoking: boolean;
  /** Has declared bankruptcy */
  bankruptcy: boolean;
  /** Has been evicted */
  eviction: boolean;
  /** Has history of non-payment */
  non_payment: boolean;
}

/**
 * Co-occupant information (detailed response only)
 */
export interface CoOccupant {
  /** First name */
  first_name: string;
  /** Last name */
  last_name: string;
  /** Relationship to applicant */
  relationship: string;
  /** Date of birth */
  date_of_birth: string;
  /** Annual income */
  income?: number;
}

/**
 * Guarantor information (detailed response only)
 */
export interface Guarantor {
  /** First name */
  first_name: string;
  /** Last name */
  last_name: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
  /** Relationship to applicant */
  relationship: string;
  /** Address */
  address: AddressString;
}

/**
 * Income source (detailed response only)
 */
export interface IncomeSource {
  /** Source type (e.g., "employment", "investment") */
  source: string;
  /** Amount */
  amount: number;
  /** Frequency (e.g., "annual", "monthly") */
  frequency: string;
}

/**
 * Query parameters for applicant request
 */
export interface ApplicantQueryParams {
  /** Include detailed info (co-occupants, guarantors, income sources) */
  detailed?: boolean;
  /** Include credit score in response */
  show_credit_score?: boolean;
}

/**
 * Basic applicant information response
 */
export interface ApplicantInfoBasic extends BaseResponse {
  success: true;
  /** First name */
  first_name: string;
  /** Last name */
  last_name: string;
  /** Email address */
  email: string;
  /** Phone number */
  phone: string;
  /** Date of birth (ISO format) */
  date_of_birth: string;
  /** Current address with dates */
  current_address: ApplicantAddress;
  /** Previous addresses */
  previous_addresses: ApplicantAddress[];
  /** Employment history */
  employment: ApplicantEmployment[];
  /** Applicant's annual income */
  annual_income: number;
  /** Total household income */
  household_income: number;
  /** Pet information */
  pets: ApplicantPet[];
  /** Vehicle information */
  automobiles: ApplicantVehicle[];
  /** Declaration responses */
  declarations: ApplicantDeclarations;
}

/**
 * Detailed applicant information response (with detailed=true)
 */
export interface ApplicantInfoDetailed extends ApplicantInfoBasic {
  /** Co-occupants information */
  co_occupants: CoOccupant[];
  /** Guarantor information */
  guarantor?: Guarantor;
  /** Detailed income sources */
  income_sources: IncomeSource[];
}

/**
 * Applicant information with credit score (with show_credit_score=true)
 */
export interface ApplicantInfoWithScore extends ApplicantInfoBasic {
  /** Credit score (300-900) */
  credit_score: number;
}

/**
 * Detailed applicant information with credit score
 */
export interface ApplicantInfoDetailedWithScore extends ApplicantInfoDetailed {
  /** Credit score (300-900) */
  credit_score: number;
}

/**
 * Union type for all possible applicant responses
 */
export type ApplicantInfoResponse =
  | ApplicantInfoBasic
  | ApplicantInfoDetailed
  | ApplicantInfoWithScore
  | ApplicantInfoDetailedWithScore;
