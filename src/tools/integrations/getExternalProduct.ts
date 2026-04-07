import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as integrationService from "../../services/integrationServices.js";

const schema = z.object({
  integrationId: z.string().min(1, "integrationId is required"),
  externalProductId: z.string().min(1, "externalProductId is required (numeric ID as string)"),
});

const definition = {
  name: "get_external_product",
  description:
    "Get an external product by ID. GET /integrations/{integrationId}/products/{externalProductId}. API expects numeric productId.",
  inputSchema: {
    type: "object" as const,
    properties: {
      integrationId: { type: "string", description: "Company integration ID (required)" },
      externalProductId: {
        type: "string",
        description: "External product ID (required, numeric as string)",
      },
    },
    required: ["integrationId", "externalProductId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { integrationId, externalProductId } = parsed.data;
  return handleToolCall(() =>
    integrationService.getExternalProduct(client, integrationId, externalProductId)
  );
}

export const getExternalProductTool: Tool = {
  definition,
  handler,
};
