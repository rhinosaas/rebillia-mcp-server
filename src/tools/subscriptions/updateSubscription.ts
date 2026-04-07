import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  name: z.string().optional(),
  companyCurrencyId: z.number().int().optional(),
  companyGatewayId: z.number().int().optional(),
  customerPaymentMethodId: z.number().int().optional(),
  detail: z.string().optional(),
  effectiveStartDate: z.string().optional(),
  billingAddressId: z.number().int().optional(),
  shippingAddressId: z.number().int().optional(),
});

const definition = {
  name: "update_subscription",
  description:
    "Update a subscription. PUT /subscriptions/{subscriptionId}. Optional: name, companyCurrencyId, companyGatewayId, customerPaymentMethodId, detail, effectiveStartDate, billingAddressId, shippingAddressId.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      name: { type: "string", description: "Subscription name" },
      companyCurrencyId: { type: "number", description: "Company currency ID" },
      companyGatewayId: { type: "number", description: "Company gateway ID" },
      customerPaymentMethodId: { type: "number", description: "Customer payment method ID" },
      detail: { type: "string", description: "Detail" },
      effectiveStartDate: { type: "string", description: "Effective start date" },
      billingAddressId: { type: "number", description: "Billing address ID" },
      shippingAddressId: { type: "number", description: "Shipping address ID" },
    },
    required: ["subscriptionId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, ...body } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.updateSubscription(client, subscriptionId, body)
  );
}

export const updateSubscriptionTool: Tool = {
  definition,
  handler,
};
