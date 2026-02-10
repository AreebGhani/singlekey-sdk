# SingleKey TypeScript SDK

TypeScript/JavaScript SDK for the SingleKey Screening API. Process comprehensive tenant background checks with full Equifax/TransUnion credit data in under 5 minutes.

## Features

- **Full TypeScript support** - Complete type definitions for all API endpoints
- **Built-in authentication** - Automatic API token management
- **Webhook utilities** - Easy webhook verification and handling
- **Input validation** - Comprehensive data validation helpers
- **Multiple integration modes** - Form-based or direct API
- **Error handling** - Intelligent error handling with custom error classes
- **Minimal dependencies** - Only requires axios for HTTP requests

## Quick Start

### Initialize the SDK

```typescript
import { SingleKey } from "./src";

const client = new SingleKey({
  apiToken: process.env.SINGLEKEY_API_TOKEN,
  environment: "sandbox", // or 'production'
});
```

### Create a Screening Request (Tenant Form)

```typescript
const request = await client.request.createTenantForm({
  external_customer_id: "landlord-123",
  external_tenant_id: "tenant-456",
  tenant_form: true,
  ten_email: "tenant@example.com",
  purchase_address: "123 Main St, Toronto, ON, Canada, M5V 1A1",
  callback_url: "https://yoursite.com/webhooks",
});

// Send tenant to the form URL
console.log("Tenant form URL:", request.tenant_form_url);
```

### Get Screening Report

```typescript
const report = await client.report.get(request.purchase_token);

if (report.success && "singlekey_score" in report) {
  console.log("Credit Score:", report.singlekey_score);
  console.log("Report URL:", report.report_url);
}
```

### Download PDF Report

```typescript
await client.report.downloadPDF(request.purchase_token, {
  outputPath: "./screening_report.pdf",
});
```

## Complete API Reference

### SDK Client

#### Constructor

```typescript
const client = new SingleKey(config: SingleKeyConfig)
```

**Configuration Options:**

- `apiToken` (required): Your SingleKey API authentication token
- `environment` (optional): 'sandbox' or 'production' (default: 'production')
- `baseUrl` (optional): Custom base URL (overrides environment)
- `timeout` (optional): Request timeout in milliseconds (default: 30000)
- `debug` (optional): Enable debug logging (default: false)

**Methods:**

- `getConfig()`: Get current SDK configuration
- `getBaseUrl()`: Get the base URL being used

**Factory Function:**

```typescript
const client = createClient(config: SingleKeyConfig)
```

---

### Request Service

Create and manage screening requests.

#### `client.request.create(data)`

Create a screening request with custom data.

**Parameters:**

- `data` (ScreeningRequestData): Complete screening request data

**Returns:** `Promise<ScreeningRequestResponse>`

**Response Fields:**

- `success`: boolean
- `purchase_token`: 32-character unique identifier
- `form_url`: Landlord form URL (if applicable)
- `tenant_form_url`: Tenant form URL (if applicable)
- `external_customer_id`: Your landlord identifier
- `external_tenant_id`: Your tenant identifier

**Example:**

```typescript
const response = await client.request.create({
  external_customer_id: "landlord-123",
  external_tenant_id: "tenant-456",
  ll_first_name: "John",
  ll_last_name: "Smith",
  ll_email: "john@example.com",
  ten_first_name: "Jane",
  ten_last_name: "Doe",
  ten_email: "jane@example.com",
});
```

#### `client.request.createLandlordForm(data)`

Create a landlord form-based request.

**Parameters:**

- `data` (LandlordFormRequest): Landlord and basic tenant information

**Required Fields:**

- `external_customer_id`: Your landlord ID
- `external_tenant_id`: Your tenant ID
- `ll_first_name`: Landlord first name
- `ll_last_name`: Landlord last name
- `ll_email`: Landlord email
- `ll_tel`: Landlord phone
- `ten_first_name`: Tenant first name
- `ten_last_name`: Tenant last name
- `ten_email`: Tenant email

**Example:**

