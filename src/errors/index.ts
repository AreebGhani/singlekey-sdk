/**
 * Custom error classes for SingleKey SDK
 */

import { ErrorResponse } from '../types';

/**
 * Base error class for all SingleKey SDK errors
 */
export class SingleKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SingleKeyError';
    Object.setPrototypeOf(this, SingleKeyError.prototype);
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends SingleKeyError {
  constructor(message = 'Invalid or missing API token') {
    super(message);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends SingleKeyError {
  public readonly errors: string[];

  constructor(message: string, errors: string[] = []) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Resource not found error (404)
 */
export class NotFoundError extends SingleKeyError {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends SingleKeyError {
  constructor(message = 'Rate limit exceeded. Please try again later.') {
    super(message);
    this.name = 'RateLimitError';
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
}

/**
 * Server error (500+)
 */
export class ServerError extends SingleKeyError {
  public readonly statusCode: number;

  constructor(message = 'Server error occurred', statusCode = 500) {
    super(message);
    this.name = 'ServerError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * API error with full response details
 */
export class APIError extends SingleKeyError {
  public readonly statusCode: number;
  public readonly response?: ErrorResponse;

  constructor(message: string, statusCode: number, response?: ErrorResponse) {
    super(message);
    this.name = 'APIError';
    this.statusCode = statusCode;
    this.response = response;
    Object.setPrototypeOf(this, APIError.prototype);
  }
}

/**
 * Configuration error
 */
export class ConfigurationError extends SingleKeyError {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigurationError';
    Object.setPrototypeOf(this, ConfigurationError.prototype);
  }
}
