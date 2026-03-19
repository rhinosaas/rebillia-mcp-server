import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as chargeService from "../../services/productRatePlanChargeServices.js";
import type { UpdateRatePlanChargeBody } from "../../services/productRatePlanChargeServices.js";

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
const billingPeriodEnum = ["day", "week", "month", "year"] as const;
const billingTimingEnum = ["inAdvance", "inArrears"] as const;
const billingPeriodAlignmentEnum = ["alignToCharge", "alignToSubscriptionStart", "alignToTermStart"] as const;
const weeklyBillCycleDayEnum = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;

function moneyStringToCents(input: string): number {
  const s = input.trim();
  if (s.includes(".")) {
    if (!/^\d+(\.\d{1,2})$/.test(s)) {
      throw new Error(
        `Invalid price string "${input}". Expected a number like "41.00" (up to 2 decimals).`
      );
    }
    const [whole, frac] = s.split(".");
    return Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  }
  if (!/^\d+$/.test(s)) {
    throw new Error(
      `Invalid price string "${input}". Expected "41.00" or integer cents like "4100".`
    );
  }
  return Number(s);
}

function normalizePriceToCents(amount: unknown): number {
  if (typeof amount === "number") {
    if (amount < 0 || !Number.isFinite(amount)) {
      throw new Error("price must be a non-negative number");
    }
    if (Number.isInteger(amount)) return amount;
    return Math.round(amount * 100);
  }
  if (typeof amount === "string") {
    return moneyStringToCents(amount);
  }
  throw new Error(
    "price must be a number (cents or dollars, e.g. 2287 or 22.87) or string (e.g. '22.87' or '2287')"
  );
}

const chargeTierItemSchema = z.object({
  currency: z.string().min(1),
  startingUnit: z.string().optional(),
  endingUnit: z.string().optional(),
  price: z.union([
    z.string().min(1),
    z.number().min(0, "price must be non-negative (dollars e.g. 22.87 or cents e.g. 2287)"),
  ]),
  priceFormat: z.string().optional(),
  tier: z.number().int().optional(),
});

/** Input schema: all optional except chargeId; used for partial updates. */
const schema = z.object({
  chargeId: z.string().min(1, "chargeId is required"),
  name: z.string().min(1).optional(),
  chargeType: z.enum(chargeTypeEnum).optional(),
  chargeModel: z.enum(chargeModelEnum).optional(),
  billCycleType: z.enum(billCycleTypeEnum).optional(),
  category: z.enum(["physical", "digital"]).optional(),
  chargeTier: z.array(chargeTierItemSchema).optional(),
  taxable: z.boolean().optional(),
  weight: z.coerce.number().int().min(0).optional(),
  description: z.string().optional(),
  endDateCondition: z.enum(["subscriptionEnd", "fixedPeriod"]).optional(),
  billingPeriod: z.enum(billingPeriodEnum).optional(),
  billingTiming: z.enum(billingTimingEnum).optional(),
  billingPeriodAlignment: z.enum(billingPeriodAlignmentEnum).optional(),
  specificBillingPeriod: z.number().int().optional(),
  billCycleDay: z.number().int().min(1).max(31).optional(),
  weeklyBillCycleDay: z.enum(weeklyBillCycleDayEnum).optional(),
  monthlyBillCycleYear: z.number().int().min(1).max(12).optional(),
});

/**
 * Validate merged body against backend rules. Throws with a clear message if invalid.
 */
