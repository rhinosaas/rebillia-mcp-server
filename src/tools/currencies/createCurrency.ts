import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as currencyService from "../../services/currencyServices.js";

const schema = z.object({
  currencyId: z.number().int().positive("currencyId is required (global currency ID)"),
  conversionRate: z.number().finite("conversionRate is required"),
  fixedRate: z.boolean({ required_error: "fixedRate is required (boolean)" }),
});

const definition = {
  name: "create_currency",
  description:
    "Create a company currency. POST /currencies. Required: currencyId (global currency ID), conversionRate (number), fixedRate (boolean).",
  inputSchema: {
    type: "object" as const,
    properties: {
      currencyId: { type: "number", description: "Global currency ID (required)" },
      conversionRate: { type: "number", description: "Conversion rate (required)" },
      fixedRate: { type: "boolean", description: "Fixed rate flag (required)" },
    },
    required: ["currencyId", "conversionRate", "fixedRate"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => currencyService.createCurrency(client, parsed.data));
}

export const createCurrencyTool: Tool = {
  definition,
  handler,
};
