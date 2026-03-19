import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import { listGlobalGateways } from "../../services/globalGatewayService.js";

const definition = {
  name: "list_global_gateways",
  description:
    "List available global gateway types (e.g. Stripe, Braintree). GET /globals/gateways. Returns gblGatewayId, name, keyName, requiredFields (setting keys), and fieldDetails (keyName + displayName). Use this before create_gateway to discover valid gblGatewayId and which keys to pass in the setting object.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

async function handler(client: Client, _args: Record<string, unknown> | undefined) {
  return handleToolCall(() => listGlobalGateways(client));
}

export const listGlobalGatewaysTool: Tool = {
  definition,
  handler,
};
