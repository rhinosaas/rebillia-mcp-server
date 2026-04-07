import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
});

const definition = {
  name: "delete_subscription",
  description:
    "Delete a subscription. DELETE /subscriptions/{subscriptionId}. Warning: Prefer changing status to archived (update_subscription_status) instead of deleting when you want to end a subscription without removing it from records.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
    },
    required: ["subscriptionId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() =>
    subscriptionService.deleteSubscription(client, parsed.data.subscriptionId)
  );
}

export const deleteSubscriptionTool: Tool = {
  definition,
  handler,
};
