import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as integrationService from "../../services/integrationServices.js";

const schema = z.object({
  integrationId: z.string().min(1, "integrationId is required"),
  productName: z.string().min(1, "productName is required"),
});

const definition = {
  name: "list_external_products",
  description:
    "List external products for an integration. GET /integrations/{integrationId}/products. Required: integrationId, productName (sent as name query param).",
  inputSchema: {
    type: "object" as const,
    properties: {
      integrationId: { type: "string", description: "Company integration ID (required)" },
      productName: { type: "string", description: "Product name filter (required)" },
    },
    required: ["integrationId", "productName"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { integrationId, productName } = parsed.data;
  return handleToolCall(() =>
    integrationService.listExternalProducts(client, integrationId, { name: productName })
  );
}

export const listExternalProductsTool: Tool = {
  definition,
  handler,
};
