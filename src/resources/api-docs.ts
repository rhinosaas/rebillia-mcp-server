/**
 * Rebillia API documentation resources for MCP.
 * All docs are self-contained; do not fetch external URLs (e.g. apiguide.rebillia.com).
 * Backend reference: RebilliaServer PublicAPI
 */

import type { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

export const RESOURCE_URI_PREFIX = "rebillia://api/";
export const DOCS_URI_PREFIX = "rebillia://docs/";

export interface ApiResource {
  uri: string;
  name: string;
  description: string;
  mimeType: string;
  text: string;
}

/** Four API documentation resources (rebillia://docs/*) for MCP Inspector Resources tab */
const docResources: ApiResource[] = [
  {
    uri: `${DOCS_URI_PREFIX}overview`,
    name: "Overview documentation",
    description: "Rebillia API overview – read this first. Base URLs, authentication, pagination, date format, amount handling. Main entry point for Rebillia API docs.",
    mimeType: "text/markdown",
    text: `# Rebillia Public API – Overview documentation

**This is the Rebillia API overview.** All reference material is in these MCP resources (rebillia://docs/*). Do not fetch external URLs; use \`resources/read\` with the URIs below. The rest of this document and the other docs contain everything needed.

## Base URLs

| Environment | Base URL |
|-------------|----------|
| Production | \`https://api.rebillia.com/v1\` |
| Sandbox | \`https://sandboxapi.rebillia.com/v1\` |

Override with \`REBILLIA_API_URL\` (include \`/v1\`).

## Authentication

- **Header:** \`X-AUTH-TOKEN\` (required) – your Rebillia API key
- **Content-Type:** \`application/json\` for request bodies
- Missing or invalid key returns \`401 Unauthorized\`

## Pagination

List endpoints return a paginated shape:

| Field | Type | Description |
|-------|------|-------------|
| \`currentPageNumber\` | number | Current page (1-based) |
| \`itemsPerPage\` | number | Page size |
| \`totalItems\` | number | Total count |
| \`totalPages\` | number | Total pages |
| \`data\` | array | Items for the page |

**Common query params:** \`pageNo\` (default 1), \`itemPerPage\` (default 25, max 250).

## Date / time format

- Use **ISO 8601** when the API expects a datetime (e.g. \`newDateTime\` for bill runs): \`YYYY-MM-DDTHH:MM:SS\` or with timezone \`YYYY-MM-DDTHH:MM:SSZ\`.
- Date-only fields often use \`YYYY-MM-DD\` (e.g. \`effectiveStartDate\`, \`dateDue\`).

## Amount handling

- **Invoice charge / transaction amounts:** Many endpoints use amounts in **cents** (e.g. \`5500\` = $55.00). Check per endpoint.
- **Refund (transactions):** \`amount\` in **cents** (e.g. \`250\` = $2.50).
- **Invoice detail line items (create):** \`amount\` as **dollar string** (e.g. \`"20.00"\`) or number in cents (converted to dollars by the tool).
- **Shipping:** \`orderAmount\` in company currency units; \`weight\` per company metrics (oz, kg, etc.).

## Other documentation resources

**Do not fetch external URLs.** Use only these MCP resources. Read them via MCP \`resources/read\` with the URI:

| Resource | URI | Contents |
|----------|-----|----------|
| **Overview** (this doc) | \`rebillia://docs/overview\` | Base URLs, auth, pagination, dates, amounts |
| Data models | \`rebillia://docs/models\` | Domain model hierarchy and relationships |
| Subscription statuses | \`rebillia://docs/subscription-statuses\` | active, paused, archived, requestPayment |
| Charge types | \`rebillia://docs/charge-types\` | chargeType, chargeModel, billingPeriod, billingTiming |
`,
  },
  {
    uri: `${DOCS_URI_PREFIX}models`,
    name: "rebillia-data-models",
    description: "Domain model hierarchy and relationships",
    mimeType: "text/markdown",
    text: `# Rebillia – Domain model hierarchy and relationships

High-level domain model for the Rebillia Public API (aligned with RebilliaServer entities and normalizers).

## Company-scoped entities

- **Company** – Tenant; all data is scoped by company (via API key).
- **Company currency** – Currency used by the company (linked to Gbl currency); has conversion rate, fixed rate; can be default.
- **Company gateway** – Payment gateway configuration (Stripe, etc.); has credentials (setting), display name, card types.
- **Company integration** – Integration instance (e.g. BigCommerce, Shopify, Avalara, SMTP) per company; has section/type (ecommerce, tax, shipping, etc.).
- **Company filter** – Saved filter (display name, section, rules) for list views (invoices, subscriptions, customers, etc.).

## Core billing hierarchy

\`\`\`
Company
  ├── Customers
  │     ├── Address book (billing/shipping)
  │     ├── Payment methods (customer payment method)
  │     ├── Invoices (customer-scoped)
  │     └── Subscriptions
  ├── Products
  │     └── Product rate plans
  │           └── Product rate plan charges (chargeType, chargeModel, tiers)
  ├── Subscriptions (customer + company currency + optional gateway)
  │     ├── Rate plans (product rate plan, charges, quantity)
  │     └── Rate plan charges (quantity, tier, billing period)
  ├── Invoices (customer, currency, gateway; line items, transactions)
  │     └── Transactions (payment/refund/void)
  ├── Bill runs (scheduled runs; target date/time)
  ├── Currencies (company currencies; default)
  └── Gateways (company gateways; test connection)
\`\`\`

## Key relationships

- **Subscription** → Customer, Company currency, optional Company gateway, optional payment method; contains **Rate plans** (product rate plan ref + rate plan charges).
- **Invoice** → Customer, Company currency/gateway; has **Detail** (line items) and **Transactions**.
- **Transaction** → Invoice (or standalone); amount, status, payment type (e.g. thirdPartyPaymentProvider).
- **Product rate plan** → Product; has **Product rate plan charges** (charge type, model, billing period, tiers).
- **Filter** → Section (e.g. subscriptions, invoices, customers); **Rules** (attribute, operator, setting values).
`,
  },
  {
    uri: `${DOCS_URI_PREFIX}subscription-statuses`,
    name: "rebillia-subscription-statuses",
    description: "Status guide (active, paused, archived, requestPayment)",
    mimeType: "text/markdown",
    text: `# Rebillia – Subscription statuses

Subscription status values used by the Rebillia Public API (Subscription entity / SubscriptionValidator).

## Status values

| Status | Value | Description |
|--------|--------|-------------|
| **Active** | \`active\` | Subscription is active; billing and charges apply per schedule. |
| **Paused** | \`paused\` | Subscription is paused; billing suspended until resumed. |
| **Archived** | \`archived\` | Subscription is ended/archived; no longer active. |
| **Request payment** | \`requestPayment\` | Payment is requested (e.g. awaiting payment). |

## Usage

- **List/filter:** Use \`status\` query param (e.g. \`GET /subscriptions?status=active\`).
- **Update status:** \`PUT /subscriptions/{id}\` or dedicated status endpoint with body \`{ "status": "archived" }\` (or \`active\`, \`paused\`, \`requestPayment\` as allowed by the API).
- **Create:** New subscriptions are typically created in \`active\` or as per API rules.

## Allowed transitions

- Check RebilliaServer \`SubscriptionValidator\` and subscription service for allowed status transitions (e.g. \`active\` → \`paused\`, \`active\` → \`archived\`, \`requestPayment\` → \`active\`).
`,
  },
  {
    uri: `${DOCS_URI_PREFIX}charge-types`,
    name: "rebillia-charge-types",
    description: "Charge type reference (chargeType, chargeModel, billingPeriod, billingTiming enums)",
    mimeType: "text/markdown",
    text: `# Rebillia – Charge type reference

Enums for rate plan charges and product rate plan charges (RebilliaServer PublicAPI / entity constants).

## chargeType

| Value | Description |
|-------|-------------|
| \`oneTime\` | One-time charge |
| \`recurring\` | Recurring charge (billing period applies) |
| \`usage\` | Usage-based charge |

## chargeModel

| Value | Description |
|-------|-------------|
| \`flatFee\` | Flat fee pricing |
| \`perUnit\` | Per-unit pricing |
| \`tiered\` | Tiered pricing (charge tiers) |
| \`volume\` | Volume pricing |
| \`overage\` | Overage pricing |

## billingPeriod

Used for recurring charges (e.g. \`recurring\` chargeType).

| Value | Description |
|-------|-------------|
| \`day\` | Daily |
| \`week\` | Weekly |
| \`month\` | Monthly |
| \`quarter\` | Quarterly |
| \`year\` | Yearly |

## billingTiming

| Value | Description |
|-------|-------------|
| \`inAdvance\` | Billed in advance of the period |
| \`inArrears\` | Billed in arrears (after the period) |

## Typical usage

- **Create rate plan charge:** \`chargeType\`, \`chargeModel\`, \`billCycleType\`, \`category\`, \`chargeTier\` (array), \`taxable\`, \`weight\`, \`endDateCondition\`; for recurring, \`billingPeriod\` and \`billingTiming\` (and alignment) apply.
- **Subscription rate plan charges:** Inherit from product rate plan charge; quantity and overrides per subscription.
`,
  },
];

/** List shape for MCP resources/list */
function getDocResourcesList(): Array<{
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}> {
  return docResources.map(({ uri, name, description, mimeType }) => ({
    uri,
    name,
    description,
    mimeType,
  }));
}

/** Read one resource by URI; returns MCP contents or null */
function getDocResourceContent(uri: string): { contents: Array<{ uri: string; mimeType: string; text: string }> } | null {
  const resource = docResources.find((r) => r.uri === uri);
  if (!resource) return null;
  return {
    contents: [
      {
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: resource.text,
      },
    ],
  };
}

/** Doc keys supported by get_api_docs tool */
export const DOC_KEYS = ["overview", "models", "subscription-statuses", "charge-types"] as const;
export type DocKey = (typeof DOC_KEYS)[number];

/** Get documentation markdown by key (for get_api_docs tool). Returns null if key unknown. */
export function getDocContent(doc: DocKey): string | null {
  const uri = `${DOCS_URI_PREFIX}${doc}`;
  const resource = docResources.find((r) => r.uri === uri);
  return resource ? resource.text : null;
}

/**
 * Register the 4 API documentation resources with the MCP server.
 * Call this with the server instance only (no client needed).
 * Resources appear in MCP Inspector Resources tab under rebillia://docs/*
 */
export function registerResources(server: Server): void {
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return { resources: getDocResourcesList() };
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const result = getDocResourceContent(request.params.uri);
    if (!result) {
      throw new Error(`Resource not found: ${request.params.uri}`);
    }
    return result;
  });
}

