import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as ratePlanService from "../../services/productRatePlanServices.js";

const schema = z.object({
  ratePlanId: z.string().min(1, "ratePlanId is required"),
  name: z.string().optional(),
  type: z.enum(["contract", "ongoing", "prepaid"]).optional(),
  description: z.string().optional(),
  effectiveStartDate: z.string().optional(),
  effectiveEndDate: z.string().optional(),
  minimumCommitment: z.boolean().optional(),
  minimumCommitmentLength: z.number().optional(),
  minimumCommitmentUnit: z.string().optional(),
  changeStatusBasedOnCharge: z.boolean().optional(),
  image: z.string().optional(),
});

const definition = {
  name: "update_rate_plan",
  description:
    "Update a rate plan. PUT /product-rateplans/{ratePlanId}. Optional: name, type (contract|ongoing|prepaid), description, effectiveStartDate, effectiveEndDate, image.",
  inputSchema: {
    type: "object" as const,
    properties: {
      ratePlanId: { type: "string", description: "Rate plan ID (URI: /product-rateplans/{ratePlanId})" },
      name: { type: "string", description: "Rate plan name" },
      type: { type: "string", description: "Type: contract, ongoing, or prepaid" },
      description: { type: "string", description: "Description" },
      effectiveStartDate: { type: "string", description: "Effective start date" },
      effectiveEndDate: { type: "string", description: "Effective end date" },
      minimumCommitment: { type: "boolean", description: "Minimum commitment" },
      minimumCommitmentLength: { type: "number", description: "Minimum commitment length" },
      minimumCommitmentUnit: { type: "string", description: "Minimum commitment unit" },
      changeStatusBasedOnCharge: { type: "boolean", description: "Change status based on charge" },
      image: { type: "string", description: "Image" },
    },
    required: ["ratePlanId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { ratePlanId, ...body } = parsed.data;
  return handleToolCall(() => ratePlanService.updateRatePlan(client, ratePlanId, body));
}

export const updateRatePlanTool: Tool = {
  definition,
  handler,
};
