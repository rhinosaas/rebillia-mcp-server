import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as transactionService from "../../services/transactionServices.js";

const schema = z.object({
  transactionId: z.string().min(1, "transactionId is required"),
});

const definition = {
  name: "get_transaction",
  description: "Get a transaction by ID. GET /transactions/{transactionId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      transactionId: { type: "string", description: "Transaction ID (required)" },
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
    transactionService.getTransaction(client, parsed.data.transactionId)
  );
}

export const getTransactionTool: Tool = {
  definition,
  handler,
};
