import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const statusEnum = ["active", "paused", "archived", "requestPayment"] as const;

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  status: z.enum(statusEnum, {
    errorMap: () => ({ message: `status must be one of: ${statusEnum.join(", ")}` }),
  }),
});

const definition = {
  name: "update_subscription_status",
  description:
    "Update a subscription status. PUT /subscriptions/{subscriptionId}/status. Required: status. Meanings: active – subscription is active and billing; paused – subscription is temporarily paused (no billing); archived – subscription is ended/archived (use instead of delete when ending); requestPayment – subscription is awaiting payment method or payment.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      status: {
        type: "string",
        description:
          "Status (required): active (billing), paused (no billing), archived (ended; prefer over delete), requestPayment (awaiting payment)",
      },
    },
    required: ["subscriptionId", "status"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, status } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.updateSubscriptionStatus(client, subscriptionId, status)
  );
}

export const updateSubscriptionStatusTool: Tool = {
  definition,
  handler,
};
