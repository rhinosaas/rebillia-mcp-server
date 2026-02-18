/**
 * Rebillia Public API documentation content for MCP resources.
 * Full interactive reference: https://apiguide.rebillia.com/
 */

export const RESOURCE_URI_PREFIX = "rebillia://api/";

export interface ApiResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  text: string;
}

export const apiResources: ApiResource[] = [
  {
    uri: `${RESOURCE_URI_PREFIX}overview`,
    name: "Rebillia API Overview",
    description: "Introduction to the Rebillia Public API and where to find the full reference",
    mimeType: "text/markdown",
    text: `# Rebillia Public API – Overview

The **Rebillia Public API** lets you manage customers, subscriptions, invoices, payments, and related billing data.

## Official documentation

- **API reference (interactive):** [https://apiguide.rebillia.com/](https://apiguide.rebillia.com/)
- Use the API guide for full endpoint specs, request/response examples, and try-it-out.

## Base URL

- Production: \`https://api.rebillia.com/v1\`
- Override with \`REBILLIA_API_URL\` if using another environment.

## Authentication

All requests use the **X-AUTH-TOKEN** header with your API key. See \`rebillia://api/authentication\` for details.

## Main areas

| Area | Resource | Description |
|------|----------|-------------|
| Customers | \`rebillia://api/customers\` | List, get, create customers |
| Subscriptions | \`rebillia://api/subscriptions\` | Subscriptions and rate plans |
| Invoices | \`rebillia://api/invoices\` | Invoices and details |
| Authentication | \`rebillia://api/authentication\` | API key and headers |

## Pagination

List endpoints return:

- \`currentPageNumber\`, \`itemsPerPage\`, \`totalItems\`, \`totalPages\`, \`data\`

Common query params for lists: \`pageNo\` (default 1), \`itemPerPage\` (default 25, max 250).
`,
  },
  {
    uri: `${RESOURCE_URI_PREFIX}authentication`,
    name: "Authentication",
    description: "How to authenticate requests to the Rebillia Public API",
    mimeType: "text/markdown",
    text: `# Rebillia API – Authentication

## Method

The Public API uses **API key authentication** via a single header.

## Header

| Header | Description |
|--------|-------------|
| \`X-AUTH-TOKEN\` | Your Rebillia API key (required) |
| \`Content-Type\` | \`application/json\` for request bodies |

## Example

\`\`\`
GET /v1/customers?pageNo=1&itemPerPage=25
X-AUTH-TOKEN: your-api-key-here
Content-Type: application/json
\`\`\`

## Obtaining an API key

API keys are created and managed in the Rebillia dashboard. Use the key in \`X-AUTH-TOKEN\` for every request; do not expose it in client-side or public code.

## Full reference

- [Rebillia API Public – apiguide.rebillia.com](https://apiguide.rebillia.com/)
`,
  },
  {
    uri: `${RESOURCE_URI_PREFIX}customers`,
    name: "Customers API",
    description: "List, get, and create customers – parameters and responses",
    mimeType: "text/markdown",
    text: `# Rebillia API – Customers

Base path: \`/v1/customers\`

Full reference: [apiguide.rebillia.com](https://apiguide.rebillia.com/)

---

## List customers

\`\`\`
GET /v1/customers
\`\`\`

### Query parameters

| Parameter | Type | Description |
|----------|------|-------------|
| \`pageNo\` | number | Page number (default: 1) |
| \`itemPerPage\` | number | Items per page (default: 25, max 250) |
| \`query\` | string | Search in firstName, lastName, email, company name/support pin |
| \`status\` | string | \`active\`, \`disabled\`, or \`archived\` |
| \`sortBy\` | string | \`ASC\` or \`DESC\` (default: ASC for customers) |
| \`orderBy\` | string | Sort column, e.g. \`firstName\`, \`lastName\`, \`email\`, \`createdAt\` (default: \`firstName\`) |
| \`include\` | string | Comma-separated: \`addressbook\`, \`paymentmethod\`, \`lastInvoice\`, \`subscriptions\`, \`unpaidInvoices\`, \`externalCustomers\` |
| \`filterId\` | number | Optional saved filter ID |

### Response (paginated)

\`\`\`json
{
  "currentPageNumber": 1,
  "itemsPerPage": 25,
  "totalItems": 100,
  "totalPages": 4,
  "data": [ { "id", "customerId", "firstName", "lastName", "email", "status", ... } ]
}
\`\`\`

---

## Get customer by ID

\`\`\`
GET /v1/customers/{id}
\`\`\`

### Query parameters

| Parameter | Type | Description |
|----------|------|-------------|
| \`include\` | string | Comma-separated: \`addressbook\`, \`paymentmethod\`, \`lastInvoice\`, \`subscriptions\`, \`unpaidInvoices\`, \`externalCustomers\` |

### Response

Customer object with fields such as: \`id\`, \`customerId\`, \`firstName\`, \`lastName\`, \`email\`, \`status\`, \`preferredCurrency\`, \`createdAt\`, \`updatedAt\`. With \`include\`, may contain \`addressBook\`, \`paymentMethods\`, \`lastInvoice\`, \`subscriptions\`, \`unpaidInvoice\`, \`externalCustomer\`.
`,
  },
  {
    uri: `${RESOURCE_URI_PREFIX}subscriptions`,
    name: "Subscriptions API",
    description: "Subscriptions, rate plans, and rate plan charges",
    mimeType: "text/markdown",
    text: `# Rebillia API – Subscriptions

Base path: \`/v1/subscriptions\`

Full reference: [apiguide.rebillia.com](https://apiguide.rebillia.com/)

---

## Key concepts

- **Subscription** – A customer’s subscription to a product/plan, with status, billing address, payment method, and rate plans.
- **Rateplan** – A rate plan attached to a subscription (product, productRateplanId, rateplanCharges).
- **Rateplan charge** – Individual charge (recurring, one-time, usage) with billing period, price, tiers.

## List subscriptions

\`\`\`
GET /v1/subscriptions
\`\`\`

Supports pagination (\`pageNo\`, \`itemPerPage\`) and \`include\` for related data (e.g. \`rateplan\`, \`rateplanCharge\`, \`chargeTier\`).

## Get subscription

\`\`\`
GET /v1/subscriptions/{id}
\`\`\`

## Create subscription

\`\`\`
POST /v1/subscriptions
\`\`\`

Body typically includes \`customerId\`, \`name\`, \`ratePlanId\`, \`startDate\`, and optional fields. See the API guide for the exact schema.

## Update subscription

\`\`\`
PUT /v1/subscriptions/{id}
\`\`\`

## Subscription response shape (normalized)

Common fields: \`id\`, \`name\`, \`status\`, \`billingAddress\`, \`shippingAddress\`, \`companyCurrency\`, \`customer\`, \`customerPaymentMethod\`, \`rateplan\` (array when included), \`nextCharge\`, \`lastCharge\`, \`createdAt\`, \`updatedAt\`.
`,
  },
  {
    uri: `${RESOURCE_URI_PREFIX}invoices`,
    name: "Invoices API",
    description: "Invoices, details, and payment status",
    mimeType: "text/markdown",
    text: `# Rebillia API – Invoices

Base path: \`/v1/invoices\` (and customer-scoped \`/v1/customers/{customer}/invoices\`)

Full reference: [apiguide.rebillia.com](https://apiguide.rebillia.com/)

---

## List invoices

\`\`\`
GET /v1/invoices
GET /v1/customers/{customerId}/invoices
\`\`\`

Query params: pagination (\`pageNo\`, \`itemPerPage\`), \`include\` (e.g. \`detail\`, \`transactions\`, \`billruns\`, \`externalInvoices\`).

## Get invoice

\`\`\`
GET /v1/invoices/{id}
\`\`\`

Use \`include=detail\` to get line items.

## Invoice response shape (normalized)

Common fields: \`id\`, \`invoiceNo\`, \`status\`, \`total\`, \`balanceDue\`, \`dateDue\`, \`dateFrom\`, \`dateTo\`, \`customer\`, \`customerName\`, \`customerEmail\`, \`billingAddress\`, \`shippingAddress\`, \`currency\`, \`taxAmount\`, \`detail\` (array when included), \`transaction\` (when included), \`createdAt\`, \`updatedAt\`.
`,
  },
];
