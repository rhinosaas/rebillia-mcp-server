import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as filterService from "../../services/filterServices.js";

const schema = z.object({
  filterId: z.number().int().positive("filterId must be a positive integer"),
});

const definition = {
  name: "remove_filter",
  description:
    "Delete a company filter. DELETE /companies/filters/{filterId}. Required: filterId.",
  inputSchema: {
    type: "object" as const,
    properties: {
      filterId: {
        type: "number",
        description: "ID of the filter to delete.",
      },
    },
    required: ["filterId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => filterService.deleteFilter(client, parsed.data.filterId));
}

export const removeFilterTool: Tool = {
  definition,
  handler,
};
