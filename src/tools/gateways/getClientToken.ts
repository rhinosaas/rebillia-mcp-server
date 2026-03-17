import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as gatewayService from "../../services/gatewayServices.js";

const schema = z.object({
  gatewayId: z.number({ required_error: "gatewayId is required" }),
  customerId: z.number().optional(),
});

const definition = {
  name: "rebillia_get_client_token",
  description:
    "Get a payment gateway client token from Rebillia Public API. Use when building checkout, initializing a payment SDK (e.g. Braintree/Stripe), or saving payment methods. Optional customerId scopes the token to an existing customer (e.g. for vault). Required for PayFabric gateway; optional for others. Requires company API token (X-AUTH-TOKEN).",
  inputSchema: {
    type: "object" as const,
    properties: {
      gatewayId: {
        type: "number",
        description: "Company gateway ID (e.g. from rebillia_list_gateways or dashboard).",
      },
      customerId: {
        type: "number",
        description:
          "Optional. Rebillia customer ID when the token must be scoped to a customer (e.g. for saved payment methods). Required for PayFabric gateway.",
      },
    },
    required: ["gatewayId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { gatewayId, customerId } = parsed.data;
  return handleToolCall(() =>
    gatewayService.getClientToken(client, String(gatewayId), customerId != null ? { customerId } : undefined)
  );
}

export const getClientTokenTool: Tool = {
  definition,
  handler,
};
