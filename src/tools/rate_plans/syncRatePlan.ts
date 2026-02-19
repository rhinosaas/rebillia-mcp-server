import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as ratePlanService from "../../services/ratePlanServices.js";

const schema = z.object({
  ratePlanId: z.string().min(1, "ratePlanId is required"),
});

const definition = {
  name: "sync_rate_plan",
  description: "Sync a rate plan. POST /product-rateplans/{ratePlanId}/sync.",
  inputSchema: {
    type: "object" as const,
    properties: {
      ratePlanId: { type: "string", description: "Rate plan ID (URI: /product-rateplans/{ratePlanId})" },
    },
    required: ["ratePlanId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => ratePlanService.syncRatePlan(client, parsed.data.ratePlanId));
}

export const syncRatePlanTool: Tool = {
  definition,
  handler,
};
