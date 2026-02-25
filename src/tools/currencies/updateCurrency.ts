import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as currencyService from "../../services/currencyServices.js";

const schema = z.object({
  companyCurrencyId: z.string().min(1, "companyCurrencyId is required"),
  conversionRate: z.number().finite("conversionRate is required"),
  fixedRate: z.boolean({ required_error: "fixedRate is required (boolean)" }),
});

const definition = {
  name: "update_currency",
  description:
    "Update a company currency. PUT /currencies/{companyCurrencyId}. Required: companyCurrencyId, conversionRate, fixedRate.",
  inputSchema: {
    type: "object" as const,
    properties: {
      companyCurrencyId: { type: "string", description: "Company currency ID (required)" },
      conversionRate: { type: "number", description: "Conversion rate (required)" },
      fixedRate: { type: "boolean", description: "Fixed rate flag (required)" },
    },
    required: ["companyCurrencyId", "conversionRate", "fixedRate"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { companyCurrencyId, conversionRate, fixedRate } = parsed.data;
  return handleToolCall(() =>
    currencyService.updateCurrency(client, companyCurrencyId, { conversionRate, fixedRate })
  );
}

export const updateCurrencyTool: Tool = {
  definition,
  handler,
};
