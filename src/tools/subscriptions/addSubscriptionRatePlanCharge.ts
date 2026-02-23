import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const chargeTypeEnum = ["oneTime", "recurring", "usage"] as const;
const chargeModelEnum = ["flatFeePricing", "perUnitPricing", "tieredPricing", "volumePricing"] as const;
const billCycleTypeEnum = [
  "chargeTriggerDay",
  "defaultFromCustomer",
  "specificDayOfMonth",
  "specificDayOfWeek",
  "specificMonthOfYear",
  "subscriptionStartDay",
  "subscriptionFreeTrial",
] as const;

const chargeTierItemSchema = z.object({
  currency: z.string().min(1),
  startingUnit: z.string().optional(),
  endingUnit: z.string().optional(),
  price: z.number().int(),
  priceFormat: z.string().optional(),
  tier: z.number().int().optional(),
});

const schema = z
  .object({
    subscriptionId: z.string().min(1, "subscriptionId is required"),
    ratePlanId: z.string().min(1, "ratePlanId is required"),
    quantity: z.number().int().min(0, "quantity is required"),
    productRatePlanChargeId: z.number().int().optional(),
    name: z.string().min(1).optional(),
    chargeType: z.enum(chargeTypeEnum).optional(),
    chargeModel: z.enum(chargeModelEnum).optional(),
    billCycleType: z.enum(billCycleTypeEnum).optional(),
    category: z.enum(["physical", "digital"]).optional(),
    chargeTier: z.array(chargeTierItemSchema).min(1).optional(),
    taxable: z.boolean().optional(),
    weight: z.number().int().min(0).optional(),
    endDateCondition: z.enum(["subscriptionEnd", "fixedPeriod"]).optional(),
    billingPeriod: z.string().optional(),
    billingTiming: z.string().optional(),
    billingPeriodAlignment: z.string().optional(),
    specificBillingPeriod: z.number().int().optional(),
  })
  .refine(
    (data) =>
      data.name != null &&
      data.chargeTier != null &&
      data.chargeTier.length >= 1 &&
      data.billCycleType != null &&
      data.endDateCondition != null,
    {
      message:
        "API always requires: name, chargeTier (at least one item), billCycleType, endDateCondition.",
    }
  )
  .refine(
    (data) => data.chargeType !== "recurring" || data.billingPeriodAlignment != null,
    {
      message:
        "When chargeType is 'recurring', billingPeriodAlignment is required (e.g. alignToCharge, alignToSubscriptionStart, alignToTermStart).",
    }
  );

const definition = {
  name: "add_subscription_rate_plan_charge",
  description:
    "Add a rate plan charge to a subscription rate plan. POST .../rateplan-charges. Required: subscriptionId, ratePlanId, quantity, name, chargeTier (at least one {currency, price}), billCycleType, endDateCondition (subscriptionEnd|fixedPeriod). When chargeType is recurring, billingPeriodAlignment is also required (alignToCharge, alignToSubscriptionStart, alignToTermStart). Optional: productRatePlanChargeId, chargeType, chargeModel, category, taxable, weight, billingPeriod, billingTiming, specificBillingPeriod.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      ratePlanId: { type: "string", description: "Subscription rate plan ID (required)" },
      quantity: { type: "number", description: "Quantity (required)" },
      productRatePlanChargeId: { type: "number", description: "Product rate plan charge ID to reference" },
      name: { type: "string", description: "Charge name (required)" },
      chargeType: { type: "string", description: "oneTime, recurring, or usage" },
      chargeModel: { type: "string", description: "flatFeePricing, perUnitPricing, tieredPricing, or volumePricing" },
      billCycleType: {
        type: "string",
        description: "Required. E.g. chargeTriggerDay, specificDayOfMonth, subscriptionStartDay",
      },
      category: { type: "string", description: "physical or digital" },
      chargeTier: {
        type: "array",
        description: "Required. At least one {currency, price in cents}. Optional: startingUnit, endingUnit, priceFormat, tier",
      },
      taxable: { type: "boolean", description: "Whether taxable" },
      weight: { type: "number", description: "Weight (integer)" },
      endDateCondition: {
        type: "string",
        description: "Required. subscriptionEnd or fixedPeriod",
      },
      billingPeriod: { type: "string", description: "day, week, month, year" },
      billingTiming: { type: "string", description: "inAdvance, inArrears" },
      billingPeriodAlignment: {
        type: "string",
        description: "Required when chargeType is recurring. E.g. alignToCharge, alignToSubscriptionStart, alignToTermStart",
      },
      specificBillingPeriod: { type: "number", description: "Specific billing period" },
    },
    required: ["subscriptionId", "ratePlanId", "quantity"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, ratePlanId, ...body } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.addSubscriptionRatePlanCharge(client, subscriptionId, ratePlanId, body)
  );
}

export const addSubscriptionRatePlanChargeTool: Tool = {
  definition,
  handler,
};
