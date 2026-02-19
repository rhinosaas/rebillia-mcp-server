import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as chargeService from "../../services/ratePlanChargeServices.js";

const schema = z.object({
  ratePlanId: z.string().min(1, "ratePlanId is required"),
  include: z.string().optional(),
  orderBy: z.string().optional(),
  sortBy: z.string().optional(),
  pageNo: z.number().int().min(1).optional(),
  itemPerPage: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_rate_plan_charges",
  description:
    "List rate plan charges for a rate plan. GET /product-rateplans/{ratePlanId}/product-rateplan-charges. Rate plan reference: ratePlanId (URI: /product-rateplans/{ratePlanId}). Optional: include, orderBy, sortBy, pageNo, itemPerPage.",
  inputSchema: {
    type: "object" as const,
    properties: {
      ratePlanId: { type: "string", description: "Rate plan ID (URI: /product-rateplans/{ratePlanId})" },
      include: { type: "string", description: "Attributes to include" },
      orderBy: { type: "string", description: "Sort column" },
      sortBy: { type: "string", description: "Sort direction" },
      pageNo: { type: "number", description: "Page number" },
      itemPerPage: { type: "number", description: "Items per page" },
    },
    required: ["ratePlanId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { ratePlanId, ...params } = parsed.data;
  return handleToolCall(() => chargeService.listRatePlanCharges(client, ratePlanId, params));
}

export const listRatePlanChargesTool: Tool = {
  definition,
  handler,
};
