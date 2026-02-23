import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as ratePlanService from "../../services/productRatePlanServices.js";

const statusEnum = ["published", "archived", "disabled", "discontinue"] as const;

const schema = z.object({
  ratePlanId: z.string().min(1, "ratePlanId is required"),
  status: z.enum(statusEnum, {
    errorMap: () => ({ message: `status must be one of: ${statusEnum.join(", ")}` }),
  }),
});

const definition = {
  name: "update_rate_plan_status",
  description:
    "Update a rate plan status. PUT /product-rateplans/{ratePlanId}/status. Required: status. Valid values: published, archived, disabled, discontinue.",
  inputSchema: {
    type: "object" as const,
    properties: {
      ratePlanId: { type: "string", description: "Rate plan ID (URI: /product-rateplans/{ratePlanId})" },
      status: {
        type: "string",
        description: "Status: published, archived, disabled, or discontinue",
      },
    },
    required: ["ratePlanId", "status"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { ratePlanId, status } = parsed.data;
  return handleToolCall(() => ratePlanService.updateRatePlanStatus(client, ratePlanId, status));
}

export const updateRatePlanStatusTool: Tool = {
  definition,
  handler,
};