```typescript
const response = await client.request.createLandlordForm({
  external_customer_id: "landlord-123",
  external_tenant_id: "tenant-456",
  ll_first_name: "John",
  ll_last_name: "Smith",
  ll_email: "landlord@example.com",
  ll_tel: "5551234567",
  ten_first_name: "Jane",
  ten_last_name: "Doe",
  ten_email: "tenant@example.com",
});
```

#### `client.request.createTenantForm(data)`

Create a tenant form-based request.

**Parameters:**

- `data` (TenantFormRequest): Minimal tenant information

**Required Fields:**

- `external_customer_id`: Your landlord ID
- `external_tenant_id`: Your tenant ID
- `tenant_form`: true
- `ten_email`: Tenant email
- `purchase_address`: Property address

**Example:**

```typescript
const response = await client.request.createTenantForm({
  external_customer_id: "landlord-123",
  external_tenant_id: "tenant-456",
  tenant_form: true,
  ten_email: "tenant@example.com",
  purchase_address: "123 Main St, Toronto, ON, Canada, M5V 1A1",
});
// Send tenant to response.tenant_form_url
```

#### `client.request.createDirect(data)`

Create a direct API request with immediate processing.

**Parameters:**

- `data` (DirectAPIRequest): Complete tenant information

**Required Fields:**

- `external_customer_id`: Your landlord ID
- `external_tenant_id`: Your tenant ID
- `run_now`: true
- All landlord fields (ll\_\*)
- All tenant fields (ten\_\*)
- Date of birth (ten_dob_year, ten_dob_month, ten_dob_day)
- Current address (ten_address)
- Phone (ten_tel)
- SIN/SSN (ten_sin)

**Example:**

```typescript
const response = await client.request.createDirect({
  external_customer_id: "landlord-123",
  external_tenant_id: "tenant-456",
  run_now: true,
  ll_first_name: "John",
  ll_last_name: "Smith",
  ll_email: "landlord@example.com",
  ten_first_name: "Jane",
  ten_last_name: "Doe",
  ten_email: "tenant@example.com",
  ten_tel: "5551234567",
  ten_dob_year: 1990,
  ten_dob_month: 6,
  ten_dob_day: 15,
  ten_address: "456 Oak Ave, Toronto, ON, Canada, M5V 2B3",
  ten_sin: "123456789",
});
```

---

### Report Service

Retrieve screening reports and PDFs.

#### `client.report.get(purchaseToken)`

Get screening report by purchase token.

**Parameters:**

- `purchaseToken` (string): 32-character token from screening request

**Returns:** `Promise<ScreeningReportResponse>`

**Response Types:**

- `ScreeningReportComplete`: Report is ready
- `ScreeningReportInProgress`: Processing
- `ScreeningReportWaitingTenant`: Waiting for tenant
- `ScreeningReportWaitingLandlord`: Waiting for landlord
- `ScreeningReportErrors`: Submission has errors

**Complete Report Fields:**

- `purchase_token`: Unique identifier
- `singlekey_score`: Credit score (300-900) or null
- `cost`: Charge amount in cents
- `tax_collected`: Tax amount in cents
- `currency`: 'CAD' or 'USD'
- `report_url`: S3 PDF URL (expires in 5 days)
- `html_report_url`: Web viewable report
- `pdf_report_ready`: boolean
- `date_created`: Creation timestamp
- `external_customer_id`: Your landlord ID
- `external_tenant_id`: Your tenant ID

**Example:**

```typescript
const report = await client.report.get("abc123def456...");
if (report.success && "singlekey_score" in report) {
  console.log("Score:", report.singlekey_score);
}
```

#### `client.report.waitForCompletion(purchaseToken, options)`

Wait for screening report to complete with polling.

**Parameters:**

- `purchaseToken` (string): Token to poll
- `options` (optional):
  - `maxAttempts` (number): Maximum polling attempts (default: 40)
  - `intervalMs` (number): Milliseconds between polls (default: 10000)

**Returns:** `Promise<ScreeningReportComplete>`

**Throws:** Error if report doesn't complete within attempts

**Example:**

