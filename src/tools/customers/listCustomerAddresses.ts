import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
});

const definition = {
  name: "list_customer_addresses",
  description:
    "List all address book entries for a customer. GET /customers/{customerId}/addressbooks.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
    },
    required: ["customerId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { customerId } = parsed.data;
  return handleToolCall(() => customerService.listCustomerAddresses(client, customerId));
}

export const listCustomerAddressesTool: Tool = {
  definition,
  handler,
};
