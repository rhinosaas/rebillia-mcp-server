import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as productService from "../../services/productServices.js";

const schema = z.object({
  name: z.string().min(1, "name is required"),
  category: z.string().min(1, "category is required"),
  description: z.string().optional(),
  internalProductId: z.string().optional(),
  sku: z.string().optional(),
});

const definition = {
  name: "create_product",
  description:
    "Create a product. POST /products. Required: name, category. Optional: description, internalProductId, sku.",
  inputSchema: {
    type: "object" as const,
    properties: {
      name: { type: "string", description: "Product name (required)" },
      category: { type: "string", description: "Category (required)" },
      description: { type: "string", description: "Description" },
      internalProductId: { type: "string", description: "Internal product ID" },
      sku: { type: "string", description: "SKU" },
    },
    required: ["name", "category"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  return handleToolCall(() => productService.createProduct(client, parsed.data));
}

export const createProductTool: Tool = {
  definition,
  handler,
};