```typescript
const report = await client.report.waitForCompletion("abc123...", {
  maxAttempts: 60,
  intervalMs: 5000,
});
console.log("Report completed:", report.singlekey_score);
```

#### `client.report.downloadPDF(purchaseToken, options)`

Download screening report as PDF.

**Parameters:**

- `purchaseToken` (string): Token for the report
- `options` (optional):
  - `outputPath` (string): File path to save PDF
  - `returnBuffer` (boolean): Return PDF as Buffer

**Returns:** `Promise<ReportPDFResponse | void>`

**ReportPDFResponse Fields:**

- `data`: Buffer containing PDF data
- `filename`: Server-provided filename
- `contentType`: 'application/pdf'

**Examples:**

```typescript
// Save to file
await client.report.downloadPDF("abc123...", {
  outputPath: "./reports/tenant_screening.pdf",
});

// Get as buffer
const pdf = await client.report.downloadPDF("abc123...", {
  returnBuffer: true,
});
```

#### `client.report.isReady(purchaseToken)`

Check if report is ready.

**Parameters:**

- `purchaseToken` (string): Token to check

**Returns:** `Promise<boolean>`

**Example:**

```typescript
const ready = await client.report.isReady("abc123...");
if (ready) {
  // Download report
}
```

#### `client.report.getStatus(purchaseToken)`

Get human-readable status message.

**Parameters:**

- `purchaseToken` (string): Token to check

**Returns:** `Promise<string>`

**Example:**

```typescript
const status = await client.report.getStatus("abc123...");
console.log("Current status:", status);
```

---

### Applicant Service

Retrieve detailed applicant (tenant) information.

#### `client.applicant.get(purchaseToken, params)`

Get applicant information by purchase token.

**Parameters:**

- `purchaseToken` (string): Token from screening request
- `params` (optional):
  - `detailed` (boolean): Include co-occupants and guarantors
  - `show_credit_score` (boolean): Include credit score

**Returns:** `Promise<ApplicantInfoResponse>`

**Basic Response Fields:**

- `first_name`, `last_name`: Name
- `email`, `phone`: Contact info
- `date_of_birth`: ISO format date
- `current_address`: Address object with move-in/out dates and rent
- `previous_addresses`: Array of previous addresses
- `employment`: Array of employment records
- `annual_income`: Applicant's income
- `household_income`: Total household income
- `pets`: Array of pet information
- `automobiles`: Array of vehicle information
- `declarations`: Smoking, bankruptcy, eviction flags

**Detailed Response Additional Fields:**

- `co_occupants`: Array of co-occupant information
- `guarantor`: Guarantor information object
- `income_sources`: Detailed income breakdown

**Example:**

```typescript
const applicant = await client.applicant.get("abc123...", {
  detailed: true,
  show_credit_score: true,
});
console.log("Income:", applicant.annual_income);
```

#### `client.applicant.getDetailed(purchaseToken)`

Get detailed applicant information including co-occupants and guarantors.

**Parameters:**

- `purchaseToken` (string): Token from screening request

**Returns:** `Promise<ApplicantInfoResponse>`

**Example:**

```typescript
const detailed = await client.applicant.getDetailed("abc123...");
console.log("Co-occupants:", detailed.co_occupants);
```

#### `client.applicant.getWithScore(purchaseToken)`

Get applicant information with credit score included.

**Parameters:**

- `purchaseToken` (string): Token from screening request

**Returns:** `Promise<ApplicantInfoResponse>`

**Additional Field:**

- `credit_score`: Credit score (300-900)

**Example:**

```typescript
const withScore = await client.applicant.getWithScore("abc123...");
console.log("Credit Score:", withScore.credit_score);
```

#### `client.applicant.getComplete(purchaseToken)`

Get complete applicant information with all details and credit score.

**Parameters:**

- `purchaseToken` (string): Token from screening request

**Returns:** `Promise<ApplicantInfoResponse>`

**Example:**

```typescript
const complete = await client.applicant.getComplete("abc123...");
console.log("Complete info:", complete);
```

---

### Payment Service

Manage payment methods and validate purchases.

#### `client.payment.getPaymentMethods()`

Get saved payment methods.

