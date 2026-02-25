import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as currencyService from "../../services/currencyServices.js";

const schema = z.object({
  currencyId: z.number().int().positive("currencyId is required (global currency ID)"),
});

const definition = {
  name: "set_default_currency",
  description:
    "Set the company default currency. POST /currencies/default. Required: currencyId (global currency ID). Creates company currency if needed. Fails if there are invoices with that currency.",
  inputSchema: {
    type: "object" as const,
    properties: {
      currencyId: { type: "number", description: "Global currency ID (required)" },
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
    currencyService.setDefaultCurrency(client, { currencyId: parsed.data.currencyId })
  );
}

export const setDefaultCurrencyTool: Tool = {
  definition,
  handler,
};
