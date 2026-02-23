import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as billRunService from "../../services/billRunServices.js";

const statusEnum = ["completed", "pending", "error"] as const;

const schema = z.object({
  include: z.string().optional(),
  query: z.enum(statusEnum).optional(),
  orderBy: z.string().optional(),
  sortBy: z.string().optional(),
  itemPerPage: z.number().int().min(1).optional(),
  pageNo: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_bill_runs",
  description:
    "List bill runs. GET /bill-run. Optional: include (e.g. invoice), query (filter by status: completed, pending, error), orderBy, sortBy, itemPerPage, pageNo.",
  inputSchema: {
    type: "object" as const,
    properties: {
      include: { type: "string", description: "Include related data (e.g. invoice)" },
      query: {
        type: "string",
        description: "Filter by status: completed, pending, or error",
      },
      orderBy: { type: "string", description: "Sort column" },
      sortBy: { type: "string", description: "Sort direction" },
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
  return handleToolCall(() => billRunService.listBillRuns(client, parsed.data));
}

export const listBillRunsTool: Tool = {
  definition,
  handler,
};
