import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  pageNo: z.number().int().min(1).optional(),
  itemPerPage: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_customer_addresses",
  description:
    "List all address book entries for a customer. GET /customers/{customerId}/addressbooks. Optional: pageNo, itemPerPage.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      pageNo: { type: "number", description: "Page number (default: 1)" },
      itemPerPage: { type: "number", description: "Items per page (default: API default)" },
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
    customerService.listCustomerAddresses(client, customerId, { pageNo, itemPerPage })
  );
}

export const listCustomerAddressesTool: Tool = {
  definition,
  handler,
};
