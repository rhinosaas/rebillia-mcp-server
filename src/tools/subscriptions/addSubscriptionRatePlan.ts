import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const chargeTierItemSchema = z.object({
  currency: z.string().min(1),
  startingUnit: z.string().optional(),
  endingUnit: z.string().optional(),
  price: z.number(),
  priceFormat: z.string().optional(),
  tier: z.number().int().optional(),
});

const ratePlanChargeItemSchema = z.object({
  productRatePlanChargeId: z.number().int().optional(),
  quantity: z.number().int().min(0),
  name: z.string().optional(),
  billCycleType: z.string().optional(),
  chargeType: z.string().optional(),
  endDateCondition: z.string().optional(),
  taxable: z.boolean().optional(),
  chargeTier: z.array(chargeTierItemSchema).optional(),
  billingPeriod: z.string().optional(),
  billingTiming: z.string().optional(),
  billingPeriodAlignment: z.string().optional(),
  specificBillingPeriod: z.number().int().optional(),
});

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  productRatePlanId: z.number().int().positive("productRatePlanId is required"),
  name: z.string().optional(),
  type: z.enum(["contract", "ongoing", "prepaid"]).optional(),
  effectiveStartDate: z.string().optional(),
  changeStatusBasedOnCharge: z.boolean().optional(),
  ratePlanCharge: z.array(ratePlanChargeItemSchema).optional(),
});

const definition = {
  name: "add_subscription_rate_plan",
  description:
    "Add a rate plan to a subscription. POST /subscriptions/{subscriptionId}/rateplans. Required: productRatePlanId (product rate plan to attach). Optional: name, type (contract|ongoing|prepaid), effectiveStartDate, changeStatusBasedOnCharge, ratePlanCharge (array of {quantity, optional productRatePlanChargeId, or name, chargeType, chargeTier, etc.).",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      productRatePlanId: { type: "number", description: "Product rate plan ID to add (required)" },
      name: { type: "string", description: "Override name" },
      type: { type: "string", description: "contract, ongoing, or prepaid" },
      effectiveStartDate: { type: "string", description: "YYYY-MM-DD" },
      changeStatusBasedOnCharge: { type: "boolean", description: "Change status based on charge" },
      ratePlanCharge: {
        type: "array",
        description: "Initial charges: each { quantity, optional productRatePlanChargeId, or full definition with chargeTier }",
      },
    },
    required: ["subscriptionId", "productRatePlanId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, ...body } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.addSubscriptionRatePlan(client, subscriptionId, body)
  );
}

export const addSubscriptionRatePlanTool: Tool = {
  definition,
  handler,
};
