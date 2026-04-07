import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as productService from "../../services/productServices.js";

const schema = z.object({
  productId: z.string().min(1, "productId is required"),
});

const definition = {
  name: "delete_product",
  description:
    "Delete a product. DELETE /products/{productId}. Warning: This also deletes associated rate plans and related data (cascading deletion).",
  inputSchema: {
    type: "object" as const,
    properties: {
      productId: { type: "string", description: "Product ID (required)" },
    },
    required: ["productId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => productService.deleteProduct(client, parsed.data.productId));
}

export const deleteProductTool: Tool = {
  definition,
  handler,
};
