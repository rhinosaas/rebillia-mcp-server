import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as transactionService from "../../services/transactionServices.js";

const schema = z.object({
  transactionId: z.string().min(1, "transactionId is required"),
  amount: z.number().int().min(0, "amount is required (in CENTS, e.g. 250 = $2.50)"),
});

const definition = {
  name: "refund_transaction",
  description:
    "Refund a transaction. POST /transactions/{transactionId}/refund. AMOUNT IN CENTS: e.g. 250 = $2.50, 5500 = $55.00. Required: transactionId, amount (integer cents).",
  inputSchema: {
    type: "object" as const,
    properties: {
      transactionId: { type: "string", description: "Transaction ID (required)" },
      amount: {
        type: "number",
        description:
          "Refund amount in CENTS (e.g. 250 = $2.50, 5500 = $55.00). Integer, required.",
      },
    },
    required: ["transactionId", "amount"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { transactionId, amount } = parsed.data;
  return handleToolCall(() =>
    transactionService.refundTransaction(client, transactionId, amount)
  );
}

export const refundTransactionTool: Tool = {
  definition,
  handler,
};
