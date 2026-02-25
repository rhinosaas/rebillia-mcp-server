#!/usr/bin/env node

/**
 * Rebillia MCP Server
 * Model Context Protocol server for Rebillia API integration
 */

import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import RebilliaClient from "./client.js";
import { registerResources } from "./resources/api-docs.js";
import { executeTool, getToolDefinitions } from "./tools/index.js";

// ============================================================================
// Environment Configuration
// ============================================================================

const REBILLIA_API_KEY = process.env.REBILLIA_API_KEY;
if (!REBILLIA_API_KEY) {
  throw new Error("REBILLIA_API_KEY environment variable is required");
}

const REBILLIA_API_URL = process.env.REBILLIA_API_URL || "https://api.rebillia.com/v1";

// ============================================================================
// Initialize Rebillia Client
// ============================================================================

const rebilliaClient = new RebilliaClient(REBILLIA_API_KEY, REBILLIA_API_URL);

// ============================================================================
// Initialize MCP Server
// ============================================================================

const server = new Server(
  {
    name: "rebillia-mcp-server",
    version: "1.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ============================================================================
// Resources (rebillia://docs/* – overview, models, subscription-statuses, charge-types)
// ============================================================================

registerResources(server);

// ============================================================================
// Handle tools/list
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: getToolDefinitions(),
  };
});

// ============================================================================
// Handle tools/call
// ============================================================================

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const result = await executeTool(name, args, rebilliaClient);

    if (result) {
      return result as { content: Array<{ type: "text"; text: string }>; isError?: boolean };
    }

    return {
      content: [
        {
          type: "text",
          text: `Unknown tool: ${name}`,
        },
      ],
      isError: true,
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// ============================================================================
// Start Server
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Rebillia MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
