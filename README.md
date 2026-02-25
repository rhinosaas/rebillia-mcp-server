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
- **Gateways** (6 tools) – List, get, create, update, delete, test gateway
- **Currencies** (7 tools) – List, get, create, update, delete, get/set default currency
- **Integrations** (8 tools) – List, get config, get/list by key; external invoices, products, order statuses
- **Shipping** (2 tools) – List shipping services, calculate shipping
- **Filters** (3 tools) – List filters (section required), create filter, list filter fields
- **Documentation** (1 tool) – `get_api_docs` returns overview or other API docs as markdown (no external fetch)
- **Resources** – API docs via MCP resources (`rebillia://docs/*`): overview, models, subscription-statuses, charge-types. All docs are self-contained; use these or the tool instead of fetching external URLs.
- **Types** – TypeScript types aligned with the Rebillia Public API response shapes

## Requirements

- Node.js 18+
- A Rebillia API key (see below)

### Getting Your API Key

1. Sign up or log in at [admin.rebillia.com](https://admin.rebillia.com).
2. Go to **Advance Settings** → **Api Accounts** → **Create new keys**.
3. Copy the generated API key and use it as `REBILLIA_API_KEY` in your environment or MCP client config.

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

### Configuring Claude Desktop

1. **Build the server** (if you haven’t already):
   ```bash
   npm run build
   ```

2. **Open the Claude Desktop MCP config file:**
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

3. **Add the Rebillia server** under `mcpServers`. Use the **absolute path** to your project’s `dist/index.js`:

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

4. **Restart Claude Desktop.** The Rebillia tools and resources (including `get_api_docs`) will appear. You can ask Claude to use the Rebillia API or to “get the API docs” for overview information.

### Configuring Cursor

1. **Build the server:**
   ```bash
   npm run build
   ```

2. **Open Cursor MCP settings:**
   - **Settings** → **Cursor Settings** → **MCP**, or
   - Open the MCP config file directly:
     - **macOS/Linux:** `~/.cursor/rebillia-mcp-server.json` or project-level `.cursor/mcp.json`
     - **Windows:** `%USERPROFILE%\.cursor\-rebillia-mcp-server.json`

3. **Add the Rebillia server** in the MCP config. Example:

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

   Replace `/absolute/path/to/rebillia-mcp-server` with the real path to your Rebillia MCP server project (the folder that contains `dist/index.js`).

4. **Restart Cursor** or reload the MCP servers. Rebillia tools and resources will be available in the AI chat (e.g. “List customers”, “Get API docs”).

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

#### Gateways (6 tools)

| Tool | Description |
|------|-------------|
| `list_gateways` | List company gateways. |
| `get_gateway` | Get gateway by ID. |
| `create_gateway` | Create gateway (gblGatewayId, name, setting credentials). |
| `update_gateway` | Update gateway by ID. |
| `delete_gateway` | Delete gateway by ID. |
| `test_gateway` | Test gateway connection. |

#### Currencies (7 tools)

| Tool | Description |
|------|-------------|
| `list_currencies` | List company currencies. |
| `get_currency` | Get currency by ID. |
| `create_currency` | Create company currency. |
| `update_currency` | Update currency by ID. |
| `delete_currency` | Delete currency by ID. |
| `get_default_currency` | Get default company currency. |
| `set_default_currency` | Set default currency by ID. |

#### Integrations (8 tools)

| Tool | Description |
|------|-------------|
| `list_integrations` | List company integrations. |
| `get_integration_config` | Get integration config by ID. |
| `get_integration_by_key` | Get integration by key. |
| `list_integrations_by_key` | List integrations by key. |
| `list_external_invoices` | List external invoices. |
| `list_external_products` | List external products (productName required). |
| `get_external_product` | Get external product by ID. |
| `list_order_statuses` | List order statuses. |

#### Shipping (2 tools)

| Tool | Description |
|------|-------------|
| `list_shipping_services` | List shipping services. |
| `calculate_shipping` | Calculate shipping (companyCurrencyId, fromZip, fromCountry, zip, country, weight, orderAmount, etc.). |

#### Filters (3 tools)

| Tool | Description |
|------|-------------|
| `list_filters` | List company filters. Required: section (e.g. subscriptions, invoices, customers, products, orders, billRuns). |
| `create_filter` | Create filter (section, displayName, rules). |
| `list_filter_fields` | List filter fields for a section. |

#### Documentation (1 tool)

| Tool | Description |
|------|-------------|
| `get_api_docs` | Get Rebillia API documentation as markdown. Default: overview (base URLs, auth, pagination, dates, amounts). Optional: doc = overview \| models \| subscription-statuses \| charge-types. Use this so Claude can read docs without fetching external URLs. |

### Resources

API documentation is exposed as MCP resources under `rebillia://docs/*`. Use `resources/list` then `resources/read` with the URI, or call the `get_api_docs` tool. All docs are self-contained; do not fetch external URLs.

| URI | Description |
|-----|-------------|
| `rebillia://docs/overview` | Overview documentation – base URLs, auth, pagination, date format, amount handling (read this first) |
| `rebillia://docs/models` | Domain model hierarchy and relationships |
| `rebillia://docs/subscription-statuses` | Subscription statuses: active, paused, archived, requestPayment |
| `rebillia://docs/charge-types` | chargeType, chargeModel, billingPeriod, billingTiming enums |

## Project structure

```
mcp/
├── src/
│   ├── index.ts              # MCP server entry, registerResources(), tools & resources handlers
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
│   │   ├── billRunServices.ts
│   │   ├── gatewayServices.ts
│   │   ├── currencyServices.ts
│   │   ├── integrationServices.ts
│   │   ├── shippingServices.ts
│   │   └── filterServices.ts
│   ├── tools/
│   │   ├── index.ts          # Tool registry, getToolDefinitions(), executeTool()
│   │   ├── types.ts          # Tool definition and handler types
│   │   ├── customers/        # Customer tools (21)
│   │   ├── products/         # Product tools (8)
│   │   ├── product_rate_plans/        # Rate plan tools (7)
│   │   ├── product_rate_plan_charges/# Rate plan charge tools (5)
│   │   ├── subscriptions/   # Subscription tools (20)
│   │   ├── invoices/         # Invoice tools (8)
│   │   ├── transactions/     # Transaction tools (4)
│   │   ├── bill_runs/        # Bill run tools (4)
│   │   ├── gateways/         # Gateway tools (6)
│   │   ├── currencies/       # Currency tools (7)
│   │   ├── integrations/     # Integration tools (8)
│   │   ├── shipping/         # Shipping tools (2)
│   │   ├── filters/          # Filter tools (3)
│   │   └── docs/             # get_api_docs (1)
│   ├── resources/
│   │   ├── index.ts          # listResources(), readResource() (legacy apiResources)
│   │   └── api-docs.ts       # registerResources(), docResources (rebillia://docs/*), getDocContent()
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
