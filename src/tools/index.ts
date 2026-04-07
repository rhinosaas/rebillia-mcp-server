/**
 * Rebillia MCP tools: definitions and execution
 */

import type RebilliaClient from "../client.js";
import type { Tool, ToolDefinition, ToolResult } from "./types.js";
import { registerCustomerTools } from "./customers/index.js";
import { registerProductTools } from "./products/index.js";
import { registerProductRatePlanTools } from "./product_rate_plans/index.js";
import { registerProductRatePlanChargeTools } from "./product_rate_plan_charges/index.js";
import { registerInvoiceTools } from "./invoices/index.js";
import { registerSubscriptionTools } from "./subscriptions/index.js";
import { registerTransactionTools } from "./transactions/index.js";
import { registerBillRunTools } from "./bill_runs/index.js";
import { registerGatewayTools } from "./gateways/index.js";
import { registerCurrencyTools } from "./currencies/index.js";
import { registerIntegrationTools } from "./integrations/index.js";
import { registerShippingTools } from "./shipping/index.js";
import { registerFilterTools } from "./filters/index.js";
import { registerDocsTools } from "./docs/index.js";

// ============================================================================
// Tool registry (storage)
// ============================================================================

const tools: Tool[] = [
  ...registerCustomerTools(),
  ...registerProductTools(),
  ...registerProductRatePlanTools(),
  ...registerProductRatePlanChargeTools(),
  ...registerSubscriptionTools(),
  ...registerInvoiceTools(),
  ...registerTransactionTools(),
  ...registerBillRunTools(),
  ...registerGatewayTools(),
  ...registerCurrencyTools(),
  ...registerIntegrationTools(),
  ...registerShippingTools(),
  ...registerFilterTools(),
  ...registerDocsTools(),
];

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
