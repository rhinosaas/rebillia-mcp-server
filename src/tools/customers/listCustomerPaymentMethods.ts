import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
});

const definition = {
  name: "list_customer_payment_methods",
  description:
    "List all payment methods for a customer. GET /customers/{customerId}/paymentmethods.",
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
  return handleToolCall(() => customerService.listCustomerPaymentMethods(client, customerId));
}

export const listCustomerPaymentMethodsTool: Tool = {
  definition,
  handler,
};
