import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import { INTEGRATION_TYPES } from "./constants.js";
import * as integrationService from "../../services/integrationServices.js";

const schema = z.object({
  type: z.enum(INTEGRATION_TYPES).optional(),
  include: z.string().optional(),
  itemPerPage: z.number().int().min(1).optional(),
  pageNo: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_integrations",
  description:
    "List company integrations. GET /integrations. Optional: type (ecommerce, email, marketing, tax, shipping, accounting, chat), include, itemPerPage, pageNo.",
  inputSchema: {
    type: "object" as const,
    properties: {
      type: {
        type: "string",
        description:
          "Filter by integration type: ecommerce, email, marketing, tax, shipping, accounting, chat",
      },
      include: { type: "string", description: "Comma-separated attributes to include" },
      itemPerPage: { type: "number", description: "Items per page" },
      pageNo: { type: "number", description: "Page number" },
    },
    required: [],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => integrationService.listIntegrations(client, parsed.data));
}

export const listIntegrationsTool: Tool = {
  definition,
  handler,
};
