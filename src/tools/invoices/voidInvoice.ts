import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as invoiceService from "../../services/invoiceServices.js";

const schema = z.object({
  invoiceId: z.string().min(1, "invoiceId is required"),
});

const definition = {
  name: "void_invoice",
  description:
    "Void an invoice. PUT /invoices/{invoiceId}/void. CRITICAL: This action is IRREVERSIBLE. Use with caution.",
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
  return handleToolCall(() => invoiceService.voidInvoice(client, parsed.data.invoiceId));
}

export const voidInvoiceTool: Tool = {
  definition,
  handler,
};
