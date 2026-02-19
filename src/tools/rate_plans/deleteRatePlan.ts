import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as ratePlanService from "../../services/ratePlanServices.js";

const schema = z.object({
  ratePlanId: z.string().min(1, "ratePlanId is required"),
});

const definition = {
  name: "delete_rate_plan",
  description: "Delete a rate plan. DELETE /product-rateplans/{ratePlanId}.",
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
  return handleToolCall(() => ratePlanService.deleteRatePlan(client, parsed.data.ratePlanId));
}

export const deleteRatePlanTool: Tool = {
  definition,
  handler,
};
