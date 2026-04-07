import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as gatewayService from "../../services/gatewayServices.js";

const schema = z.object({
  companyGatewayId: z.number({ required_error: "companyGatewayId is required" }),
  customerId: z.number({ required_error: "customerId is required" }),
});

const definition = {
  name: "create_setup_intent",
  description:
    "Create or retrieve a setup intent via the gateway endpoint. Use only as part of a gateway-agnostic payment method flow: the returned setupIntent.id can be used as paymentMethodNonce for create_customer_payment_method. No raw card data.",
  inputSchema: {
    type: "object" as const,
    properties: {
      companyGatewayId: { type: "number", description: "Company gateway ID (required)." },
      customerId: { type: "number", description: "Customer ID (required)." },
    },
    required: ["companyGatewayId", "customerId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { companyGatewayId, customerId } = parsed.data;
  return handleToolCall(() =>
    gatewayService.createSetupIntent(client, String(companyGatewayId), String(customerId))
  );
}

export const createSetupIntentTool: Tool = {
  definition,
  handler,
};

