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

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  chargeId: z.string().min(1, "chargeId is required"),
  quantity: z.number().int().min(0).optional(),
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
  weight: z.coerce.number().int().min(0).optional(),
});

const definition = {
  name: "update_subscription_rate_plan_charge",
  description:
    "Update a rate plan charge on a subscription. PUT /subscriptions/{subscriptionId}/rateplan-charges/{chargeId}. Optional: quantity, name, chargeType (oneTime|recurring|usage), chargeTier, billingPeriod, billingTiming, endDateCondition, taxable, weight (number), etc.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      chargeId: { type: "string", description: "Subscription rate plan charge ID (required)" },
      quantity: { type: "number", description: "Quantity" },
      name: { type: "string", description: "Charge name" },
      billCycleType: { type: "string", description: "Bill cycle type" },
      chargeType: { type: "string", description: "oneTime, recurring, or usage" },
      endDateCondition: { type: "string", description: "subscriptionEnd or fixedPeriod" },
      taxable: { type: "boolean", description: "Taxable" },
      chargeTier: {
        type: "array",
        description: "Array of {currency, price, optional startingUnit, endingUnit, priceFormat, tier}",
      },
      billingPeriod: { type: "string", description: "day, week, month, year" },
      billingTiming: { type: "string", description: "inAdvance, inArrears" },
      billingPeriodAlignment: { type: "string", description: "Alignment" },
      specificBillingPeriod: { type: "number", description: "Specific billing period" },
      weight: { type: "number", description: "Weight (integer, sent as number to API)" },
    },
    required: ["subscriptionId", "chargeId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, chargeId, ...body } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.updateSubscriptionRatePlanCharge(client, subscriptionId, chargeId, body)
  );
}

export const updateSubscriptionRatePlanChargeTool: Tool = {
  definition,
  handler,
};
