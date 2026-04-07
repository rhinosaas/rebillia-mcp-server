import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as transactionService from "../../services/transactionServices.js";

const schema = z.object({
  orderBy: z.string().optional(),
  sortBy: z.string().optional(),
  itemPerPage: z.number().int().min(1).optional(),
  pageNo: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_transactions",
  description:
    "List transactions. GET /transactions. Optional: orderBy, sortBy, itemPerPage, pageNo.",
  inputSchema: {
    type: "object" as const,
    properties: {
      orderBy: { type: "string", description: "Sort column" },
      sortBy: { type: "string", description: "Sort direction" },
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
  return handleToolCall(() => transactionService.listTransactions(client, parsed.data));
}

export const listTransactionsTool: Tool = {
  definition,
  handler,
};
