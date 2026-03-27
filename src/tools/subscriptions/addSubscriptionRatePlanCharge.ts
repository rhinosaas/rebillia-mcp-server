import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const chargeTypeEnum = ["oneTime", "recurring", "usage"] as const;
const chargeModelEnum = ["flatFeePricing", "perUnitPricing", "tieredPricing", "volumePricing"] as const;
const billingPeriodAlignmentEnum = ["alignToCharge", "alignToSubscriptionStart", "alignToTermStart"] as const;
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
  currency: z.string().min(1, "chargeTier[].currency is required"),
  price: z.number().int().min(0, "chargeTier[].price is required"),
  startingUnit: z.coerce.string().optional(),
  endingUnit: z.coerce.string().optional(),
  priceFormat: z.string().optional(),
  tier: z.number().int().optional(),
});

const endDateConditionEnum = ["subscriptionEnd", "fixedPeriod"] as const;

const weightSchema = z
  .union([z.coerce.number(), z.null()])
  .transform((value, ctx) => {
    if (value === null) return null;
    if (!Number.isFinite(value)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "weight must be a finite number or null" });
      return z.NEVER;
    }
    const normalizedWeight = Math.round(value * 100);
    if (normalizedWeight < 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "weight must be >= 0 or null" });
      return z.NEVER;
    }
    return normalizedWeight;
  });

const schema = z
  .object({
    subscriptionId: z.string().min(1, "subscriptionId is required"),
    ratePlanId: z.string().min(1, "ratePlanId is required"),
    quantity: z.number().int().min(0, "quantity is required"),
    name: z.string().min(1, "name is required"),
    category: z.enum(["physical", "digital"], {
      errorMap: () => ({ message: "category is required: physical or digital" }),
    }),
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
    chargeTier: z.array(chargeTierItemSchema).min(1, "chargeTier array with at least one item (currency, price required) is required"),
    chargeType: z.enum(chargeTypeEnum, {
      errorMap: () => ({ message: "chargeType is required: oneTime|recurring|usage" }),
    }),
    endDateCondition: z.enum(endDateConditionEnum, {
      errorMap: () => ({ message: "endDateCondition is required: subscriptionEnd|fixedPeriod" }),
    }),
    taxable: z.boolean({ required_error: "taxable (boolean) is required" }),
    weight: weightSchema,
    productRatePlanChargeId: z.number().int().optional(),
    billingPeriod: z.string().optional(),
    billingTiming: z.string().optional(),
    billingPeriodAlignment: z.enum(billingPeriodAlignmentEnum, {
      errorMap: () => ({
        message:
          "billingPeriodAlignment must be one of: alignToCharge, alignToSubscriptionStart, alignToTermStart",
      }),
    }).optional(),
    specificBillingPeriod: z.number().int().optional(),
  })
  .refine(
    (data) =>
      data.chargeType !== "recurring" ||
      (data.billingPeriodAlignment != null && data.specificBillingPeriod != null),
    {
      message:
        "When chargeType is 'recurring', billingPeriodAlignment and specificBillingPeriod are required.",
    }
  );

const definition = {
  name: "add_subscription_rate_plan_charge",
  description:
    "Add a rate plan charge to a subscription rate plan. POST .../rateplan-charges. Required: subscriptionId, ratePlanId, quantity, name, category (physical|digital), chargeModel (flatFeePricing|perUnitPricing|tieredPricing|volumePricing), billCycleType (chargeTriggerDay|defaultFromCustomer|specificDayOfMonth|specificDayOfWeek|specificMonthOfYear|subscriptionStartDay|subscriptionFreeTrial), chargeTier array (each: currency, price required; optional startingUnit, endingUnit, priceFormat, tier), chargeType (oneTime|recurring|usage), endDateCondition (subscriptionEnd|fixedPeriod), taxable (boolean), weight. When chargeType is recurring, billingPeriodAlignment and specificBillingPeriod are also required. Optional: productRatePlanChargeId, billingPeriod, billingTiming.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      ratePlanId: { type: "string", description: "Subscription rate plan ID (required)" },
      quantity: { type: "number", description: "Quantity (required)" },
      name: { type: "string", description: "Charge name (required)" },
      category: {
        type: "string",
        description: "Required. physical or digital",
        enum: ["physical", "digital"],
      },
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
      weight: {
        type: "number",
        description:
          "Required. Weight or null. Numeric values are converted to integer by multiplying by 100 (e.g. 32.75 -> 3275).",
      },
      productRatePlanChargeId: { type: "number", description: "Product rate plan charge ID to reference" },
      billingPeriod: { type: "string", description: "day, week, month, year" },
      billingTiming: { type: "string", description: "inAdvance, inArrears" },
      billingPeriodAlignment: {
        type: "string",
        description:
          "Required when chargeType is recurring. Valid values: alignToCharge, alignToSubscriptionStart, alignToTermStart",
        enum: ["alignToCharge", "alignToSubscriptionStart", "alignToTermStart"],
      },
      specificBillingPeriod: { type: "number", description: "Required when chargeType is recurring" },
    },
    required: [
      "subscriptionId",
      "ratePlanId",
      "quantity",
      "name",
      "category",
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
  const { subscriptionId, ratePlanId, ...body } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.addSubscriptionRatePlanCharge(client, subscriptionId, ratePlanId, body)
  );
}

export const addSubscriptionRatePlanChargeTool: Tool = {
  definition,
  handler,
};
