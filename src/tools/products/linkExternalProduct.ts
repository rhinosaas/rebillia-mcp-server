import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as productService from "../../services/productServices.js";

const schema = z.object({
  productId: z.string().min(1, "productId is required"),
  companyIntegrationId: z.number().int().positive(),
  productIdExternal: z.string().min(1, "external productId is required"),
  modifierDisplayName: z.string().min(1, "modifierDisplayName is required"),
  displayStyle: z.string().optional(),
  required: z.boolean().optional(),
  defaultRatePlan: z.string().optional(),
});

const definition = {
  name: "link_external_product",
  description:
    "Link an external product to a product. POST /products/{productId}/external-products. Required: companyIntegrationId, productId (external), settings with modifierDisplayName.",
  inputSchema: {
    type: "object" as const,
    properties: {
      productId: { type: "string", description: "Rebillia product ID (required)" },
      companyIntegrationId: { type: "number", description: "Company integration ID (required)" },
      productIdExternal: {
        type: "string",
        description: "External product ID from the integration (required)",
      },
      modifierDisplayName: {
        type: "string",
        description: "Display name for the modifier (required, part of settings)",
      },
      displayStyle: { type: "string", description: "e.g. dropdown" },
      required: { type: "boolean", description: "Whether the external product is required" },
      defaultRatePlan: { type: "string", description: "Default rate plan" },
    },
    required: ["productId", "companyIntegrationId", "productIdExternal", "modifierDisplayName"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const {
    productId,
    companyIntegrationId,
    productIdExternal,
    modifierDisplayName,
    displayStyle,
    required,
    defaultRatePlan,
  } = parsed.data;
  const body = {
    companyIntegrationId,
    productId: productIdExternal,
    settings: { modifierDisplayName },
    displayStyle,
    required,
    defaultRatePlan,
  };
  return handleToolCall(() => productService.linkExternalProduct(client, productId, body));
}

export const linkExternalProductTool: Tool = {
  definition,
  handler,
};
