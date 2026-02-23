import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as invoiceService from "../../services/invoiceServices.js";

const schema = z.object({
  include: z.string().optional(),
  status: z.string().optional(),
  query: z.string().optional(),
  orderBy: z.string().optional(),
  sortBy: z.string().optional(),
  filterId: z.number().int().optional(),
  itemPerPage: z.number().int().min(1).optional(),
  pageNo: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_invoices",
  description:
    "List invoices. GET /invoices. Optional: include (detail, transactions, billruns, externalInvoices), status, query, orderBy, sortBy, filterId, itemPerPage, pageNo.",
  inputSchema: {
    type: "object" as const,
    properties: {
      include: { type: "string", description: "Comma-separated: detail, transactions, billruns, externalInvoices" },
      status: { type: "string", description: "Filter by status" },
      query: { type: "string", description: "Search query" },
      orderBy: { type: "string", description: "Sort column" },
      sortBy: { type: "string", description: "Sort direction" },
      filterId: { type: "number", description: "Filter ID" },
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
  return handleToolCall(() => invoiceService.listInvoices(client, parsed.data));
}

export const listInvoicesTool: Tool = {
  definition,
  handler,
};
