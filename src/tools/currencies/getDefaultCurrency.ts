import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { handleToolCall } from "./helpers.js";
import * as currencyService from "../../services/currencyServices.js";

const definition = {
  name: "get_default_currency",
  description: "Get the company default currency. GET /currencies/default.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

async function handler(client: Client, _args: Record<string, unknown> | undefined) {
  return handleToolCall(() => currencyService.getDefaultCurrency(client));
}

export const getDefaultCurrencyTool: Tool = {
  definition,
  handler,
};
