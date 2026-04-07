import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  pageNo: z.number().int().min(1).optional(),
  itemPerPage: z.number().int().min(1).optional(),
});

const definition = {
  name: "get_subscription_logs",
  description:
    "Get activity history for a subscription. GET /subscriptions/{subscriptionId}/logs. Returns paginated log entries (status changes, renewals, payments, etc.).",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      pageNo: { type: "number", description: "Page number (default: 1)" },
      itemPerPage: { type: "number", description: "Items per page (default: 25)" },
    },
    required: ["subscriptionId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, pageNo, itemPerPage } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.getSubscriptionLogs(client, subscriptionId, { pageNo, itemPerPage })
  );
}

export const getSubscriptionLogsTool: Tool = {
  definition,
  handler,
};
