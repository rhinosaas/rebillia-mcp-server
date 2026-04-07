/**
 * Tool definition and execution types for Rebillia MCP tools
 */

import type RebilliaClient from "../client.js";

/** MCP tool definition (schema for tools/list) */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string; default?: unknown }>;
    required?: string[];
  };
}

/** Result shape for tool execution (content for tools/call response) */
export interface ToolResult {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
}

/** Tool handler: (client, args) => ToolResult (or Promise) */
export type ToolHandler = (
  client: RebilliaClient,
  args: Record<string, unknown> | undefined
) => ToolResult | Promise<ToolResult>;

/** Tool with definition and handler */
export interface Tool {
  definition: ToolDefinition;
  handler: ToolHandler;
}