function validateMergedBody(body: UpdateRatePlanChargeBody): void {
  const err: string[] = [];

  if (body.name === undefined || body.name === null || String(body.name).trim() === "") {
    err.push("name is required (non-empty string)");
  }
  if (!body.chargeType) {
    err.push("chargeType is required (oneTime, recurring, or usage)");
  } else if (!chargeTypeEnum.includes(body.chargeType as (typeof chargeTypeEnum)[number])) {
    err.push(`chargeType must be one of: ${chargeTypeEnum.join(", ")}`);
  }
  if (!body.chargeModel) {
    err.push("chargeModel is required (flatFeePricing, perUnitPricing, tieredPricing, or volumePricing)");
  } else if (!chargeModelEnum.includes(body.chargeModel as (typeof chargeModelEnum)[number])) {
    err.push(`chargeModel must be one of: ${chargeModelEnum.join(", ")}`);
  }
  if (!body.billCycleType) {
    err.push("billCycleType is required");
  } else if (!billCycleTypeEnum.includes(body.billCycleType as (typeof billCycleTypeEnum)[number])) {
    err.push(`billCycleType must be one of: ${billCycleTypeEnum.join(", ")}`);
  }
  if (body.category === undefined || body.category === null) {
    err.push("category is required (physical or digital)");
  } else if (body.category !== "physical" && body.category !== "digital") {
    err.push("category must be physical or digital");
  }
  if (!Array.isArray(body.chargeTier) || body.chargeTier.length === 0) {
    err.push("chargeTier is required (array with at least one item: currency, price)");
  } else {
    for (let i = 0; i < body.chargeTier.length; i++) {
      const t = body.chargeTier[i];
      if (!t.currency || typeof t.price !== "number") {
        err.push(`chargeTier[${i}]: currency and price (integer cents) are required`);
      }
    }
  }
  if (body.taxable === undefined || body.taxable === null) {
    err.push("taxable is required (boolean)");
  }
  if (body.weight === undefined || body.weight === null) {
    err.push("weight is required (integer)");
  } else if (!Number.isInteger(Number(body.weight)) || Number(body.weight) < 0) {
    err.push("weight must be a non-negative integer");
  }
  if (!body.endDateCondition) {
    err.push("endDateCondition is required (subscriptionEnd or fixedPeriod)");
  } else if (body.endDateCondition !== "subscriptionEnd" && body.endDateCondition !== "fixedPeriod") {
    err.push("endDateCondition must be subscriptionEnd or fixedPeriod");
  }

  // Conditional: billCycleType specificDayOfMonth → billCycleDay required (1-31)
  if (body.billCycleType === "specificDayOfMonth") {
    if (body.billCycleDay === undefined || body.billCycleDay === null) {
      err.push("billCycleDay is required when billCycleType is specificDayOfMonth (1-31)");
    } else if (body.billCycleDay < 1 || body.billCycleDay > 31) {
      err.push("billCycleDay must be between 1 and 31");
    }
  }
  // Conditional: billCycleType specificDayOfWeek → weeklyBillCycleDay required
  if (body.billCycleType === "specificDayOfWeek") {
    if (!body.weeklyBillCycleDay) {
      err.push(
        "weeklyBillCycleDay is required when billCycleType is specificDayOfWeek (sunday, monday, tuesday, wednesday, thursday, friday, saturday)"
      );
    } else if (!weeklyBillCycleDayEnum.includes(body.weeklyBillCycleDay as (typeof weeklyBillCycleDayEnum)[number])) {
      err.push(`weeklyBillCycleDay must be one of: ${weeklyBillCycleDayEnum.join(", ")}`);
    }
  }
  // Conditional: billCycleType specificMonthOfYear → monthlyBillCycleYear required (1-12)
  if (body.billCycleType === "specificMonthOfYear") {
    if (body.monthlyBillCycleYear === undefined || body.monthlyBillCycleYear === null) {
      err.push("monthlyBillCycleYear is required when billCycleType is specificMonthOfYear (1-12)");
    } else if (body.monthlyBillCycleYear < 1 || body.monthlyBillCycleYear > 12) {
      err.push("monthlyBillCycleYear must be between 1 and 12");
    }
  }
  // Conditional: chargeType recurring → billingPeriod, specificBillingPeriod, billingPeriodAlignment, billingTiming required
  if (body.chargeType === "recurring") {
    if (!body.billingPeriod) {
      err.push("billingPeriod is required when chargeType is recurring (day, week, month, year)");
    } else if (!billingPeriodEnum.includes(body.billingPeriod)) {
      err.push(`billingPeriod must be one of: ${billingPeriodEnum.join(", ")}`);
    }
    if (body.specificBillingPeriod === undefined || body.specificBillingPeriod === null) {
      err.push("specificBillingPeriod is required when chargeType is recurring");
    }
    if (!body.billingPeriodAlignment) {
      err.push(
        "billingPeriodAlignment is required when chargeType is recurring (alignToCharge, alignToSubscriptionStart, alignToTermStart)"
      );
    } else if (!billingPeriodAlignmentEnum.includes(body.billingPeriodAlignment as (typeof billingPeriodAlignmentEnum)[number])) {
      err.push(`billingPeriodAlignment must be one of: ${billingPeriodAlignmentEnum.join(", ")}`);
    }
    if (!body.billingTiming) {
      err.push("billingTiming is required when chargeType is recurring (inAdvance or inArrears)");
    } else if (!billingTimingEnum.includes(body.billingTiming)) {
      err.push(`billingTiming must be one of: ${billingTimingEnum.join(", ")}`);
    }
  }

  if (err.length > 0) {
    throw new Error(`Validation failed: ${err.join(". ")}`);
  }
}