**Returns:** `Promise<GetPaymentMethodsResponse>`

**Response Fields:**

- `success`: boolean
- `has_payment_method`: boolean
- `payment_method`: PaymentMethod object or null
  - `brand`: Card brand (visa, mastercard, amex, etc.)
  - `last_4`: Last 4 digits of card
  - `exp_month`: Expiration month (1-12)
  - `exp_year`: Expiration year (YYYY)

**Example:**

```typescript
const payment = await client.payment.getPaymentMethods();
if (payment.has_payment_method) {
  console.log(
    "Card:",
    payment.payment_method.brand,
    "****" + payment.payment_method.last_4,
  );
}
```

#### `client.payment.addPaymentMethod(paymentData)`

Add a new payment method.

**Parameters:**

- `paymentData` (AddPaymentMethodRequest):
  - `card_number` (string): Full credit card number
  - `exp_month` (number): Expiration month (1-12)
  - `exp_year` (number): Expiration year (YYYY)
  - `cvc` (string): Card security code (3-4 digits)
  - `name` (string, optional): Cardholder name

**Returns:** `Promise<AddPaymentMethodResponse>`

**Response Fields:**

- `success`: boolean
- `detail`: Success message
- `payment_method`: Added payment method details

**Example:**

```typescript
await client.payment.addPaymentMethod({
  card_number: "4242424242424242",
  exp_month: 12,
  exp_year: 2025,
  cvc: "123",
  name: "John Smith",
});
```

#### `client.payment.validatePurchase(screeningId)`

Validate screening data before processing.

**Parameters:**

- `screeningId` (number | string): Screening purchase ID

**Returns:** `Promise<PurchaseValidationResponse>`

**Response Fields:**

- `success`: boolean
- `detail`: Status message
- `errors`: Array of validation error messages
- `purchase_id`: The screening ID
- `token`: Purchase token

**Example:**

```typescript
const validation = await client.payment.validatePurchase(12345);
if (!validation.success) {
  console.log("Errors:", validation.errors);
}
```

#### `client.payment.hasPaymentMethod()`

Check if payment method is on file.

**Returns:** `Promise<boolean>`

**Example:**

```typescript
const hasCard = await client.payment.hasPaymentMethod();
if (!hasCard) {
  console.log("Please add a payment method");
}
```

---

### Webhook Utilities

#### WebhookHandler Class

Handle and verify webhook events.

**Constructor:**

```typescript
const handler = new WebhookHandler(options?: WebhookVerificationOptions)
```

**Options:**

- `secret` (string): Webhook secret for signature verification
- `tolerance` (number): Maximum age in seconds (default: 300)

**Methods:**

##### `verifySignature(payload, signature, timestamp)`

Verify webhook signature for authenticity.

**Parameters:**

- `payload` (string): Raw webhook payload
- `signature` (string): X-SingleKey-Signature header value
- `timestamp` (string): X-SingleKey-Timestamp header value

**Returns:** boolean

**Throws:** WebhookVerificationError if verification fails

**Example:**

```typescript
const handler = new WebhookHandler({ secret: "your_secret" });
const isValid = handler.verifySignature(
  req.body,
  req.headers["x-singlekey-signature"],
  req.headers["x-singlekey-timestamp"],
);
```

##### `parseWebhook(rawPayload, signature, timestamp)`

Parse and verify webhook payload.

**Parameters:**

- `rawPayload` (string): Raw webhook payload string
- `signature` (string): X-SingleKey-Signature header
- `timestamp` (string): X-SingleKey-Timestamp header

**Returns:** WebhookPayload

**Throws:** WebhookVerificationError if invalid

**Example:**

```typescript
const webhook = handler.parseWebhook(
  JSON.stringify(req.body),
  req.headers["x-singlekey-signature"],
  req.headers["x-singlekey-timestamp"],
);
console.log("Event:", webhook.event);
```

##### `on(handlers)`

Create type-safe webhook event handler.

**Parameters:**

