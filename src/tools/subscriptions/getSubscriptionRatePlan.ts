import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  ratePlanId: z.string().min(1, "ratePlanId is required"),
  include: z.string().optional(),
});

const definition = {
  name: "get_subscription_rate_plan",
  description:
    "Get a single rate plan on a subscription. GET /subscriptions/{subscriptionId}/rateplans/{ratePlanId}. Optional: include.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      ratePlanId: { type: "string", description: "Subscription rate plan ID (required)" },
      include: { type: "string", description: "Attributes to include" },
    },
    required: ["subscriptionId", "ratePlanId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, ratePlanId, include } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.getSubscriptionRatePlan(client, subscriptionId, ratePlanId, { include })
  );
}

export const getSubscriptionRatePlanTool: Tool = {
  definition,
  handler,
};
