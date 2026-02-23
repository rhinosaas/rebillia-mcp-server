import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as transactionService from "../../services/transactionServices.js";

const schema = z.object({
  transactionId: z.string().min(1, "transactionId is required"),
});

const definition = {
  name: "void_transaction",
  description:
    "Void a transaction. POST /transactions/{transactionId}/void. Only works before settlement; after settlement use refund_transaction instead.",
  inputSchema: {
    type: "object" as const,
    properties: {
      transactionId: {
        type: "string",
        description:
          "Transaction ID (required). Void only works before settlement; after settlement use refund_transaction.",
      },
    },
    required: ["transactionId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() =>
    transactionService.voidTransaction(client, parsed.data.transactionId)
  );
}

export const voidTransactionTool: Tool = {
  definition,
  handler,
};