- `handlers`: Object mapping event types to handler functions
  - `'screening.completed'`: Handler for completed screenings
  - `'screening.submitted'`: Handler for submitted screenings
  - `'screening.payment_captured'`: Handler for payment capture
  - `'screening.failed'`: Handler for failed screenings
  - `'form.opened'`: Handler for form opened events
  - `'invite.sent'`: Handler for invite sent events

**Returns:** Async function to process webhooks

**Example:**

```typescript
const processWebhook = handler.on({
  "screening.completed": (data) => {
    console.log("Score:", data.result.singlekey_score);
  },
  "screening.failed": (data) => {
    console.error("Failed:", data.reason);
  },
});

processWebhook(webhook);
```

#### `webhookMiddleware(options)`

Express middleware for handling webhooks.

**Parameters:**

- `options` (WebhookVerificationOptions):
  - `secret` (string): Webhook secret

**Returns:** Express middleware function

**Example:**

```typescript
import { webhookMiddleware } from "@singlekey/sdk";

app.post(
  "/webhooks/singlekey",
  express.raw({ type: "application/json" }),
  webhookMiddleware({ secret: process.env.WEBHOOK_SECRET }),
  (req, res) => {
    const webhook = req.singlekeyWebhook;
    console.log("Event:", webhook.event);
    res.sendStatus(200);
  },
);
```

#### `constructWebhookSignature(payload, secret, timestamp?)`

Construct webhook signature for testing.

**Parameters:**

- `payload` (string): Webhook payload string
- `secret` (string): Webhook secret
- `timestamp` (number, optional): Unix timestamp

**Returns:** Object with `signature` and `timestamp` strings

**Example:**

```typescript
const { signature, timestamp } = constructWebhookSignature(
  JSON.stringify(payload),
  "your_secret",
);
```

---

### Validation Utilities

#### Email Validation

##### `isValidEmail(email)`

Validate email format.

**Parameters:**

- `email` (string): Email address to validate

**Returns:** boolean

**Example:**

```typescript
import { isValidEmail } from "@singlekey/sdk";

if (!isValidEmail("user@example.com")) {
  console.error("Invalid email");
}
```

#### Phone Validation

##### `isValidPhone(phone)`

Validate phone number (10 or 11 digits).

**Parameters:**

- `phone` (string): Phone number to validate

**Returns:** boolean

**Example:**

```typescript
import { isValidPhone } from "@singlekey/sdk";

if (isValidPhone("5551234567")) {
  console.log("Valid phone number");
}
```

##### `normalizePhone(phone)`

Normalize phone number to 10 digits.

**Parameters:**

- `phone` (string): Phone number to normalize

**Returns:** string (10 digits)

**Example:**

```typescript
import { normalizePhone } from "@singlekey/sdk";

const normalized = normalizePhone("(555) 123-4567");
// Returns: '5551234567'
```

#### Date of Birth Validation

##### `isValidDateOfBirth(year, month, day)`

Validate date of birth and check age requirement (must be 18+).

**Parameters:**

- `year` (number): Birth year (YYYY)
- `month` (number): Birth month (1-12)
- `day` (number): Birth day (1-31)

**Returns:** Object with `valid` (boolean) and `error` (string, optional)

**Example:**

```typescript
import { isValidDateOfBirth } from "@singlekey/sdk";

const validation = isValidDateOfBirth(1990, 6, 15);
if (!validation.valid) {
  console.error(validation.error);
}
```

##### `calculateAge(year, month, day)`

Calculate age from date of birth.

**Parameters:**

- `year` (number): Birth year
- `month` (number): Birth month
- `day` (number): Birth day

**Returns:** number (age in years)

**Example:**

```typescript
import { calculateAge } from "@singlekey/sdk";

const age = calculateAge(1990, 6, 15);
console.log("Age:", age);
```

#### SIN/SSN Validation

##### `isValidSIN(sin)`

Validate SIN/SSN format (9 digits).

**Parameters:**

- `sin` (string): SIN or SSN to validate

**Returns:** boolean

**Example:**

```typescript
import { isValidSIN } from "@singlekey/sdk";

if (isValidSIN("123456789")) {
  console.log("Valid SIN");
}
```

