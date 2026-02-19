import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as ratePlanService from "../../services/ratePlanServices.js";

const schema = z.object({
  ratePlanId: z.string().min(1, "ratePlanId is required"),
  include: z.string().optional(),
});

const definition = {
  name: "get_rate_plan",
  description:
    "Get a rate plan by ID. GET /product-rateplans/{ratePlanId}. Rate plan reference: ratePlanId (URI: /product-rateplans/{ratePlanId}).",
  inputSchema: {
    type: "object" as const,
    properties: {
      ratePlanId: { type: "string", description: "Rate plan ID (URI: /product-rateplans/{ratePlanId})" },
      include: { type: "string", description: "Attributes to include" },
    },
    required: ["ratePlanId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { ratePlanId, include } = parsed.data;
  return handleToolCall(() => ratePlanService.getRatePlan(client, ratePlanId, { include }));
}

export const getRatePlanTool: Tool = {
  definition,
  handler,
};
