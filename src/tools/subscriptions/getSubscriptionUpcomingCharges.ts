import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  include: z.string().optional(),
});

const definition = {
  name: "get_subscription_upcoming_charges",
  description:
    "View all upcoming charges for a subscription. GET /subscriptions/{subscriptionId}/upcoming. Returns scheduled charges (recurring, one-time, usage) with amounts and dates. Optional: include.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      include: { type: "string", description: "Attributes to include" },
    },
    required: ["subscriptionId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, include } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.getSubscriptionUpcomingCharges(client, subscriptionId, { include })
  );
}

export const getSubscriptionUpcomingChargesTool: Tool = {
  definition,
  handler,
};
