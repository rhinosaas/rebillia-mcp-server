import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as gatewayService from "../../services/gatewayServices.js";

/** setting: nested object for credentials (key-value). Values can be string or number. */
const settingSchema = z.record(z.union([z.string(), z.number(), z.boolean()]));

const schema = z.object({
  gblGatewayId: z.number().int().positive("gblGatewayId is required"),
  displayName: z.string().optional(),
  setting: settingSchema.refine((obj) => Object.keys(obj).length > 0, "setting must have at least one credential key"),
  card: z.array(z.number().int()).optional(),
  paymentMethod: z.string().optional(),
});

const definition = {
  name: "create_gateway",
  description:
    "Create a company gateway. POST /gateways. Required: gblGatewayId, setting (credentials object). Optional: displayName, card (array of card type IDs), paymentMethod. Use list_global_gateways first to discover valid gblGatewayId and required setting keys (requiredFields / fieldDetails) for each gateway type (e.g. Stripe, Braintree); then build setting with those keys as field names and your credential values.",
  inputSchema: {
    type: "object" as const,
    properties: {
      gblGatewayId: {
        type: "number",
        description:
          "Global gateway ID (required). Obtain from list_global_gateways; use the id as gblGatewayId.",
      },
      displayName: { type: "string", description: "Display name for the gateway" },
      setting: {
        type: "object",
        description:
          "Credentials object (required). Keys must match the gateway's requiredFields from list_global_gateways (e.g. publicKey, privateKey, merchantId, transactionKey). Use fieldDetails for human-readable labels.",
      },
      card: {
        type: "array",
        description: "Array of card type IDs (optional)",
      },
      paymentMethod: { type: "string", description: "Payment method (optional, may be required by API)" },
    },
    required: ["gblGatewayId", "setting"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const body = {
    gblGatewayId: parsed.data.gblGatewayId,
    displayName: parsed.data.displayName,
    setting: parsed.data.setting,
    card: parsed.data.card,
    paymentMethod: parsed.data.paymentMethod,
  };
  return handleToolCall(() => gatewayService.createGateway(client, body));
}

export const createGatewayTool: Tool = {
  definition,
  handler,
};