##### `normalizeSIN(sin)`

Normalize SIN/SSN to 9 digits.

**Parameters:**

- `sin` (string): SIN/SSN to normalize

**Returns:** string (9 digits)

**Example:**

```typescript
import { normalizeSIN } from "@singlekey/sdk";

const normalized = normalizeSIN("123-456-789");
// Returns: '123456789'
```

#### Address Validation

##### `isValidAddress(address)`

Validate address format.

**Parameters:**

- `address` (string): Address to validate

**Returns:** Object with `valid` (boolean) and `error` (string, optional)

**Example:**

```typescript
import { isValidAddress } from "@singlekey/sdk";

const validation = isValidAddress("123 Main St, Toronto, ON, Canada, M5V 1A1");
if (validation.valid) {
  console.log("Valid address");
}
```

##### `formatAddress(street, city, provinceState, country, postalZip)`

Format address components to standard format.

**Parameters:**

- `street` (string): Street address
- `city` (string): City name
- `provinceState` (string): Province or state
- `country` (string): Country name
- `postalZip` (string): Postal or ZIP code

**Returns:** string (formatted address)

**Example:**

```typescript
import { formatAddress } from "@singlekey/sdk";

const address = formatAddress(
  "123 Main St",
  "Toronto",
  "ON",
  "Canada",
  "M5V 1A1",
);
// Returns: '123 Main St, Toronto, ON, Canada, M5V 1A1'
```

#### Postal/ZIP Code Validation

##### `isValidPostalCode(postalCode)`

Validate Canadian postal code format.

**Parameters:**

- `postalCode` (string): Postal code to validate

**Returns:** boolean

**Example:**

```typescript
import { isValidPostalCode } from "@singlekey/sdk";

if (isValidPostalCode("M5V 1A1")) {
  console.log("Valid Canadian postal code");
}
```

##### `isValidZipCode(zipCode)`

Validate US ZIP code format.

**Parameters:**

- `zipCode` (string): ZIP code to validate

**Returns:** boolean

**Example:**

```typescript
import { isValidZipCode } from "@singlekey/sdk";

if (isValidZipCode("90210")) {
  console.log("Valid US ZIP code");
}
```

#### Card Validation

##### `isValidCardExpiration(month, year)`

Validate credit card expiration date.

**Parameters:**

- `month` (number): Expiration month (1-12)
- `year` (number): Expiration year (YYYY)

**Returns:** boolean

**Example:**

```typescript
import { isValidCardExpiration } from "@singlekey/sdk";

if (isValidCardExpiration(12, 2025)) {
  console.log("Card not expired");
}
```

---

### Error Classes

All SDK errors extend the base `SingleKeyError` class.

#### `SingleKeyError`

Base error class for all SDK errors.

#### `AuthenticationError`

Thrown for authentication failures (401).

**Properties:**

- `name`: 'AuthenticationError'
- `message`: Error message

**Example:**

```typescript
import { AuthenticationError } from "@singlekey/sdk";

try {
  await client.report.get(token);
} catch (error) {
  if (error instanceof AuthenticationError) {
    console.error("Invalid API token");
  }
}
```

#### `ValidationError`

Thrown for validation failures (400).

**Properties:**

- `name`: 'ValidationError'
- `message`: Error message
- `errors`: Array of specific error messages

**Example:**

```typescript
import { ValidationError } from "@singlekey/sdk";

try {
  await client.request.create(data);
} catch (error) {
  if (error instanceof ValidationError) {
    console.error("Validation errors:", error.errors);
  }
}
```

#### `NotFoundError`

Thrown when resource is not found (404).

**Properties:**

- `name`: 'NotFoundError'
- `message`: Error message

#### `RateLimitError`

Thrown when rate limit is exceeded (429).

**Properties:**

- `name`: 'RateLimitError'
- `message`: Error message

#### `ServerError`

Thrown for server errors (500+).

**Properties:**

- `name`: 'ServerError'
- `message`: Error message
- `statusCode`: HTTP status code

#### `APIError`

Generic API error with full response details.

**Properties:**

