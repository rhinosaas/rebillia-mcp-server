import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as productService from "../../services/productServices.js";

const schema = z.object({
  productId: z.string().min(1, "productId is required"),
  name: z.string().optional(),
  category: z.string().optional(),
  description: z.string().optional(),
  internalProductId: z.string().optional(),
  sku: z.string().optional(),
});

const definition = {
  name: "update_product",
  description:
    "Update a product. PUT /products/{productId}. Optional: name, category, description, internalProductId, sku.",
  inputSchema: {
    type: "object" as const,
    properties: {
      productId: { type: "string", description: "Product ID (required)" },
      name: { type: "string", description: "Product name" },
      category: { type: "string", description: "Category" },
      description: { type: "string", description: "Description" },
      internalProductId: { type: "string", description: "Internal product ID" },
      sku: { type: "string", description: "SKU" },
    },
    required: ["productId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { productId, ...body } = parsed.data;
  return handleToolCall(() => productService.updateProduct(client, productId, body));
}

export const updateProductTool: Tool = {
  definition,
  handler,
};
