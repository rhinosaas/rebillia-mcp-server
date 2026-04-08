import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const ratePlanStatuses = ["active", "pause", "cancel", "archived"] as const;
const ratePlanTypes = ["ongoing", "prepaid", "contract"] as const;

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  include: z.string().optional(),
  pageNo: z.number().int().min(1).optional(),
  itemPerPage: z.number().int().min(1).optional(),
  orderBy: z.string().optional(),
  sortBy: z.string().optional(),
  status: z
    .preprocess(
      (value) => (typeof value === "string" ? value.toLowerCase() : value),
      z.enum(ratePlanStatuses)
    )
    .optional(),
  type: z
    .preprocess(
      (value) => (typeof value === "string" ? value.toLowerCase() : value),
      z.enum(ratePlanTypes)
    )
    .optional(),
});

const definition = {
  name: "list_subscription_rate_plans",
  description:
    "List rate plans on a subscription. GET /subscriptions/{subscriptionId}/rateplans. Returns paginated rate plans (product rate plan ref, name, type, effectiveStartDate, charges when included). Optional: include, pageNo, itemPerPage, orderBy, sortBy, status (active|pause|cancel|archived), type (ongoing|prepaid|contract). status/type filters are case-insensitive.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      include: { type: "string", description: "Attributes to include (e.g. rateplanCharge)" },
      pageNo: { type: "number", description: "Page number" },
      itemPerPage: { type: "number", description: "Items per page" },
      orderBy: { type: "string", description: "Sort column" },
      sortBy: { type: "string", description: "Sort direction" },
      status: {
        type: "string",
        enum: ["active", "pause", "cancel", "archived"],
        description: "Filter by rate plan status (case-insensitive)",
      },
      type: {
        type: "string",
        enum: ["ongoing", "prepaid", "contract"],
        description: "Filter by rate plan type (case-insensitive)",
      },
    },
    required: ["subscriptionId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, ...params } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.listSubscriptionRatePlans(client, subscriptionId, params)
  );
}

export const listSubscriptionRatePlansTool: Tool = {
  definition,
  handler,
};
