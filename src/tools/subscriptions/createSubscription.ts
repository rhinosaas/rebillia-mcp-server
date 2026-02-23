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

const ratePlanChargeItemSchema = z
  .object({
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
  })
  .passthrough();

const ratePlanItemSchema = z.object({
  productRatePlanId: z.number().int().positive(),
  name: z.string().optional(),
  type: z.enum(["contract", "ongoing", "prepaid"]).optional(),
  effectiveStartDate: z.string().optional(),
  changeStatusBasedOnCharge: z.boolean().optional(),
  ratePlanCharge: z.array(ratePlanChargeItemSchema).optional(),
});

const schema = z.object({
  customerId: z.number().int().positive("customerId is required"),
  name: z.string().min(1, "name is required"),
  companyCurrencyId: z.number().int().positive("companyCurrencyId is required"),
  effectiveStartDate: z.string().min(1, "effectiveStartDate is required (YYYY-MM-DD)"),
  ratePlan: z.array(ratePlanItemSchema).min(1, "ratePlan must have at least one item"),
  companyGatewayId: z.number().int().optional(),
  customerPaymentMethodId: z.number().int().optional(),
  detail: z.string().optional(),
  offlinePaymentId: z.string().optional(),
  billingAddressId: z.number().int().optional(),
  shippingAddressId: z.number().int().optional(),
});

const definition = {
  name: "create_subscription",
  description:
    "Create a subscription. POST /subscriptions. Required: customerId, name, companyCurrencyId, effectiveStartDate, ratePlan (array). Each ratePlan: productRatePlanId (required), optional name, type (contract|ongoing|prepaid), ratePlanCharge (array). Each ratePlanCharge: quantity (required), optional productRatePlanChargeId, or full definition with chargeTier array. Optional: companyGatewayId, customerPaymentMethodId, detail, billingAddressId, shippingAddressId.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "number", description: "Customer ID (required)" },
      name: { type: "string", description: "Subscription name (required)" },
      companyCurrencyId: { type: "number", description: "Company currency ID (required)" },
      effectiveStartDate: { type: "string", description: "Effective start date YYYY-MM-DD (required)" },
      ratePlan: {
        type: "array",
        description:
          "Rate plans: each has productRatePlanId, optional name, type, ratePlanCharge array (each: quantity, optional productRatePlanChargeId or chargeTier)",
      },
      companyGatewayId: { type: "number", description: "Company gateway ID" },
      customerPaymentMethodId: { type: "number", description: "Customer payment method ID" },
      detail: { type: "string", description: "Detail" },
      offlinePaymentId: { type: "string", description: "Offline payment ID" },
      billingAddressId: { type: "number", description: "Billing address ID" },
      shippingAddressId: { type: "number", description: "Shipping address ID" },
    },
    required: ["customerId", "name", "companyCurrencyId", "effectiveStartDate", "ratePlan"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(
      parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ")
    );
  }
  return handleToolCall(() => subscriptionService.createSubscription(client, parsed.data));
}

export const createSubscriptionTool: Tool = {
  definition,
  handler,
};
