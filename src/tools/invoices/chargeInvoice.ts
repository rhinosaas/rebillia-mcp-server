import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as invoiceService from "../../services/invoiceServices.js";

const paymentTypeEnum = ["offlinePaymentProvider", "thirdPartyPaymentProvider", "walletPaymentProvider", "otherPayment"] as const;

const schema = z.object({
  invoiceId: z.string().min(1, "invoiceId is required"),
  amount: z.number().int().min(1, "amount is required and must be positive (in CENTS)"),
  paymentType: z.enum(paymentTypeEnum, { required_error: "paymentType is required" }),
});

const definition = {
  name: "charge_invoice",
  description:
    "Charge an invoice (card/online payment). POST /invoices/{invoiceId}/charge. AMOUNT IN CENTS: e.g. 5500 = $55.00. Required: invoiceId, amount (integer cents), paymentType (offlinePaymentProvider | thirdPartyPaymentProvider | walletPaymentProvider | otherPayment). Use thirdPartyPaymentProvider for card/online.",
  inputSchema: {
    type: "object" as const,
    properties: {
      invoiceId: { type: "string", description: "Invoice ID (required)" },
      amount: {
        type: "number",
        description: "Amount in CENTS (e.g. 5500 = $55.00). Integer, required.",
      },
      paymentType: {
        type: "string",
        description: "Payment type (required): offlinePaymentProvider, thirdPartyPaymentProvider, walletPaymentProvider, or otherPayment. Use thirdPartyPaymentProvider for card/online.",
      },
    },
    required: ["invoiceId", "amount", "paymentType"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { invoiceId, amount, paymentType } = parsed.data;
  return handleToolCall(() =>
    invoiceService.chargeInvoice(client, invoiceId, { amount, paymentType })
  );
}

export const chargeInvoiceTool: Tool = {
  definition,
  handler,
};
