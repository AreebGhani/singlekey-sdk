/**
 * SingleKey TypeScript SDK
 * TypeScript/JavaScript SDK for the SingleKey Screening API
 */

// Main client
export { SingleKey, createClient } from './client';

// Types
export * from './types';

// Errors
export * from './errors';

// Utilities
export * from './utils';

// Services (for advanced usage)
export * from './services';

/**
 * Default export
 */
import { SingleKey } from './client';
export default SingleKey;