const definition = {
  name: "update_product_rate_plan_charge",
  description:
    "Update a product rate plan charge. PUT /product-rateplan-charges/{chargeId}. You can send only the fields you want to change (e.g. chargeTier with new price); the tool fetches the current charge and merges your input so the backend receives all required fields. Validates in MCP before calling the API. Optional inputs: name, chargeType, chargeModel, billCycleType, category, chargeTier (currency, price as dollars e.g. 22.87 or cents e.g. 2287), taxable, weight, endDateCondition, billingPeriod, billingTiming, billingPeriodAlignment, specificBillingPeriod, billCycleDay (1-31 when billCycleType specificDayOfMonth), weeklyBillCycleDay (when specificDayOfWeek), monthlyBillCycleYear (1-12 when specificMonthOfYear). When chargeType is recurring, billingPeriod, specificBillingPeriod, billingPeriodAlignment, billingTiming are required.",
  inputSchema: {
    type: "object" as const,
    properties: {
      chargeId: { type: "string", description: "Product rate plan charge ID (required)" },
      name: { type: "string", description: "Charge name" },
      chargeType: { type: "string", description: "oneTime, recurring, or usage" },
      chargeModel: { type: "string", description: "flatFeePricing, perUnitPricing, tieredPricing, or volumePricing" },
      billCycleType: {
        type: "string",
        description:
          "chargeTriggerDay, defaultFromCustomer, specificDayOfMonth, specificDayOfWeek, specificMonthOfYear, subscriptionStartDay, subscriptionFreeTrial",
      },
      category: { type: "string", description: "physical or digital" },
      chargeTier: {
        type: "array",
        description:
          "Array of {currency, price (dollars e.g. 22.87 or cents e.g. 2287), optional startingUnit, endingUnit, priceFormat, tier}. To update only price, send this and chargeId; other fields are filled from current charge.",
      },
      taxable: { type: "boolean", description: "Whether taxable" },
      weight: { type: "number", description: "Weight (integer)" },
      description: { type: "string", description: "Description" },
      endDateCondition: { type: "string", description: "subscriptionEnd or fixedPeriod" },
      billingPeriod: { type: "string", description: "day, week, month, or year (required if chargeType recurring)" },
      billingTiming: { type: "string", description: "inAdvance or inArrears (required if chargeType recurring)" },
      billingPeriodAlignment: {
        type: "string",
        description: "alignToCharge, alignToSubscriptionStart, alignToTermStart (required if chargeType recurring)",
      },
      specificBillingPeriod: { type: "number", description: "Required when chargeType recurring" },
      billCycleDay: { type: "number", description: "1-31 when billCycleType is specificDayOfMonth" },
      weeklyBillCycleDay: {
        type: "string",
        description: "sunday, monday, tuesday, wednesday, thursday, friday, saturday when billCycleType is specificDayOfWeek",
      },
      monthlyBillCycleYear: { type: "number", description: "1-12 when billCycleType is specificMonthOfYear" },
    },
    required: ["chargeId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const input = parsed.data;
  const { chargeId, chargeTier: inputChargeTier, ...restInput } = input;

  try {
    // Fetch existing charge so we can merge when user sends partial update (e.g. only price)
    const existing = await chargeService.getRatePlanCharge(client, chargeId);
    const existingBody = chargeService.existingChargeToUpdateBody(existing);

    // User payload: only include fields the user actually provided (defined), so we don't overwrite with undefined
    const userPayload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(restInput)) {
      if (v !== undefined) userPayload[k] = v;
    }
    if (inputChargeTier !== undefined) {
      userPayload.chargeTier = inputChargeTier.map((t) => ({
        ...t,
        price: normalizePriceToCents(t.price),
        priceFormat: t.priceFormat ?? "",
      }));
    }

    const merged: UpdateRatePlanChargeBody = {
      ...existingBody,
      ...userPayload,
    } as UpdateRatePlanChargeBody;

    // Ensure chargeTier tiers have priceFormat for API
    if (merged.chargeTier?.length) {
      merged.chargeTier = merged.chargeTier.map((t) => ({
        ...t,
        priceFormat: t.priceFormat ?? "",
      }));
    }

    validateMergedBody(merged);

    return handleToolCall(() => chargeService.updateRatePlanCharge(client, chargeId, merged));
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResult(message);
  }
}

export const updateRatePlanChargeTool: Tool = {
  definition,
  handler,
};
