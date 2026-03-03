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
const endDateConditionEnum = ["subscriptionEnd", "fixedPeriod"] as const;

const chargeTierItemSchema = z.object({
  currency: z.string().min(1, "chargeTier[].currency is required"),
  price: z.number().int().min(0, "chargeTier[].price is required"),
  startingUnit: z.coerce.string().optional(),
  endingUnit: z.coerce.string().optional(),
  priceFormat: z.string().optional(),
  tier: z.number().int().optional(),
});

const schema = z
  .object({
    subscriptionId: z.string().min(1, "subscriptionId is required"),
    chargeId: z.string().min(1, "chargeId is required"),
    quantity: z.number().int().min(0, "quantity is required"),
    name: z.string().min(1, "name is required"),
    chargeModel: z.enum(chargeModelEnum, {
      errorMap: () => ({
        message: "chargeModel is required: flatFeePricing|perUnitPricing|tieredPricing|volumePricing",
      }),
    }),
    billCycleType: z.enum(billCycleTypeEnum, {
      errorMap: () => ({
        message:
          "billCycleType is required: chargeTriggerDay|defaultFromCustomer|specificDayOfMonth|specificDayOfWeek|specificMonthOfYear|subscriptionStartDay|subscriptionFreeTrial",
      }),
    }),
    chargeTier: z
      .array(chargeTierItemSchema)
      .min(1, "chargeTier array with at least one item (currency, price required) is required"),
    chargeType: z.enum(chargeTypeEnum, {
      errorMap: () => ({ message: "chargeType is required: oneTime|recurring|usage" }),
    }),
    endDateCondition: z.enum(endDateConditionEnum, {
      errorMap: () => ({ message: "endDateCondition is required: subscriptionEnd|fixedPeriod" }),
    }),
    taxable: z.boolean({ required_error: "taxable (boolean) is required" }),
    weight: z.coerce.number().int().min(0, "weight is required"),
    billingPeriod: z.string().optional(),
    billingTiming: z.string().optional(),
    billingPeriodAlignment: z.string().optional(),
    specificBillingPeriod: z.number().int().optional(),
  })
  .refine(
    (data) => data.chargeType !== "recurring" || data.billingPeriodAlignment != null,
    {
      message:
        "When chargeType is 'recurring', billingPeriodAlignment is required (e.g. alignToCharge, alignToSubscriptionStart, alignToTermStart).",
    }
  );

const definition = {
  name: "update_subscription_rate_plan_charge",
  description:
    "Update a rate plan charge on a subscription. PUT /subscriptions/{subscriptionId}/rateplan-charges/{chargeId}. Required: subscriptionId, chargeId, quantity, name, chargeModel (flatFeePricing|perUnitPricing|tieredPricing|volumePricing), billCycleType, chargeTier (array: currency, price required), chargeType (oneTime|recurring|usage), endDateCondition (subscriptionEnd|fixedPeriod), taxable (boolean), weight. When chargeType is recurring, billingPeriodAlignment is also required. Optional: billingPeriod, billingTiming, specificBillingPeriod.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      chargeId: { type: "string", description: "Subscription rate plan charge ID (required)" },
      quantity: { type: "number", description: "Quantity (required)" },
      name: { type: "string", description: "Charge name (required)" },
      chargeModel: {
        type: "string",
        description: "Required. flatFeePricing|perUnitPricing|tieredPricing|volumePricing",
        enum: ["flatFeePricing", "perUnitPricing", "tieredPricing", "volumePricing"],
      },
      billCycleType: {
        type: "string",
        description:
          "Required. chargeTriggerDay|defaultFromCustomer|specificDayOfMonth|specificDayOfWeek|specificMonthOfYear|subscriptionStartDay|subscriptionFreeTrial",
        enum: [
          "chargeTriggerDay",
          "defaultFromCustomer",
          "specificDayOfMonth",
          "specificDayOfWeek",
          "specificMonthOfYear",
          "subscriptionStartDay",
          "subscriptionFreeTrial",
        ],
      },
      chargeTier: {
        type: "array",
        description:
          "Required. Array of tiers: currency (required), price (required, e.g. cents), optional startingUnit, endingUnit, priceFormat, tier",
        items: {
          type: "object",
          properties: {
            currency: { type: "string", description: "Required" },
            price: { type: "number", description: "Required (e.g. cents)" },
            startingUnit: { type: "string", description: "Optional" },
            endingUnit: { type: "string", description: "Optional" },
            priceFormat: { type: "string", description: "Optional" },
            tier: { type: "number", description: "Optional" },
          },
          required: ["currency", "price"],
        },
      },
      chargeType: {
        type: "string",
        description: "Required. oneTime|recurring|usage",
        enum: ["oneTime", "recurring", "usage"],
      },
      endDateCondition: {
        type: "string",
        description: "Required. subscriptionEnd or fixedPeriod",
        enum: ["subscriptionEnd", "fixedPeriod"],
      },
      taxable: { type: "boolean", description: "Required. Whether the charge is taxable" },
      weight: { type: "number", description: "Required. Weight (integer)" },
      billingPeriod: { type: "string", description: "day, week, month, year" },
      billingTiming: { type: "string", description: "inAdvance, inArrears" },
      billingPeriodAlignment: {
        type: "string",
        description: "Required when chargeType is recurring. alignToCharge, alignToSubscriptionStart, alignToTermStart",
      },
      specificBillingPeriod: { type: "number", description: "Specific billing period" },
    },
    required: [
      "subscriptionId",
      "chargeId",
      "quantity",
      "name",
      "chargeModel",
      "billCycleType",
      "chargeTier",
      "chargeType",
      "endDateCondition",
      "taxable",
      "weight",
    ],
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
