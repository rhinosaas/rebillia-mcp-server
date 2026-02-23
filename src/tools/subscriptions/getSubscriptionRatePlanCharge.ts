import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  chargeId: z.string().min(1, "chargeId is required"),
  include: z.string().optional(),
});

const definition = {
  name: "get_subscription_rate_plan_charge",
  description:
    "Get a single rate plan charge on a subscription. GET /subscriptions/{subscriptionId}/rateplan-charges/{chargeId}. Optional: include.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      chargeId: { type: "string", description: "Subscription rate plan charge ID (required)" },
      include: { type: "string", description: "Attributes to include" },
    },
    required: ["subscriptionId", "chargeId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, chargeId, include } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.getSubscriptionRatePlanCharge(client, subscriptionId, chargeId, {
      include,
    })
  );
}

export const getSubscriptionRatePlanChargeTool: Tool = {
  definition,
  handler,
};
