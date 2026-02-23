import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as chargeService from "../../services/productRatePlanChargeServices.js";

const chargeTypeEnum = ["oneTime", "recurring", "usage"] as const;
const chargeModelEnum = ["flatFeePricing", "perUnitPricing", "tieredPricing", "volumePricing"] as const;
const billingPeriodEnum = ["day", "week", "month", "year"] as const;
const billingTimingEnum = ["inAdvance", "inArrears"] as const;
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

const schema = z.object({
  ratePlanId: z.number().int().positive("ratePlanId is required"),
  name: z.string().min(1, "name is required"),
  chargeType: z.enum(chargeTypeEnum, {
    errorMap: () => ({ message: `chargeType must be one of: ${chargeTypeEnum.join(", ")}` }),
  }),
  chargeModel: z.enum(chargeModelEnum, {
    errorMap: () => ({ message: `chargeModel must be one of: ${chargeModelEnum.join(", ")}` }),
  }),
  billCycleType: z.enum(billCycleTypeEnum, {
    errorMap: () => ({ message: `billCycleType must be one of: ${billCycleTypeEnum.join(", ")}` }),
  }),
  category: z.enum(["physical", "digital"]),
  chargeTier: z.array(chargeTierItemSchema).min(1, "chargeTier must have at least one item"),
  taxable: z.boolean(),
  weight: z.number().int().min(0),
  description: z.string().optional(),
  billingPeriod: z.enum(billingPeriodEnum).optional(),
  billingTiming: z.enum(billingTimingEnum).optional(),
  billingPeriodAlignment: z.string().optional(),
  specificBillingPeriod: z.number().int().optional(),
  allowChangeQuantity: z.boolean().optional(),
  billCycleDay: z.number().int().min(1).max(31).optional(),
  weeklyBillCycleDay: z.string().optional(),
  monthlyBillCycleYear: z.number().int().min(1).max(12).optional(),
  endDateCondition: z.enum(["subscriptionEnd", "fixedPeriod"]),
  isFreeShipping: z.boolean().optional(),
  maxQuantity: z.number().int().optional(),
  minQuantity: z.number().int().optional(),
  quantity: z.number().int().optional(),
  listPriceBase: z.enum(["perMonth", "perBillingPeriod", "perWeek"]).optional(),
});

const definition = {
  name: "create_rate_plan_charge",
  description:
    "Create a rate plan charge. POST /product-rateplan-charges. Required: ratePlanId (rate plan reference, URI: /product-rateplans/{ratePlanId}), name, chargeType (oneTime|recurring|usage), chargeModel (flatFeePricing|perUnitPricing|tieredPricing|volumePricing), billCycleType, category (physical|digital), chargeTier (array of {currency ex. 'USD', price in cents, optional startingUnit, endingUnit, priceFormat, tier}), taxable, weight. Optional: billingPeriod (day|week|month|year), billingTiming (inAdvance|inArrears), description, etc.",
  inputSchema: {
    type: "object" as const,
    properties: {
      ratePlanId: { type: "number", description: "Rate plan ID (URI: /product-rateplans/{ratePlanId})" },
      name: { type: "string", description: "Charge name" },
      chargeType: { type: "string", description: "oneTime, recurring, or usage" },
      chargeModel: { type: "string", description: "flatFeePricing, perUnitPricing, tieredPricing, or volumePricing" },
      billCycleType: { type: "string", description: "Bill cycle type (e.g. chargeTriggerDay, specificDayOfMonth)" },
      category: { type: "string", description: "physical or digital" },
      chargeTier: {
        type: "array",
        description: "Array of {currency, price, optional startingUnit, endingUnit, priceFormat, tier}",
      },
      taxable: { type: "boolean", description: "Whether taxable" },
      weight: { type: "number", description: "Weight (integer)" },
      description: { type: "string", description: "Description" },
      billingPeriod: { type: "string", description: "day, week, month, or year (required if chargeType recurring)" },
      billingTiming: { type: "string", description: "inAdvance or inArrears (required if chargeType recurring)" },
      billingPeriodAlignment: { type: "string", description: "alignToCharge, alignToSubscriptionStart, alignToTermStart" },
      specificBillingPeriod: { type: "number", description: "Specific billing period" },
      allowChangeQuantity: { type: "boolean", description: "Allow change quantity" },
      billCycleDay: { type: "number", description: "1-31 when billCycleType specificDayOfMonth" },
      weeklyBillCycleDay: { type: "string", description: "sunday..saturday when billCycleType specificDayOfWeek" },
      monthlyBillCycleYear: { type: "number", description: "1-12 when billCycleType specificMonthOfYear" },
      endDateCondition: { type: "string", description: "subscriptionEnd or fixedPeriod (required)" },
      isFreeShipping: { type: "boolean", description: "Free shipping" },
      maxQuantity: { type: "number", description: "Max quantity" },
      minQuantity: { type: "number", description: "Min quantity" },
      quantity: { type: "number", description: "Quantity" },
      listPriceBase: { type: "string", description: "perMonth, perBillingPeriod, or perWeek" },
    },
    required: ["ratePlanId", "name", "chargeType", "chargeModel", "billCycleType", "category", "chargeTier", "taxable", "weight", "endDateCondition"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const data = parsed.data;
  const body = {
    ratePlanId: data.ratePlanId,
    name: data.name,
    chargeType: data.chargeType,
    chargeModel: data.chargeModel,
    billCycleType: data.billCycleType,
    category: data.category,
    chargeTier: data.chargeTier,
    taxable: data.taxable,
    weight: data.weight,
    endDateCondition: data.endDateCondition,
    description: data.description,
    billingPeriod: data.billingPeriod,
    billingTiming: data.billingTiming,
    billingPeriodAlignment: data.billingPeriodAlignment,
    specificBillingPeriod: data.specificBillingPeriod,
    allowChangeQuantity: data.allowChangeQuantity,
    billCycleDay: data.billCycleDay,
    weeklyBillCycleDay: data.weeklyBillCycleDay,
    monthlyBillCycleYear: data.monthlyBillCycleYear,
    isFreeShipping: data.isFreeShipping,
    maxQuantity: data.maxQuantity,
    minQuantity: data.minQuantity,
    quantity: data.quantity,
    listPriceBase: data.listPriceBase,
  };
  return handleToolCall(() => chargeService.createRatePlanCharge(client, body));
}

export const createRatePlanChargeTool: Tool = {
  definition,
  handler,
};