- `name`: 'APIError'
- `message`: Error message
- `statusCode`: HTTP status code
- `response`: ErrorResponse object

#### `ConfigurationError`

Thrown for invalid SDK configuration.

**Properties:**

- `name`: 'ConfigurationError'
- `message`: Error message

#### `WebhookVerificationError`

Thrown when webhook verification fails.

**Properties:**

- `name`: 'WebhookVerificationError'
- `message`: Error message

---

## Integration Examples

### Form-Based Integration

```typescript
// Create screening request
const request = await client.request.createTenantForm({
  external_customer_id: "landlord-123",
  external_tenant_id: "tenant-456",
  tenant_form: true,
  ten_email: "tenant@example.com",
  purchase_address: "123 Main St, Toronto, ON, Canada, M5V 1A1",
});

// Send tenant to form URL
console.log("Redirect tenant to:", request.tenant_form_url);
```

### Direct API Integration

```typescript
// Create screening with all data
const request = await client.request.createDirect({
  external_customer_id: "landlord-123",
  external_tenant_id: "tenant-456",
  run_now: true,
  ll_first_name: "John",
  ll_last_name: "Smith",
  ll_email: "landlord@example.com",
  ten_first_name: "Jane",
  ten_last_name: "Doe",
  ten_email: "tenant@example.com",
  ten_tel: "5551234567",
  ten_dob_year: 1990,
  ten_dob_month: 6,
  ten_dob_day: 15,
  ten_address: "456 Oak Ave, Toronto, ON, Canada, M5V 2B3",
  ten_sin: "123456789",
});

// Wait for completion
const report = await client.report.waitForCompletion(request.purchase_token);
console.log("Score:", report.singlekey_score);
```

### Webhook Handler

```typescript
import express from "express";
import { webhookMiddleware } from "@singlekey/sdk";

const app = express();

app.post(
  "/webhooks/singlekey",
  express.raw({ type: "application/json" }),
  webhookMiddleware({ secret: process.env.WEBHOOK_SECRET }),
  (req, res) => {
    const webhook = req.singlekeyWebhook;

    if (webhook.event === "screening.completed") {
      console.log("Screening completed:", webhook.data.purchase_token);
      console.log("Score:", webhook.data.result.singlekey_score);
    }

    res.sendStatus(200);
  },
);

app.listen(3000);
```

### Complete Workflow

```typescript
// 1. Create screening
const request = await client.request.createTenantForm({
  external_customer_id: "landlord-123",
  external_tenant_id: "tenant-456",
  tenant_form: true,
  ten_email: "tenant@example.com",
  purchase_address: "123 Main St, Toronto, ON, Canada, M5V 1A1",
});

// 2. Wait for completion (or use webhooks)
const report = await client.report.waitForCompletion(request.purchase_token);

// 3. Download PDF
await client.report.downloadPDF(request.purchase_token, {
  outputPath: "./report.pdf",
});

// 4. Get applicant details
const applicant = await client.applicant.getComplete(request.purchase_token);
console.log("Applicant income:", applicant.annual_income);
```

## TypeScript Support

The SDK is written in TypeScript and provides complete type definitions:

```typescript
import type {
  ScreeningRequestData,
  ScreeningReportComplete,
  ApplicantInfoDetailed,
  WebhookPayload,
} from "@singlekey/sdk";

// Full type safety
const data: ScreeningRequestData = {
  external_customer_id: "landlord-123",
  external_tenant_id: "tenant-456",
  // TypeScript will validate all fields
};
```

## Environment Configuration

### Using Environment Variables

```bash
# .env file
SINGLEKEY_API_TOKEN=your_api_token
SINGLEKEY_ENVIRONMENT=sandbox
WEBHOOK_SECRET=your_webhook_secret
```

```typescript
import { SingleKey } from "./src";

const client = new SingleKey({
  apiToken: process.env.SINGLEKEY_API_TOKEN,
  environment: process.env.SINGLEKEY_ENVIRONMENT as "sandbox" | "production",
});
```

## Requirements

- Node.js >= 16.0.0
- TypeScript >= 5.0.0 (for TypeScript projects)
