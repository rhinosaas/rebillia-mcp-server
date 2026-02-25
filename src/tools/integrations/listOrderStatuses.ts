import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as integrationService from "../../services/integrationServices.js";

const schema = z.object({
  integrationId: z.string().min(1, "integrationId is required"),
});

const definition = {
  name: "list_order_statuses",
  description:
    "List order statuses for an integration. GET /integrations/{integrationId}/orders/statuses. Supported for e.g. BigCommerce, Shopify.",
  inputSchema: {
    type: "object" as const,
    properties: {
      integrationId: { type: "string", description: "Company integration ID (required)" },
    },
    required: ["integrationId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() =>
    integrationService.listOrderStatuses(client, parsed.data.integrationId)
  );
}

export const listOrderStatusesTool: Tool = {
  definition,
  handler,
};
