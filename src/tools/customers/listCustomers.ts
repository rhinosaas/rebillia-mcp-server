import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const definition = {
  name: "list_customers",
  description:
    "List customers with optional query parameters for filtering and pagination. GET /customers. See https://apiguide.rebillia.com/ for the Public API.",
  inputSchema: {
    type: "object" as const,
    properties: {
      pageNo: { type: "number", description: "Page number (default: 1)" },
      itemPerPage: { type: "number", description: "Items per page (default: 25, max 250)" },
      query: {
        type: "string",
        description: "Search term: matches firstName, lastName, email, and related company name/support pin",
      },
      status: {
        type: "string",
        description: "Filter by customer status: active, disabled, or archived",
      },
      sortBy: { type: "string", description: "Sort direction: ASC or DESC (default: ASC for customers)" },
      orderBy: {
        type: "string",
        description: "Column to sort by (e.g. firstName, lastName, email, createdAt). Default: firstName",
      },
      include: {
        type: "string",
        description:
          "Comma-separated includes: addressbook, paymentmethod, lastInvoice, subscriptions, unpaidInvoices, externalCustomers",
      },
      filterId: { type: "number", description: "Optional saved filter ID to apply predefined filters" },
    },
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const a = (args ?? {}) as Record<string, unknown>;
  const params: customerService.ListCustomersParams = {
    pageNo: a.pageNo != null ? Number(a.pageNo) : undefined,
    itemPerPage: a.itemPerPage != null ? Number(a.itemPerPage) : undefined,
    query: typeof a.query === "string" ? a.query : undefined,
    status: typeof a.status === "string" ? a.status : undefined,
    sortBy: typeof a.sortBy === "string" ? a.sortBy : undefined,
    orderBy: typeof a.orderBy === "string" ? a.orderBy : undefined,
    include: typeof a.include === "string" ? a.include : undefined,
    filterId: a.filterId != null ? Number(a.filterId) : undefined,
  };
  return handleToolCall(() => customerService.listCustomers(client, params));
}

export const listCustomersTool: Tool = {
  definition,
  handler,
};
