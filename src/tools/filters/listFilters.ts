import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import { FILTER_SECTIONS } from "./constants.js";
import * as filterService from "../../services/filterServices.js";

const schema = z.object({
  section: z.enum(FILTER_SECTIONS, {
    errorMap: () => ({ message: "section is required (e.g. subscriptions, invoices, customers, products)" }),
  }),
});

const definition = {
  name: "list_filters",
  description:
    "List company filters. GET /companies/filters. Required: section (e.g. subscriptions, invoices, customers, products, orders, billRuns).",
  inputSchema: {
    type: "object" as const,
    properties: {
      section: {
        type: "string",
        description:
          "Section (required). One of: subscriptions, invoices, customers, products, orders, billRuns, etc.",
      },
    },
    required: ["section"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => filterService.listFilters(client, parsed.data));
}

export const listFiltersTool: Tool = {
  definition,
  handler,
};
