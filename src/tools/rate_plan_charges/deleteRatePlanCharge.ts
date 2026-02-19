import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as chargeService from "../../services/ratePlanChargeServices.js";

const schema = z.object({
  chargeId: z.string().min(1, "chargeId is required"),
});

const definition = {
  name: "delete_rate_plan_charge",
  description: "Delete a rate plan charge. DELETE /product-rateplan-charges/{chargeId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      chargeId: { type: "string", description: "Rate plan charge ID" },
    },
    required: ["chargeId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => chargeService.deleteRatePlanCharge(client, parsed.data.chargeId));
}

export const deleteRatePlanChargeTool: Tool = {
  definition,
  handler,
};
