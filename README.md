# Rebillia MCP Server

Model Context Protocol (MCP) server for the [Rebillia Public API](https://apiguide.rebillia.com/). It exposes **tools** to call the API and **resources** with API documentation so AI assistants can manage customers, products, rate plans, and understand the API.

## Features

- **Tools** – Call Rebillia endpoints from your MCP client (e.g. Cursor, Claude Desktop):
  - **Customers** (21 tools) – List, get, create, update, delete; invoices, subscriptions, logs; addresses and payment methods; charges/credits
  - **Products** (8 tools) – List, get, create, update, delete; update status; link/unlink external products
  - **Rate plans** (7 tools) – List by product, get, create, update, delete; update status; sync
  - **Rate plan charges** (5 tools) – List by rate plan, get, create, update, delete (with chargeType, chargeModel, billingPeriod, billingTiming enums and chargeTier array)
  - **Subscriptions** (20 tools) – List, get, create, update, delete; status; next bill, upcoming charges, invoices, logs, external invoices; rate plans and rate plan charges (add/update/remove)
  - **Invoices** (8 tools) – List, get, create, update, delete; charge (card/online with paymentType), charge_external (offline), void
  - **Transactions** (4 tools) – List, get, refund (amount in **cents**), void (before settlement only)
  - **Bill runs** (4 tools) – List (filter by completed/pending/error), get, update (newDateTime, ISO 8601), get bill run invoices
- **Resources** – Read API docs via MCP resources (URIs under `rebillia://api/`):
  - Overview, authentication, customers, subscriptions, invoices
- **Types** – TypeScript types aligned with the Rebillia Public API response shapes

## Requirements

- Node.js 18+
- A Rebillia API key (from your Rebillia dashboard)

## Setup

1. **Clone and install**

   ```bash
   cd /path/to/rebillia-mcp-server
   npm install
   ```

2. **Configure environment**

   Copy the example env file and set your API key and optional base URL:

   ```bash
   cp .env.example .env
   ```

   Edit `.env`:

   ```env
   REBILLIA_API_KEY=your_api_key_here
   REBILLIA_API_URL=https://api.rebillia.com/v1
   ```

   - `REBILLIA_API_KEY` – **Required.** Used as `X-AUTH-TOKEN` for all requests.
   - `REBILLIA_API_URL` – Optional. Defaults to `https://api.rebillia.com/v1` (include `/v1` for the Public API).

3. **Build**

   ```bash
   npm run build
   ```

## Usage

### Running the server

Development (no build step):

```bash
npm run dev
```

Production:

```bash
npm run build
npm start
```

Or run the binary:

```bash
./node_modules/.bin/rebillia-mcp-server
```

The server uses **stdio** transport: it reads JSON-RPC from stdin and writes responses to stdout. MCP clients connect to it as a subprocess.

### Configuring an MCP client

Example configuration for Cursor (or other MCP clients). Add the Rebillia server to your MCP settings, e.g. in `.cursor/rebillia-mcp-server.json` or the client's MCP config:

```json
{
  "mcpServers": {
    "rebillia": {
      "command": "node",
      "args": ["/absolute/path/to/rebillia-mcp-server/dist/index.js"],
      "env": {
        "REBILLIA_API_KEY": "your_api_key_here",
        "REBILLIA_API_URL": "https://api.rebillia.com/v1"
      }
    }
  }
}
```

Use the path to your built `dist/index.js` (or `npm start` / `npx rebillia-mcp-server` if your config supports it).

### Tools

Responses are JSON from the Rebillia Public API (paginated for list endpoints, single object for get).

#### Customers (21 tools)

| Tool | Description |
|------|-------------|
| `list_customers` | List customers (pageNo, itemPerPage, query, status, sortBy, orderBy, include, filterId). |
| `get_customer` | Get customer by ID (optional include). |
| `create_customer` | Create customer (firstName, lastName, email, optional fields). |
| `update_customer` | Update customer by ID. |
| `delete_customer` | Delete customer by ID. |
| `get_customer_invoices` | Get invoices for a customer. |
| `get_customer_subscriptions` | Get subscriptions for a customer. |
| `get_customer_logs` | Get logs for a customer. |
| `list_customer_addresses` | List address book entries for a customer. |
| `get_customer_address` | Get address by ID. |
| `create_customer_address` | Create address (name, contactName, street1, city, state, zip, countryId, type, …). |
| `update_customer_address` | Update address by ID. |
| `delete_customer_address` | Delete address by ID. |
| `list_customer_payment_methods` | List payment methods for a customer. |
| `get_customer_payment_method` | Get payment method by ID. |
| `create_customer_payment_method` | Create payment method (companyGatewayId, type, paymentNonce, billingAddress). |
| `update_customer_payment_method` | Update payment method billing address. |
| `delete_customer_payment_method` | Delete payment method by ID. |
| `list_customer_charges_credits` | List charges/credits (optional status, type). |
| `create_customer_charge_credit` | Create charge/credit (amount in **cents**, description, type, companyCurrencyId, category, …). |
| `delete_customer_charge_credit` | Delete charge/credit by ID. |

#### Products (8 tools)

| Tool | Description |
|------|-------------|
| `list_products` | List products (include, orderBy, sortBy, itemPerPage, pageNo). |
| `get_product` | Get product by ID. |
| `create_product` | Create product (name, category, optional description, sku). |
| `update_product` | Update product by ID. |
| `delete_product` | Delete product by ID (cascades to rate plans). |
| `update_product_status` | Update status (published, archived, disabled). |
| `link_external_product` | Link external product (productId, companyIntegrationId, external productId, settings). |
| `unlink_external_product` | Unlink external product by ID. |

#### Rate plans (7 tools)

| Tool | Description |
|------|-------------|
| `list_rate_plans` | List rate plans for a product (GET /products/{productId}/product-rateplans). |
| `get_rate_plan` | Get rate plan by ID. |
| `create_rate_plan` | Create rate plan (productId, name, type: contract\|ongoing\|prepaid). |
| `update_rate_plan` | Update rate plan by ID. |
| `delete_rate_plan` | Delete rate plan by ID. |
| `update_rate_plan_status` | Update status (published, archived, disabled, discontinue). |
| `sync_rate_plan` | Sync rate plan (POST …/sync). |

#### Rate plan charges (5 tools)

| Tool | Description |
|------|-------------|
| `list_rate_plan_charges` | List charges for a rate plan (GET …/product-rateplan-charges). |
| `get_rate_plan_charge` | Get charge by ID. |
| `create_rate_plan_charge` | Create charge (ratePlanId, name, chargeType, chargeModel, billCycleType, category, **chargeTier** array, taxable, weight, endDateCondition, …). Enums: chargeType (oneTime, recurring, usage), chargeModel (flatFeePricing, perUnitPricing, tieredPricing, volumePricing), billingPeriod (day, week, month, year), billingTiming (inAdvance, inArrears). |
| `update_rate_plan_charge` | Update charge by ID. |
| `delete_rate_plan_charge` | Delete charge by ID. |

#### Subscriptions (20 tools)

| Tool | Description |
|------|-------------|
| `list_subscriptions` | List subscriptions (include, status, query, orderBy, sortBy, itemPerPage, pageNo). |
| `get_subscription` | Get subscription by ID. |
| `create_subscription` | Create subscription (customerId, name, companyCurrencyId, effectiveStartDate, ratePlan array). |
| `update_subscription` | Update subscription by ID. |
| `delete_subscription` | Delete subscription by ID. |
| `update_subscription_status` | Update status (e.g. archived). |
| `get_subscription_next_bill` | Preview next bill. |
| `get_subscription_upcoming_charges` | Upcoming charges. |
| `get_subscription_invoices` | Invoices for subscription. |
| `get_subscription_logs` | Logs for subscription. |
| `get_subscription_external_invoices` | External invoices. |
| `list_subscription_rate_plans` | Rate plans on subscription. |
| `get_subscription_rate_plan` | Get rate plan by ID. |
| `add_subscription_rate_plan` | Add rate plan to subscription. |
| `update_subscription_rate_plan` | Update rate plan (effectiveStartDate, etc.). |
| `remove_subscription_rate_plan` | Remove rate plan from subscription. |
| `get_subscription_rate_plan_charge` | Get rate plan charge by ID. |
| `add_subscription_rate_plan_charge` | Add charge to rate plan. |
| `update_subscription_rate_plan_charge` | Update rate plan charge. |
| `remove_subscription_rate_plan_charge` | Remove charge from rate plan. |

#### Invoices (8 tools)

| Tool | Description |
|------|-------------|
| `list_invoices` | List invoices (include, status, query, orderBy, sortBy, filterId, itemPerPage, pageNo). |
| `get_invoice` | Get invoice by ID. |
| `create_invoice` | Create invoice. Required: companyCurrencyId, companyGatewayId, customerId, paymentMethodId, detail. Amount in dollar strings or cents in detail. |
| `update_invoice` | Update invoice (only posted/requestPayment). |
| `delete_invoice` | Delete invoice by ID. |
| `charge_invoice` | Charge invoice (card/online). Required: invoiceId, amount (cents), paymentType (e.g. thirdPartyPaymentProvider). |
| `charge_invoice_external` | Charge via offline (cash/check/wire). Required: invoiceId, amount (cents). |
| `void_invoice` | Void invoice (irreversible). |

#### Transactions (4 tools)

| Tool | Description |
|------|-------------|
| `list_transactions` | List transactions (orderBy, sortBy, itemPerPage, pageNo). |
| `get_transaction` | Get transaction by ID. |
| `refund_transaction` | Refund transaction. Required: transactionId, amount (**in cents**, e.g. 250 = $2.50). |
| `void_transaction` | Void transaction (before settlement only). |

#### Bill runs (4 tools)

| Tool | Description |
|------|-------------|
| `list_bill_runs` | List bill runs. Optional: include (e.g. invoice), query (completed/pending/error), orderBy, sortBy, itemPerPage, pageNo. |
| `get_bill_run` | Get bill run by ID. |
| `update_bill_run` | Update bill run schedule. Required: billRunId, newDateTime (ISO 8601, e.g. 2026-02-26T20:05:00Z). |
| `get_bill_run_invoices` | Get invoices for a bill run. |

### Resources

Resources expose API documentation as markdown. Use `resources/list` to see available URIs, then `resources/read` with a URI to get the content.

| URI | Description |
|-----|-------------|
| `rebillia://api/overview` | API overview and base URL |
| `rebillia://api/authentication` | Auth (X-AUTH-TOKEN) |
| `rebillia://api/customers` | Customers endpoints and parameters |
| `rebillia://api/subscriptions` | Subscriptions and rate plans |
| `rebillia://api/invoices` | Invoices endpoints |

Full interactive API reference: [https://apiguide.rebillia.com/](https://apiguide.rebillia.com/)

## Project structure

```
mcp/
├── src/
│   ├── index.ts              # MCP server entry, handlers for tools & resources
│   ├── client.ts             # HTTP client for Rebillia API (X-AUTH-TOKEN)
│   ├── types.ts              # Rebillia API types (customers, invoices, etc.)
│   ├── services/             # API call layer (used by tools)
│   │   ├── customerServices.ts
│   │   ├── productServices.ts
│   │   ├── productRatePlanServices.ts
│   │   ├── productRatePlanChargeServices.ts
│   │   ├── subscriptionServices.ts
│   │   ├── invoiceServices.ts
│   │   ├── transactionServices.ts
│   │   └── billRunServices.ts
│   ├── tools/
│   │   ├── index.ts          # Tool registry, getToolDefinitions(), executeTool()
│   │   ├── types.ts          # Tool definition and handler types
│   │   ├── customers/         # Customer tools (21)
│   │   ├── products/         # Product tools (8)
│   │   ├── product_rate_plans/       # Product rate plan tools (7)
│   │   ├── product_rate_plan_charges/# Rate plan charge tools (5)
│   │   ├── subscriptions/    # Subscription tools (20)
│   │   ├── invoices/         # Invoice tools (8)
│   │   ├── transactions/     # Transaction tools (4)
│   │   └── bill_runs/        # Bill run tools (4)
│   ├── resources/
│   │   ├── index.ts          # listResources(), readResource()
│   │   └── api-docs.ts       # Markdown content for rebillia://api/* URIs
│   └── prompts/              # (reserved for MCP prompts)
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| build | `npm run build` | Compile TypeScript to `dist/` |
| start | `npm start` | Run `node dist/index.js` |
| dev | `npm run dev` | Run with `tsx` (no build) |
| test | `npm test` | Run Vitest |

## License

MIT
