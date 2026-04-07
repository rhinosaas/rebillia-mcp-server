import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as integrationService from "../../services/integrationServices.js";

const schema = z.object({
  integrationId: z.string().min(1, "integrationId is required"),
  include: z.string().optional(),
  itemPerPage: z.number().int().min(1).optional(),
  pageNo: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_external_invoices",
  description:
    "List external invoices for an integration. GET /integrations/{integrationId}/external-invoices. Optional: include, itemPerPage, pageNo.",
  inputSchema: {
    type: "object" as const,
    properties: {
      integrationId: { type: "string", description: "Company integration ID (required)" },
      include: { type: "string", description: "Comma-separated attributes to include" },
      itemPerPage: { type: "number", description: "Items per page" },
      pageNo: { type: "number", description: "Page number" },
    },
    required: ["integrationId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { integrationId, include, itemPerPage, pageNo } = parsed.data;
  return handleToolCall(() =>
    integrationService.listExternalInvoices(client, integrationId, {
      include,
      itemPerPage,
      pageNo,
    })
  );
}

export const listExternalInvoicesTool: Tool = {
  definition,
  handler,
};
