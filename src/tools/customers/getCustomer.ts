import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  id: z.string().min(1, "id is required"),
  includeAddresses: z.boolean().optional(),
  includePaymentMethods: z.boolean().optional(),
});

const definition = {
  name: "get_customer",
  description:
    "Get a specific customer by ID. GET /customers/{customerId}. Optional includes: addressbook, paymentmethod.",
  inputSchema: {
    type: "object" as const,
    properties: {
      id: { type: "string", description: "Customer ID" },
      includeAddresses: { type: "boolean", description: "Include customer addresses (addressbook)" },
      includePaymentMethods: { type: "boolean", description: "Include payment methods (paymentmethod)" },
    },
    required: ["id"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { id, includeAddresses, includePaymentMethods } = parsed.data;
  return handleToolCall(() =>
    customerService.getCustomer(client, id, { includeAddresses, includePaymentMethods })
  );
}

export const getCustomerTool: Tool = {
  definition,
  handler,
};
