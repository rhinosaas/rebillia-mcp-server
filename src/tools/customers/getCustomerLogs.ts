import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  pageNo: z.number().optional(),
  itemPerPage: z.number().optional(),
});

const definition = {
  name: "get_customer_logs",
  description:
    "List activity logs for a customer. GET /customers/{customerId}/logs. Returns paginated log entries.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      pageNo: { type: "number", description: "Page number (default: 1)" },
      itemPerPage: { type: "number", description: "Items per page (default: 25)" },
    },
    required: ["customerId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { customerId, pageNo, itemPerPage } = parsed.data;
  return handleToolCall(() =>
    customerService.getCustomerLogs(client, customerId, { pageNo, itemPerPage })
  );
}

export const getCustomerLogsTool: Tool = {
  definition,
  handler,
};
