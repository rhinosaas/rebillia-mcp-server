import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as productService from "../../services/productServices.js";

const schema = z.object({
  productId: z.string().min(1, "productId is required"),
  externalProductId: z.string().min(1, "externalProductId is required"),
});

const definition = {
  name: "unlink_external_product",
  description:
    "Unlink an external product from a product. DELETE /products/{productId}/external-products/{externalProductId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      productId: { type: "string", description: "Product ID (required)" },
      externalProductId: {
        type: "string",
        description: "External product ID (required)",
      },
    },
    required: ["productId", "externalProductId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { productId, externalProductId } = parsed.data;
  return handleToolCall(() =>
    productService.unlinkExternalProduct(client, productId, externalProductId)
  );
}

export const unlinkExternalProductTool: Tool = {
  definition,
  handler,
};
