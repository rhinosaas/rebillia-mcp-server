import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as invoiceService from "../../services/invoiceServices.js";

const schema = z.object({
  invoiceId: z.string().min(1, "invoiceId is required"),
  include: z.string().optional(),
});

const definition = {
  name: "get_invoice",
  description: "Get an invoice by ID. GET /invoices/{invoiceId}. Optional: include.",
  inputSchema: {
    type: "object" as const,
    properties: {
      invoiceId: { type: "string", description: "Invoice ID (required)" },
      include: { type: "string", description: "Attributes to include (e.g. detail, transactions)" },
    },
    required: ["invoiceId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { invoiceId, include } = parsed.data;
  return handleToolCall(() => invoiceService.getInvoice(client, invoiceId, { include }));
}

export const getInvoiceTool: Tool = {
  definition,
  handler,
};
