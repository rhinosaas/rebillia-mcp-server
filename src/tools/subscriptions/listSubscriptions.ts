import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  include: z.string().optional(),
  query: z.string().optional(),
  orderBy: z.string().optional(),
  sortBy: z.string().optional(),
  filterId: z.number().int().optional(),
  itemPerPage: z.number().int().min(1).optional(),
  pageNo: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_subscriptions",
  description:
    "List subscriptions. GET /subscriptions. Optional: include, query, orderBy, sortBy, filterId, itemPerPage, pageNo.",
  inputSchema: {
    type: "object" as const,
    properties: {
      include: { type: "string", description: "Attributes to include" },
      query: { type: "string", description: "Search query" },
      orderBy: { type: "string", description: "Sort column" },
      sortBy: { type: "string", description: "Sort direction" },
      filterId: { type: "number", description: "Filter ID" },
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
  return handleToolCall(() => subscriptionService.listSubscriptions(client, parsed.data));
}

export const listSubscriptionsTool: Tool = {
  definition,
  handler,
};
