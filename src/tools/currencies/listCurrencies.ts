import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as currencyService from "../../services/currencyServices.js";

const schema = z.object({
  include: z.string().optional(),
  itemPerPage: z.number().int().min(1).optional(),
  pageNo: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_currencies",
  description:
    "List company currencies. GET /currencies. Optional: include, itemPerPage, pageNo.",
  inputSchema: {
    type: "object" as const,
    properties: {
      include: { type: "string", description: "Comma-separated attributes to include" },
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
  return handleToolCall(() => currencyService.listCurrencies(client, parsed.data));
}

export const listCurrenciesTool: Tool = {
  definition,
  handler,
};
