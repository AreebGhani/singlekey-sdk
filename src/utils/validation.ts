/**
 * Validation utilities for screening request data
 */

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,5}$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (10 digits)
 */
export function isValidPhone(phone: string): boolean {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10 || digitsOnly.length === 11;
}

/**
 * Normalize phone number to 10 digits
 */
export function normalizePhone(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return digitsOnly.substring(1);
  }
  
  return digitsOnly;
}

/**
 * Validate date of birth
 */
export function isValidDateOfBirth(year: number, month: number, day: number): {
  valid: boolean;
  error?: string;
} {
  // Check year
  if (year < 1900 || year > new Date().getFullYear()) {
    return { valid: false, error: 'Invalid year' };
  }

  // Check month
  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 1 and 12' };
  }

  // Check day
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) {
    return { valid: false, error: `Day must be between 1 and ${daysInMonth} for this month` };
  }

  // Check age (must be 18+)
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  if (age < 18) {
    return { valid: false, error: 'Applicant must be at least 18 years old' };
  }

  return { valid: true };
}

/**
 * Calculate age from date of birth
 */
export function calculateAge(year: number, month: number, day: number): number {
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Validate SIN/SSN (9 digits)
 */
export function isValidSIN(sin: string): boolean {
  const digitsOnly = sin.replace(/\D/g, '');
  return digitsOnly.length === 9;
}

/**
 * Normalize SIN/SSN to 9 digits
 */
export function normalizeSIN(sin: string): string {
  return sin.replace(/\D/g, '');
}

/**
 * Validate address format
 */
export function isValidAddress(address: string): {
  valid: boolean;
  error?: string;
} {
  if (!address || address.trim().length === 0) {
    return { valid: false, error: 'Address is required' };
  }

  // Check for commas (required format)
  const parts = address.split(',').map((p) => p.trim());
  if (parts.length < 3) {
    return {
      valid: false,
      error: 'Address must include street, city, and province/state separated by commas',
    };
  }

  return { valid: true };
}

/**
 * Format address to standard format
 */
export function formatAddress(
  street: string,
  city: string,
  provinceState: string,
  country: string,
  postalZip: string
): string {
  return `${street}, ${city}, ${provinceState}, ${country}, ${postalZip}`;
}

/**
 * Validate postal code (Canada)
 */
export function isValidPostalCode(postalCode: string): boolean {
  const canadaRegex = /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i;
  return canadaRegex.test(postalCode);
}

/**
 * Validate ZIP code (USA)
 */
export function isValidZipCode(zipCode: string): boolean {
  const usaRegex = /^\d{5}(-\d{4})?$/;
  return usaRegex.test(zipCode);
}

/**
 * Validate card expiration
 */
export function isValidCardExpiration(month: number, year: number): boolean {
  if (month < 1 || month > 12) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) {
    return false;
  }

  if (year === currentYear && month < currentMonth) {
    return false;
  }

  return true;
}
