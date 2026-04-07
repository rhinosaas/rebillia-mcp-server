import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as invoiceService from "../../services/invoiceServices.js";

const schema = z.object({
  invoiceId: z.string().min(1, "invoiceId is required"),
});

const definition = {
  name: "delete_invoice",
  description: "Delete an invoice. DELETE /invoices/{invoiceId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      invoiceId: { type: "string", description: "Invoice ID (required)" },
    },
    required: ["invoiceId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => invoiceService.deleteInvoice(client, parsed.data.invoiceId));
}

export const deleteInvoiceTool: Tool = {
  definition,
  handler,
};
