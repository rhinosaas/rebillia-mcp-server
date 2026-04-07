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
  name: "get_client_token",
  description:
    "Get the gateway client credential to initialize your payment integration and produce a paymentMethodNonce. Use the returned value in your hosted payment UI; then pass the resulting token as paymentMethodNonce to create_customer_payment_method. Gateway-agnostic: no gateway-specific concepts in MCP. Optional customerId scopes the credential to a customer (e.g. for vault). Required for PayFabric; optional for others. Requires company API token (X-AUTH-TOKEN).",
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
