import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  pageNo: z.number().optional(),
  itemPerPage: z.number().optional(),
  include: z.string().optional(),
});

const definition = {
  name: "get_customer_invoices",
  description:
    "List invoices for a customer. GET /customers/{customerId}/invoices. Supports pagination (pageNo, itemPerPage) and include (e.g. detail, transactions).",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      pageNo: { type: "number", description: "Page number (default: 1)" },
      itemPerPage: { type: "number", description: "Items per page (default: 25)" },
      include: { type: "string", description: "Comma-separated: detail, transactions, billruns, externalInvoices" },
    },
    required: ["customerId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { customerId, pageNo, itemPerPage, include } = parsed.data;
  return handleToolCall(() =>
    customerService.getCustomerInvoices(client, customerId, { pageNo, itemPerPage, include })
  );
}

export const getCustomerInvoicesTool: Tool = {
  definition,
  handler,
};
