import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as ratePlanService from "../../services/ratePlanServices.js";

const schema = z.object({
  productId: z.number().int().positive("productId is required"),
  name: z.string().min(1, "name is required"),
  type: z.enum(["contract", "ongoing", "prepaid"], {
    errorMap: () => ({ message: "type must be contract, ongoing, or prepaid" }),
  }),
  description: z.string().optional(),
  effectiveStartDate: z.string().optional(),
  effectiveEndDate: z.string().optional(),
  minimumCommitment: z.boolean().optional(),
  minimumCommitmentLength: z.number().optional(),
  minimumCommitmentUnit: z.string().optional(),
  changeStatusBasedOnCharge: z.boolean().optional(),
  sourceTemplateId: z.number().optional(),
  image: z.string().optional(),
});

const definition = {
  name: "create_rate_plan",
  description:
    "Create a rate plan. POST /product-rateplans. Required: productId (product reference, URI: /products/{productId}), name, type (contract|ongoing|prepaid). Optional: description, effectiveStartDate, effectiveEndDate, minimumCommitment, image.",
  inputSchema: {
    type: "object" as const,
    properties: {
      productId: { type: "number", description: "Product ID (URI: /products/{productId})" },
      name: { type: "string", description: "Rate plan name" },
      type: { type: "string", description: "Type: contract, ongoing, or prepaid" },
      description: { type: "string", description: "Description" },
      effectiveStartDate: { type: "string", description: "Effective start date" },
      effectiveEndDate: { type: "string", description: "Effective end date" },
      minimumCommitment: { type: "boolean", description: "Minimum commitment" },
      minimumCommitmentLength: { type: "number", description: "Minimum commitment length" },
      minimumCommitmentUnit: { type: "string", description: "Minimum commitment unit" },
      changeStatusBasedOnCharge: { type: "boolean", description: "Change status based on charge" },
      sourceTemplateId: { type: "number", description: "Source template ID" },
      image: { type: "string", description: "Image" },
    },
    required: ["productId", "name", "type"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  return handleToolCall(() => ratePlanService.createRatePlan(client, parsed.data));
}

export const createRatePlanTool: Tool = {
  definition,
  handler,
};
