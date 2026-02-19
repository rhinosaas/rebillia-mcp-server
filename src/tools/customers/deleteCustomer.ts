import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
});

const definition = {
  name: "delete_customer",
  description:
    "Delete a customer by ID. DELETE /customers/{customerId}. WARNING: Cascading delete may remove or orphan related data (addresses, payment methods, subscriptions, invoices, etc.). Use with caution.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID to delete (required)" },
    },
    required: ["customerId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => customerService.deleteCustomer(client, parsed.data.customerId));
}

export const deleteCustomerTool: Tool = {
  definition,
  handler,
};
