# Rebillia MCP Server

Model Context Protocol (MCP) server for the [Rebillia Public API](https://apiguide.rebillia.com/). It exposes **tools** to call the API and **resources** with API documentation so AI assistants can manage customers, products, rate plans, and understand the API.

## Features

- **Tools** – Call Rebillia endpoints from your MCP client (e.g. Cursor, Claude Desktop):
  - **Customers** (21 tools) – List, get, create, update, delete; invoices, subscriptions, logs; addresses and payment methods; charges/credits
  - **Products** (8 tools) – List, get, create, update, delete; update status; link/unlink external products
  - **Product rate plans** (7 tools) – List by product, get, create, update, delete; update status; sync
  - **Product rate plan charges** (5 tools) – List by product rate plan, get, create, update, delete (with chargeType, chargeModel, billingPeriod, billingTiming enums and chargeTier array)
  - **Subscriptions** (19 tools) – List, get, create, update, delete; status; next bill, upcoming charges, invoices, logs, external invoices; subscription rate plans and rate plan charges (add/update/remove)
  - **Invoices** (8 tools) – List, get, create, update, delete; charge (card/online with paymentType), charge_external (offline), void
- **Transactions** (4 tools) – List (customerId, invoiceId, status, type, dateFrom/dateTo, companyGatewayId, orderBy/sortBy, pagination), get, refund (amount in **cents**), void (before settlement only)
  - **Bill runs** (4 tools) – List (filter by completed/pending/error), get, update (newDateTime, ISO 8601; pending only), get bill run invoices
- **Gateways** (9 tools) – List global gateways (discover gblGatewayId and required setting keys), list company gateways, get, create, update, delete, test gateway, get client token, create setup intent
- **Currencies** (7 tools) – List, get, create, update, delete, get/set default currency
- **Integrations** (8 tools) – List, get config, get/list by key; external invoices, products, order statuses
- **Shipping** (2 tools) – List shipping services, calculate shipping
- **Filters** (4 tools) – List filters (section required), create filter, list filter fields, remove filter
- **Documentation** (1 tool) – `get_api_docs` returns overview or other API docs as markdown (no external fetch)
- **Resources** – API docs via MCP resources (`rebillia://docs/*`): overview, models, subscription-statuses, charge-types, gateways. Country list at `rebillia://globals/countries` (id, code, name) for address tools. Global gateways at `rebillia://globals/gateways` (gblGatewayId, requiredFields) for gateway creation. All docs are self-contained; use these or the tool instead of fetching external URLs.
- **Types** – TypeScript types aligned with the Rebillia Public API response shapes

## Requirements

- Node.js 18+
- A Rebillia API key (see below)

### Getting Your API Key

1. Go to [Rebillia setup / welcome](https://admin.rebillia.com/setup/welcome?source=dev).
2. **Select a plan** and continue.
3. **Sign up** (create an account) or **log in** if you already have a Rebillia account.
4. After you’re in your company, open the **dashboard**.
5. In the dashboard, **copy your API Token** and use it as `REBILLIA_API_KEY` in your environment or MCP client config.

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

3. **Add the Rebillia server** under `mcpServers`:

   ```json
   {
     "mcpServers": {
       "rebillia": {
         "command": "npx",
         "args": ["@rhinosaas/rebillia-mcp-server"],
         "env": {
           "REBILLIA_API_KEY": "YOUR_API_KEY",
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
  - **Windows:** `%USERPROFILE%\.cursor\rebillia-mcp-server.json`

3. **Add the Rebillia server** in the MCP config. Example:

   ```json
   {
     "mcpServers": {
       "rebillia": {
         "command": "npx",
         "args": ["@rhinosaas/rebillia-mcp-server"],
         "env": {
           "REBILLIA_API_KEY": "your_api_key_here",
           "REBILLIA_API_URL": "https://api.rebillia.com/v1"
         }
       }
     }
   }
   ```

4. **Restart Cursor** or reload the MCP servers. Rebillia tools and resources will be available in the AI chat (e.g. “List customers”, “Get API docs”).

### Tools

Responses are JSON from the Rebillia Public API (paginated for list endpoints, single object for get).

#### Customers (21 tools)

| Tool | Description |
|------|-------------|
| `list_customers` | List customers (pageNo, itemPerPage, query, status, sortBy, orderBy, include, filterId). |
| `get_customer` | Get customer by ID (optional include: addressbook, paymentmethod, lastInvoice, subscriptions, unpaidInvoices, externalCustomers). |
| `create_customer` | Create customer (firstName, lastName, email, optional fields). |
| `update_customer` | Update customer by ID. |
| `delete_customer` | Delete customer by ID. |
| `get_customer_invoices` | Get invoices for a customer. |
| `get_customer_subscriptions` | Get subscriptions for a customer. |
| `get_customer_logs` | Get logs for a customer. |
| `list_customer_addresses` | List address book entries for a customer (pageNo, itemPerPage). |
| `get_customer_address` | Get address by ID. |
| `create_customer_address` | Create address (name, contactName, street1, city, state, zip, countryCode (ISO 3166-1 alpha-2), type, …). |
| `update_customer_address` | Update address by ID (partial update). Required: customerId, addressId. Optional: any address field (e.g. street1, city, state, zip, countryCode, name, contactName, street2, company, contactEmail, contactPhone, type (residential|commercial)). |
| `delete_customer_address` | Delete address by ID. |
| `list_customer_payment_methods` | List payment methods for a customer (pageNo, itemPerPage). |
| `get_customer_payment_method` | Get payment method by ID. |
| `create_customer_payment_method` | Create payment method (gateway-agnostic). Required: companyGatewayId, type, **paymentMethodNonce**, billingAddress (countryCode, …). Get client credential via get_client_token; use your payment UI to produce paymentMethodNonce. No raw card data or gateway-specific fields. |
| `update_customer_payment_method` | Update payment method billing address (gateway-agnostic). Required: customerId, paymentMethodId, billingAddress (countryCode, …). No payment or gateway-specific fields. |
| `delete_customer_payment_method` | Delete payment method by ID. |
| `list_customer_charges_credits` | List charges/credits (optional status, type). |
| `create_customer_charge_credit` | Create charge/credit (amount in **cents**, description, type, companyCurrencyId, category, …). |
| `delete_customer_charge_credit` | Delete charge/credit by ID. |

#### Products (8 tools)

| Tool | Description |
|------|-------------|
| `list_products` | List products (include: productRateplan, productRateplanCharge, chargeTier; status: published\|draft\|archived\|disabled; name; category: baseProducts\|addOn\|bundleProduct\|miscellaneous\|service; orderBy, sortBy, itemPerPage, pageNo). |
| `get_product` | Get product by ID. |
| `create_product` | Create product (name, category, optional description, sku). |
| `update_product` | Update product by ID. |
| `delete_product` | Delete product by ID (cascades to product rate plans). |
| `update_product_status` | Update status (published, archived, disabled). |
| `link_external_product` | Link external product (productId, companyIntegrationId, external productId, settings). |
| `unlink_external_product` | Unlink external product by ID. |

#### Product rate plans (7 tools)

| Tool | Description |
|------|-------------|
| `list_product_rate_plans` | List product rate plans for a product (GET /products/{productId}/product-rateplans). |
| `get_product_rate_plan` | Get product rate plan by ID. |
| `create_product_rate_plan` | Create product rate plan (productId, name, type: contract\|ongoing\|prepaid). |
| `update_product_rate_plan` | Update product rate plan by ID. |
| `delete_product_rate_plan` | Delete product rate plan by ID. |
| `update_product_rate_plan_status` | Update status (published, archived, disabled, discontinue). |
| `sync_product_rate_plan` | Sync product rate plan (POST …/sync). |

#### Product rate plan charges (5 tools)

| Tool | Description |
|------|-------------|
| `list_product_rate_plan_charges` | List product rate plan charges for a product rate plan (GET …/product-rateplan-charges). |
| `get_product_rate_plan_charge` | Get product rate plan charge by ID. |
| `create_product_rate_plan_charge` | Create product rate plan charge (ratePlanId, name, chargeType, chargeModel, billCycleType, category, **chargeTier** array, taxable, weight, endDateCondition, …). Enums: chargeType (oneTime, recurring, usage), chargeModel (flatFeePricing, perUnitPricing, tieredPricing, volumePricing), billingPeriod (day, week, month, year), billingTiming (inAdvance, inArrears). |
| `update_product_rate_plan_charge` | Update product rate plan charge by ID. |
| `delete_product_rate_plan_charge` | Delete product rate plan charge by ID. |

#### Subscriptions (19 tools)

| Tool | Description |
|------|-------------|
| `list_subscriptions` | List subscriptions (include, query, orderBy, sortBy, filterId, status, customerId, companyGatewayId, dateFrom, dateTo, itemPerPage, pageNo). `status` supports: active, paused, requestPayment, archived. `dateFrom`/`dateTo` are `YYYY-MM-DD` createdAt-range filters. |
| `get_subscription` | Get subscription by ID. |
| `create_subscription` | Create subscription from product rate plan (productRatePlanId, customerId, customerPaymentMethodId, billingAddressId, effectiveStartDate). |
| `update_subscription` | Update subscription by ID. |
| `delete_subscription` | Delete subscription by ID. |
| `update_subscription_status` | Update status (e.g. archived). |
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
| `add_subscription_rate_plan_charge` | Add charge to rate plan. Required: subscriptionId, ratePlanId, quantity, name, category (physical\|digital), chargeModel (flatFeePricing\|perUnitPricing\|tieredPricing\|volumePricing), billCycleType, chargeTier (array: currency, price required; optional startingUnit, endingUnit, priceFormat, tier), chargeType (oneTime\|recurring\|usage), endDateCondition (subscriptionEnd\|fixedPeriod), taxable (boolean), weight. When chargeType is recurring, billingPeriodAlignment and specificBillingPeriod are also required. |
| `update_subscription_rate_plan_charge` | Update rate plan charge. Required: subscriptionId, chargeId, quantity, name, chargeModel, billCycleType, chargeTier (currency, price), chargeType, endDateCondition, taxable, weight. When chargeType is recurring, billingPeriodAlignment required. |
| `remove_subscription_rate_plan_charge` | Remove charge from rate plan. |

#### Invoices (8 tools)

| Tool | Description |
|------|-------------|
| `list_invoices` | List invoices (include, status, query, orderBy, sortBy, filterId, itemPerPage, pageNo). |
| `get_invoice` | Get invoice by ID. |
| `create_invoice` | Create invoice. Required: companyCurrencyId, companyGatewayId, customerId, paymentMethodId, detail. Optional billingAddress/shippingAddress use countryCode (ISO 3166-1 alpha-2). Amount can be '41.00' (dollars) or 4100 (cents); tool always sends cents to publicAPI. |
| `update_invoice` | Update invoice (only posted/requestPayment). |
| `delete_invoice` | Delete invoice by ID. |
| `charge_invoice` | Charge invoice (card/online). Required: invoiceId, amount (cents), paymentType (e.g. thirdPartyPaymentProvider). |
| `charge_invoice_external` | Charge via offline (cash/check/wire). Required: invoiceId, amount (cents). |
| `void_invoice` | Void invoice (irreversible). |

#### Transactions (4 tools)

| Tool | Description |
|------|-------------|
| `list_transactions` | List transactions (customerId, invoiceId, status, type, dateFrom, dateTo, companyGatewayId, orderBy, sortBy, itemPerPage, pageNo). `status`: settled\|authorized\|declined\|error\|voided\|requiresPaymentMethod\|awaitingForSettlement\|authorizeAndHold. `type`: sale\|refund. |
| `get_transaction` | Get transaction by ID. |
| `refund_transaction` | Refund transaction. Required: transactionId, amount (**in cents**, e.g. 250 = $2.50). |
| `void_transaction` | Void transaction (before settlement only). |

#### Bill runs (4 tools)

| Tool | Description |
|------|-------------|
| `list_bill_runs` | List bill runs. Optional: include (e.g. invoice), query (completed/pending/error), orderBy, sortBy, itemPerPage, pageNo. |
| `get_bill_run` | Get bill run by ID. |
| `update_bill_run` | Update bill run schedule. Required: billRunId, newDateTime (ISO 8601, e.g. 2026-02-26T20:05:00Z). Note: this tool only works on bill runs with status pending. Calls against completed or error runs will fail. |
| `get_bill_run_invoices` | Get invoices for a bill run. Optional: pageNo, itemPerPage. |

#### Gateways (9 tools)

| Tool | Description |
|------|-------------|
| `list_global_gateways` | List available global gateway types (e.g. Stripe, Braintree). Returns **gblGatewayId**, name, keyName, **requiredFields** (setting keys), and fieldDetails. Call this before `create_gateway` to discover valid gateway IDs and which keys to pass in `setting`. |
| `list_gateways` | List company gateways. |
| `get_gateway` | Get gateway by ID. |
| `create_gateway` | Create gateway. Required: **gblGatewayId** (from `list_global_gateways`), **setting** (object with keys from that gateway’s `requiredFields`). Optional: displayName, card, paymentMethod. Use `list_global_gateways` first to get gblGatewayId and required credential field names. |
| `update_gateway` | Update gateway by ID. |
| `delete_gateway` | Delete gateway by ID. |
| `test_gateway` | Test gateway connection. |
| `get_client_token` | Get the gateway client credential to initialize your payment integration and produce a **paymentMethodNonce** for create_customer_payment_method. Gateway-agnostic. Required: gatewayId. Optional: customerId; **required for PayFabric**, optional for others. |
| `create_setup_intent` | Create/retrieve a setup intent via `/gateways/{companyGatewayId}/customers/{customerId}/setup_intent`. Use setupIntent.id as **paymentMethodNonce** for create_customer_payment_method (gateway-agnostic payment flow). |

**Gateway creation example flow:** (1) Call `list_global_gateways` (no args). (2) Pick a gateway (e.g. Stripe, Braintree) and note its `gblGatewayId` and `requiredFields`. (3) Build a `setting` object with those keys and your credential values. (4) Call `create_gateway` with that `gblGatewayId` and `setting`. See `rebillia://docs/gateways` or `get_api_docs` with `doc: "gateways"` for full details.

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

#### Filters (4 tools)

| Tool | Description |
|------|-------------|
| `list_filters` | List company filters. Required: section (e.g. subscriptions, invoices, customers, products, orders, billRuns). |
| `create_filter` | Create filter (section, displayName, rules). |
| `list_filter_fields` | List filter fields for a section. |
| `remove_filter` | Delete a company filter by ID (DELETE /companies/filters/{filterId}). |

#### Documentation (1 tool)

| Tool | Description |
|------|-------------|
| `get_api_docs` | Get Rebillia API documentation as markdown. Default: overview (base URLs, auth, pagination, dates, amounts). Optional: doc = overview \| models \| subscription-statuses \| charge-types \| gateways. Use this so Claude can read docs without fetching external URLs. |

### Resources

API documentation is exposed as MCP resources under `rebillia://docs/*`. Use `resources/list` then `resources/read` with the URI, or call the `get_api_docs` tool. All docs are self-contained; do not fetch external URLs.

| URI | Description |
|-----|-------------|
| `rebillia://docs/overview` | Overview documentation – base URLs, auth, pagination, date format, amount handling (read this first) |
| `rebillia://docs/models` | Domain model hierarchy and relationships |
| `rebillia://docs/subscription-statuses` | Subscription statuses: active, paused, archived, requestPayment |
| `rebillia://docs/charge-types` | chargeType, chargeModel, billingPeriod, billingTiming enums |
| `rebillia://docs/gateways` | Gateway creation flow: use `list_global_gateways` to discover gblGatewayId and requiredFields, then build `setting` and call `create_gateway` |
| `rebillia://globals/gateways` | Global gateways list (when client provided): gblGatewayId, name, keyName, requiredFields, fieldDetails – use with `create_gateway` |

## Project structure

```
src/
├── index.ts              # MCP server entry, tools + resources handlers
├── client.ts             # HTTP client for Rebillia API (X-AUTH-TOKEN)
├── types.ts              # Rebillia API types (customers, invoices, etc.)
├── services/             # API call layer (used by tools)
│   ├── customerServices.ts
│   ├── productServices.ts
│   ├── productRatePlanServices.ts
│   ├── productRatePlanChargeServices.ts
│   ├── subscriptionServices.ts
│   ├── invoiceServices.ts
│   ├── transactionServices.ts
│   ├── billRunServices.ts
│   ├── gatewayServices.ts
│   ├── globalGatewayService.ts
│   ├── countryResolverService.ts
│   ├── currencyServices.ts
│   ├── integrationServices.ts
│   ├── shippingServices.ts
│   └── filterServices.ts
├── tools/
│   ├── index.ts          # Tool registry, getToolDefinitions(), executeTool()
│   ├── types.ts          # Tool definition and handler types
│   ├── customers/        # Customer tools (21)
│   ├── products/         # Product tools (8)
│   ├── product_rate_plans/         # Product rate plan tools (7)
│   ├── product_rate_plan_charges/  # Product rate plan charge tools (5)
│   ├── subscriptions/    # Subscription tools (19)
│   ├── invoices/         # Invoice tools (8)
│   ├── transactions/     # Transaction tools (4)
│   ├── bill_runs/        # Bill run tools (4)
│   ├── gateways/         # Gateway tools (9)
│   ├── currencies/       # Currency tools (7)
│   ├── integrations/     # Integration tools (8)
│   ├── shipping/         # Shipping tools (2)
│   ├── filters/          # Filter tools (4)
│   └── docs/             # get_api_docs (1)
├── resources/
│   ├── index.ts          # listResources(), readResource()
│   └── api-docs.ts       # registerResources(), doc resources, getDocContent()
├── prompts/              # (reserved for MCP prompts)
└── types/
    └── addressInput.ts
```

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| build | `npm run build` | Compile TypeScript to `dist/` |
| start | `npm start` | Run `node dist/index.js` |
| dev | `npm run dev` | Run with `tsx` (no build) |
| test | `npm test` | Run Vitest |
| test:run | `npm run test:run` | Run tests once (non-watch mode) |

## License

MIT
