# Rebillia MCP Server

Model Context Protocol (MCP) server for the [Rebillia Public API](https://apiguide.rebillia.com/). It exposes **tools** to call the API and **resources** with API documentation so AI assistants can list customers, get customer details, and understand the API.

## Features

- **Tools** – Call Rebillia endpoints from your MCP client (e.g. Cursor, Claude Desktop):
  - `list_customers` – Paginated list with search, status, sort, and includes
  - `get_customer` – Get a customer by ID with optional address book and payment methods
- **Resources** – Read API docs via MCP resources (URIs under `rebillia://api/`):
  - Overview, authentication, customers, subscriptions, invoices
- **Types** – TypeScript types aligned with the Rebillia Public API response shapes

## Requirements

- Node.js 18+
- A Rebillia API key (from your Rebillia dashboard)

## Setup

1. **Clone and install**

   ```bash
   cd /path/to/mcp
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
   - `REBILLIA_API_URL` – Optional. Defaults to `https://api.rebillia.com/v1`.

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

Example configuration for Cursor (or other MCP clients). Add the Rebillia server to your MCP settings, e.g. in `.cursor/mcp.json` or the client’s MCP config:

```json
{
  "mcpServers": {
    "rebillia": {
      "command": "node",
      "args": ["/absolute/path/to/mcp/dist/index.js"],
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

| Tool              | Description |
|-------------------|-------------|
| `list_customers`  | List customers with `pageNo`, `itemPerPage`, `query`, `status`, `sortBy`, `orderBy`, `include`, `filterId`. |
| `get_customer`    | Get customer by `id` with optional `includeAddresses` and `includePaymentMethods`. |

Responses are JSON from the Rebillia Public API (paginated for list, single object for get).

### Resources

Resources expose API documentation as markdown. Use `resources/list` to see available URIs, then `resources/read` with a URI to get the content.

| URI                       | Description                |
|---------------------------|----------------------------|
| `rebillia://api/overview` | API overview and base URL |
| `rebillia://api/authentication` | Auth (X-AUTH-TOKEN)  |
| `rebillia://api/customers`      | Customers endpoints and parameters |
| `rebillia://api/subscriptions`  | Subscriptions and rate plans |
| `rebillia://api/invoices`       | Invoices endpoints        |

Full interactive API reference: [https://apiguide.rebillia.com/](https://apiguide.rebillia.com/)

## Project structure

```
mcp/
├── src/
│   ├── index.ts           # MCP server entry, handlers for tools & resources
│   ├── client.ts          # HTTP client for Rebillia API (X-AUTH-TOKEN)
│   ├── types.ts           # Rebillia API types (customers, invoices, etc.)
│   ├── tools/
│   │   ├── index.ts       # Tool registry, getToolDefinitions(), executeTool()
│   │   ├── types.ts      # Tool definition and handler types
│   │   ├── listCustomers.ts
│   │   └── getCustomer.ts
│   ├── resources/
│   │   ├── index.ts      # listResources(), readResource()
│   │   └── api-docs.ts   # Markdown content for rebillia://api/* URIs
│   └── prompts/          # (reserved for MCP prompts)
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## Scripts

| Script   | Command        | Description                    |
|----------|----------------|--------------------------------|
| build    | `npm run build` | Compile TypeScript to `dist/` |
| start    | `npm start`     | Run `node dist/index.js`      |
| dev      | `npm run dev`   | Run with `tsx` (no build)     |
| test     | `npm test`      | Run Vitest                     |

## License

MIT
