import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as ratePlanService from "../../services/ratePlanServices.js";

const schema = z.object({
  productId: z.string().min(1, "productId is required"),
  include: z.string().optional(),
  orderBy: z.string().optional(),
  sortBy: z.string().optional(),
  pageNo: z.number().int().min(1).optional(),
  itemPerPage: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_rate_plans",
  description:
    "List rate plans for a product. GET /products/{productId}/product-rateplans. Product reference: productId (URI: /products/{productId}). Optional: include, orderBy, sortBy, pageNo, itemPerPage.",
  inputSchema: {
    type: "object" as const,
    properties: {
      productId: { type: "string", description: "Product ID (URI: /products/{productId})" },
      include: { type: "string", description: "Attributes to include" },
      orderBy: { type: "string", description: "Sort column" },
      sortBy: { type: "string", description: "Sort direction" },
      pageNo: { type: "number", description: "Page number" },
      itemPerPage: { type: "number", description: "Items per page" },
    },
    required: ["productId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { productId, ...params } = parsed.data;
  return handleToolCall(() => ratePlanService.listRatePlans(client, productId, params));
}

export const listRatePlansTool: Tool = {
  definition,
  handler,
};
