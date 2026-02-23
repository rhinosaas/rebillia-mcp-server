import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  ratePlanId: z.string().min(1, "ratePlanId is required"),
});

const definition = {
  name: "remove_subscription_rate_plan",
  description:
    "Remove a rate plan from a subscription. DELETE /subscriptions/{subscriptionId}/rateplans/{ratePlanId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      ratePlanId: { type: "string", description: "Subscription rate plan ID to remove (required)" },
    },
    required: ["subscriptionId", "ratePlanId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, ratePlanId } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.removeSubscriptionRatePlan(client, subscriptionId, ratePlanId)
  );
}

export const removeSubscriptionRatePlanTool: Tool = {
  definition,
  handler,
};
