/**
 * Rebillia MCP tools: definitions and execution
 */

import type RebilliaClient from "../client.js";
import type { Tool, ToolDefinition, ToolResult } from "./types.js";
import { getCustomerTool } from "./getCustomer.js";
import { listCustomersTool } from "./listCustomers.js";

// ============================================================================
// Tool registry (storage)
// ============================================================================

const tools: Tool[] = [listCustomersTool, getCustomerTool];

/** All tool definitions for tools/list */
export function getToolDefinitions(): ToolDefinition[] {
  return tools.map((t) => t.definition);
}

/** Execute a tool by name. Returns result or undefined if tool not found. */
export async function executeTool(
  name: string,
  args: Record<string, unknown> | undefined,
  client: RebilliaClient
): Promise<ToolResult | undefined> {
  const tool = tools.find((t) => t.definition.name === name);
  if (!tool) return undefined;
  return tool.handler(client, args);
}
