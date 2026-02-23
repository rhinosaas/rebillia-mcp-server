import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  chargeId: z.string().min(1, "chargeId is required"),
});

const definition = {
  name: "remove_subscription_rate_plan_charge",
  description:
    "Remove a rate plan charge from a subscription. DELETE /subscriptions/{subscriptionId}/rateplan-charges/{chargeId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      chargeId: { type: "string", description: "Subscription rate plan charge ID to remove (required)" },
    },
    required: ["subscriptionId", "chargeId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, chargeId } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.removeSubscriptionRatePlanCharge(client, subscriptionId, chargeId)
  );
}

export const removeSubscriptionRatePlanChargeTool: Tool = {
  definition,
  handler,
};
