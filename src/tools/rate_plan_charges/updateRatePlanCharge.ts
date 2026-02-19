import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as chargeService from "../../services/ratePlanChargeServices.js";

const chargeTypeEnum = ["oneTime", "recurring", "usage"] as const;
const chargeModelEnum = ["flatFeePricing", "perUnitPricing", "tieredPricing", "volumePricing"] as const;
const billingPeriodEnum = ["day", "week", "month", "year"] as const;
const billingTimingEnum = ["inAdvance", "inArrears"] as const;

const chargeTierItemSchema = z.object({
  currency: z.string().min(1),
  startingUnit: z.string().optional(),
  endingUnit: z.string().optional(),
  price: z.number().int(),
  priceFormat: z.string().optional(),
  tier: z.number().int().optional(),
});

const schema = z.object({
  chargeId: z.string().min(1, "chargeId is required"),
  name: z.string().optional(),
  chargeType: z.enum(chargeTypeEnum).optional(),
  chargeModel: z.enum(chargeModelEnum).optional(),
  category: z.enum(["physical", "digital"]).optional(),
  chargeTier: z.array(chargeTierItemSchema).optional(),
  taxable: z.boolean().optional(),
  weight: z.number().int().min(0).optional(),
  description: z.string().optional(),
  billingPeriod: z.enum(billingPeriodEnum).optional(),
  billingTiming: z.enum(billingTimingEnum).optional(),
});

const definition = {
  name: "update_rate_plan_charge",
  description:
    "Update a rate plan charge. PUT /product-rateplan-charges/{chargeId}. Optional: name, chargeType (oneTime|recurring|usage), chargeModel (flatFeePricing|perUnitPricing|tieredPricing|volumePricing), category, chargeTier array, taxable, weight, billingPeriod (day|week|month|year), billingTiming (inAdvance|inArrears).",
  inputSchema: {
    type: "object" as const,
    properties: {
      chargeId: { type: "string", description: "Rate plan charge ID" },
      name: { type: "string", description: "Charge name" },
      chargeType: { type: "string", description: "oneTime, recurring, or usage" },
      chargeModel: { type: "string", description: "flatFeePricing, perUnitPricing, tieredPricing, or volumePricing" },
      category: { type: "string", description: "physical or digital" },
      chargeTier: {
        type: "array",
        description: "Array of {currency, price, optional startingUnit, endingUnit, priceFormat, tier}",
      },
      taxable: { type: "boolean", description: "Whether taxable" },
      weight: { type: "number", description: "Weight (integer)" },
      description: { type: "string", description: "Description" },
      billingPeriod: { type: "string", description: "day, week, month, or year" },
      billingTiming: { type: "string", description: "inAdvance or inArrears" },
    },
    required: ["chargeId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { chargeId, ...body } = parsed.data;
  return handleToolCall(() => chargeService.updateRatePlanCharge(client, chargeId, body));
}

export const updateRatePlanChargeTool: Tool = {
  definition,
  handler,
};
