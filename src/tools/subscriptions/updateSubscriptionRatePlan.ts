import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  ratePlanId: z.string().min(1, "ratePlanId is required"),
  name: z.string().optional(),
  type: z.enum(["contract", "ongoing", "prepaid"]).optional(),
  effectiveStartDate: z.string().optional(),
  changeStatusBasedOnCharge: z.boolean().optional(),
});

const definition = {
  name: "update_subscription_rate_plan",
  description:
    "Update a rate plan on a subscription. PUT /subscriptions/{subscriptionId}/rateplans/{ratePlanId}. Optional: name, type (contract|ongoing|prepaid), effectiveStartDate, changeStatusBasedOnCharge.",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      ratePlanId: { type: "string", description: "Subscription rate plan ID (required)" },
      name: { type: "string", description: "Name" },
      type: { type: "string", description: "contract, ongoing, or prepaid" },
      effectiveStartDate: { type: "string", description: "YYYY-MM-DD" },
      changeStatusBasedOnCharge: { type: "boolean", description: "Change status based on charge" },
    },
    required: ["subscriptionId", "ratePlanId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, ratePlanId, ...body } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.updateSubscriptionRatePlan(client, subscriptionId, ratePlanId, body)
  );
}

export const updateSubscriptionRatePlanTool: Tool = {
  definition,
  handler,
};
