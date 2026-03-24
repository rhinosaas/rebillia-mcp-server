import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "effectiveStartDate must be in YYYY-MM-DD format");

const definition = {
  name: "create_subscription",
  description:
    "Create a subscription from a product rate plan. POST /subscriptions/from-product-rateplan. Required: productRatePlanId, customerId, customerPaymentMethodId, billingAddressId, effectiveStartDate.",
  inputSchema: {
    type: "object" as const,
    properties: {
      productRatePlanId: { type: "number", description: "Product rate plan ID" },
      customerId: { type: "number", description: "Customer ID" },
      customerPaymentMethodId: { type: "number", description: "Customer payment method ID" },
      billingAddressId: { type: "number", description: "Billing address ID" },
      effectiveStartDate: { type: "string", description: "Effective start date YYYY-MM-DD" },
    },
    required: ["productRatePlanId", "customerId", "customerPaymentMethodId", "billingAddressId", "effectiveStartDate"],
  },
};

const schema = z.object({
  productRatePlanId: z.number().int().positive("productRatePlanId is required"),
  customerId: z.number().int().positive("customerId is required"),
  customerPaymentMethodId: z.number().int().positive("customerPaymentMethodId is required"),
  billingAddressId: z.number().int().positive("billingAddressId is required"),
  effectiveStartDate: dateSchema,
});

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }

  const payload = parsed.data;
  return handleToolCall(() => subscriptionService.createSubscriptionFromProductRatePlan(client, payload));
}

export const createSubscriptionTool: Tool = {
  definition,
  handler,
};
