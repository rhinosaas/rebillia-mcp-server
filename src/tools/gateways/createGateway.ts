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
    "Create a company gateway. POST /gateways. Required: gblGatewayId, setting (object with credential keys, e.g. publicKey, privateKey, merchantId). Optional: displayName, card (array of card type IDs), paymentMethod.",
  inputSchema: {
    type: "object" as const,
    properties: {
      gblGatewayId: { type: "number", description: "Global gateway ID (required)" },
      displayName: { type: "string", description: "Display name for the gateway" },
      setting: {
        type: "object",
        description:
          "Credentials object (required). Keys depend on gateway type, e.g. publicKey, privateKey, merchantId, transactionKey. Pass as key-value object.",
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
