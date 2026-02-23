import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as chargeService from "../../services/productRatePlanChargeServices.js";

const schema = z.object({
  chargeId: z.string().min(1, "chargeId is required"),
  include: z.string().optional(),
});

const definition = {
  name: "get_rate_plan_charge",
  description: "Get a rate plan charge by ID. GET /product-rateplan-charges/{chargeId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      chargeId: { type: "string", description: "Rate plan charge ID" },
      include: { type: "string", description: "Attributes to include" },
    },
    required: ["chargeId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { chargeId, include } = parsed.data;
  return handleToolCall(() => chargeService.getRatePlanCharge(client, chargeId, { include }));
}

export const getRatePlanChargeTool: Tool = {
  definition,
  handler,
};
