import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as currencyService from "../../services/currencyServices.js";

const schema = z.object({
  companyCurrencyId: z.string().min(1, "companyCurrencyId is required"),
});

const definition = {
  name: "delete_currency",
  description:
    "Delete a company currency. DELETE /currencies/{companyCurrencyId}. Fails if currency is in use (invoices, subscriptions, transactions, or gateways).",
  inputSchema: {
    type: "object" as const,
    properties: {
      companyCurrencyId: { type: "string", description: "Company currency ID (required)" },
    },
    required: ["companyCurrencyId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() =>
    currencyService.deleteCurrency(client, parsed.data.companyCurrencyId)
  );
}

export const deleteCurrencyTool: Tool = {
  definition,
  handler,
};
