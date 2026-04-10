# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- REB-4438: Added `get_customer_unpaid_invoices` for `GET /customers/{customerId}/invoices/unpaid` with pagination support (`pageNo`, `itemPerPage`), including customer tool registration, service wiring, tests, and README docs updates.
- REB-4430: Added `list_products` filters for `status` (`published|draft|archived|disabled`), `name`, and `category` (`baseProducts|addOn|bundleProduct|miscellaneous|service`) in tool schema, API query forwarding, and README docs.
- REB-4433: Added `list_transactions` filters for `customerId`, `invoiceId`, `status` (`settled|authorized|declined|error|voided|requiresPaymentMethod|awaitingForSettlement|authorizeAndHold`), `type` (`sale|refund`), `dateFrom`, `dateTo`, and `companyGatewayId`; wired query forwarding, added tool tests, and updated README docs.
- REB-4432: Added `list_subscription_rate_plans` filters for `status` (`active|pause|cancel|archived`) and `type` (`ongoing|prepaid|contract`) with case-insensitive normalization, wired query forwarding, added tests, and updated README docs.

## [1.0.0] - 2025-02-18

### Added

- MCP server for the Rebillia subscription billing API
- Tools: customers, products, rate plans, rate plan charges, subscriptions, invoices, transactions, bill runs, gateways, currencies, integrations, shipping, filters, documentation
- Resources: API docs (overview, models, subscription-statuses, charge-types)
- `get_api_docs` tool for documentation without external fetch
- Vitest tests: client, customer tools, subscription tools, integration (MCP protocol)