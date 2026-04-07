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
  status: z.enum(["active", "paused", "requestPayment", "archived"]).optional(),
  customerId: z.number().int().optional(),
  companyGatewayId: z.number().int().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  itemPerPage: z.number().int().min(1).optional(),
  pageNo: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_subscriptions",
  description:
    "List subscriptions. GET /subscriptions. Optional: include, query, orderBy, sortBy, filterId, status (exact status), customerId (customer id), companyGatewayId (subscription company gateway id), dateFrom/dateTo (createdAt range; dateFrom from 00:00:00, dateTo through 23:59:59; invalid dates are ignored), itemPerPage, pageNo. Examples: /v1/subscriptions?status=active ; /v1/subscriptions?customerId=123&companyGatewayId=8 ; /v1/subscriptions?dateFrom=2026-01-01&dateTo=2026-01-31 ; /v1/subscriptions?status=paused&customerId=123&dateFrom=2026-01-01&dateTo=2026-01-31.",
  inputSchema: {
    type: "object" as const,
    properties: {
      include: { type: "string", description: "Attributes to include" },
      query: { type: "string", description: "Search query" },
      orderBy: { type: "string", description: "Sort column" },
      sortBy: { type: "string", description: "Sort direction" },
      filterId: { type: "number", description: "Filter ID" },
      status: {
        type: "string",
        enum: ["active", "paused", "requestPayment", "archived"],
        description: "Filter by exact subscription status",
      },
      customerId: {
        type: "integer",
        format: "int64",
        description: "Filter by customer id",
      },
      companyGatewayId: {
        type: "integer",
        format: "int64",
        description: "Filter by subscription company gateway id",
      },
      dateFrom: {
        type: "string",
        format: "date",
        example: "2026-01-01",
        description: "Filter createdAt from this date (applies from 00:00:00); invalid dates are ignored",
      },
      dateTo: {
        type: "string",
        format: "date",
        example: "2026-01-31",
        description: "Filter createdAt to this date (applies through 23:59:59); invalid dates are ignored",
      },
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
