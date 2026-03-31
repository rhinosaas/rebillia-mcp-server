import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  id: z.string().min(1, "id is required"),
  include: z.string().optional(),
});

const definition = {
  name: "get_customer",
  description:
    "Get a specific customer by ID. GET /customers/{customerId}. Optional include supports: addressbook, paymentmethod, lastInvoice, subscriptions, unpaidInvoices, externalCustomers.",
  inputSchema: {
    type: "object" as const,
    properties: {
      id: { type: "string", description: "Customer ID" },
      include: {
        type: "string",
        description:
          "Comma-separated includes: addressbook, paymentmethod, lastInvoice, subscriptions, unpaidInvoices, externalCustomers",
      },
    },
    required: ["id"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { id, include } = parsed.data;
  return handleToolCall(() => customerService.getCustomer(client, id, { include }));
}

export const getCustomerTool: Tool = {
  definition,
  handler,
};
