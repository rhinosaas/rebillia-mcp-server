import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as productService from "../../services/productServices.js";

const statusEnum = ["published", "archived", "disabled"] as const;

const schema = z.object({
  productId: z.string().min(1, "productId is required"),
  status: z.enum(statusEnum, {
    errorMap: () => ({ message: `status must be one of: ${statusEnum.join(", ")}` }),
  }),
});

const definition = {
  name: "update_product_status",
  description:
    "Update a product status. PUT /products/{productId}/status. Required: status. Valid values: published, archived, disabled.",
  inputSchema: {
    type: "object" as const,
    properties: {
      productId: { type: "string", description: "Product ID (required)" },
      status: {
        type: "string",
        description: "Status (required): published, archived, or disabled",
      },
    },
    required: ["productId", "status"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { productId, status } = parsed.data;
  return handleToolCall(() => productService.updateProductStatus(client, productId, status));
}

export const updateProductStatusTool: Tool = {
  definition,
  handler,
};