// ============================================================================
// Legacy api resources (rebillia://api/*) – kept for backward compatibility
// ============================================================================

export const apiResources: ApiResource[] = [
  {
    uri: `${RESOURCE_URI_PREFIX}overview`,
    name: "Rebillia API Overview",
    description: "Introduction to the Rebillia Public API and where to find the full reference",
    mimeType: "text/markdown",
    text: `# Rebillia Public API – Overview

The **Rebillia Public API** lets you manage customers, subscriptions, invoices, payments, and related billing data.

## Documentation

Use the MCP resources (rebillia://docs/overview, models, subscription-statuses, charge-types). Do not fetch external sites.

## Base URL

- Production: \`https://api.rebillia.com/v1\`
- Override with \`REBILLIA_API_URL\` if using another environment.

## Authentication

All requests use the **X-AUTH-TOKEN** header with your API key.

## Pagination

List endpoints return: \`currentPageNumber\`, \`itemsPerPage\`, \`totalItems\`, \`totalPages\`, \`data\`.
Common query params: \`pageNo\` (default 1), \`itemPerPage\` (default 25, max 250).
`,
  },
  {
    uri: `${RESOURCE_URI_PREFIX}authentication`,
    name: "Authentication",
    description: "How to authenticate requests to the Rebillia Public API",
    mimeType: "text/markdown",
    text: `# Rebillia API – Authentication

- **Header:** \`X-AUTH-TOKEN\` (required)
- **Content-Type:** \`application/json\` for request bodies
`,
  },
  {
    uri: `${RESOURCE_URI_PREFIX}customers`,
    name: "Customers API",
    description: "List, get, and create customers",
    mimeType: "text/markdown",
    text: `# Rebillia API – Customers. Base path: \`/v1/customers\`. Use MCP resources (rebillia://docs/*) for reference; do not fetch external URLs.`,
  },
  {
    uri: `${RESOURCE_URI_PREFIX}subscriptions`,
    name: "Subscriptions API",
    description: "Subscriptions, rate plans, and rate plan charges",
    mimeType: "text/markdown",
    text: `# Rebillia API – Subscriptions. Base path: \`/v1/subscriptions\`. Use MCP resources (rebillia://docs/*) for reference; do not fetch external URLs.`,
  },
  {
    uri: `${RESOURCE_URI_PREFIX}invoices`,
    name: "Invoices API",
    description: "Invoices, details, and payment status",
    mimeType: "text/markdown",
    text: `# Rebillia API – Invoices. Base path: \`/v1/invoices\`. Use MCP resources (rebillia://docs/*) for reference; do not fetch external URLs.`,
  },
];
