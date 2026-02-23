import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as invoiceService from "../../services/invoiceServices.js";

const schema = z.object({
  invoiceId: z.string().min(1, "invoiceId is required"),
  amount: z.number().int().min(1, "amount is required and must be positive (in CENTS)"),
});

const definition = {
  name: "charge_invoice_external",
  description:
    "Charge an invoice via offline payment (cash/check/wire). POST /invoices/{invoiceId}/charge with paymentType: offlinePaymentProvider. AMOUNT IN CENTS: e.g. 5500 = $55.00. Required: invoiceId, amount (integer cents).",
  inputSchema: {
    type: "object" as const,
    properties: {
      invoiceId: { type: "string", description: "Invoice ID (required)" },
      amount: {
        type: "number",
        description: "Amount in CENTS (e.g. 5500 = $55.00). Integer, required.",
      },
    },
    required: ["invoiceId", "amount"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { invoiceId, amount } = parsed.data;
  return handleToolCall(() =>
    invoiceService.chargeInvoiceExternal(client, invoiceId, { amount })
  );
}

export const chargeInvoiceExternalTool: Tool = {
  definition,
  handler,
};
