import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as currencyService from "../../services/currencyServices.js";

const schema = z.object({
  currencyId: z.string().min(1, "currencyId is required (company currency ID)"),
});

const definition = {
  name: "get_currency",
  description: "Get a company currency by ID. GET /currencies/{currencyId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      currencyId: { type: "string", description: "Company currency ID (required)" },
    },
    required: ["currencyId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() =>
    currencyService.getCurrency(client, parsed.data.currencyId)
  );
}

export const getCurrencyTool: Tool = {
  definition,
  handler,
};
