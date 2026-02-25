import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import { FILTER_SECTIONS } from "./constants.js";
import * as filterService from "../../services/filterServices.js";

const schema = z.object({
  section: z.enum(FILTER_SECTIONS, {
    errorMap: () => ({ message: "section is required and must be a valid section (e.g. subscriptions, invoices, customers, products)" }),
  }),
});

const definition = {
  name: "list_filter_fields",
  description:
    "List available filter fields/attributes for a section. GET /companies/filters/fields. Required: section. Returns available filter attributes for the section.",
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
  return handleToolCall(() =>
    filterService.listFilterFields(client, parsed.data.section)
  );
}

export const listFilterFieldsTool: Tool = {
  definition,
  handler,
};
