import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as productService from "../../services/productServices.js";

const schema = z.object({
  productId: z.string().min(1, "productId is required"),
  include: z.string().optional(),
});

const definition = {
  name: "get_product",
  description: "Get a product by ID. GET /products/{productId}. Optional: include.",
  inputSchema: {
    type: "object" as const,
    properties: {
      productId: { type: "string", description: "Product ID (required)" },
      include: { type: "string", description: "Comma-separated attributes to include" },
    },
    required: ["productId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { productId, include } = parsed.data;
  return handleToolCall(() => productService.getProduct(client, productId, { include }));
}

export const getProductTool: Tool = {
  definition,
  handler,
};
