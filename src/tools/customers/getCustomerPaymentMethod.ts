import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  paymentMethodId: z.string().min(1, "paymentMethodId is required"),
});

const definition = {
  name: "get_customer_payment_method",
  description:
    "Get a single payment method by ID. GET /customers/{customerId}/paymentmethods/{paymentMethodId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      paymentMethodId: { type: "string", description: "Payment method ID (required)" },
    },
    required: ["customerId", "paymentMethodId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { customerId, paymentMethodId } = parsed.data;
  return handleToolCall(() =>
    customerService.getCustomerPaymentMethod(client, customerId, paymentMethodId)
  );
}

export const getCustomerPaymentMethodTool: Tool = {
  definition,
  handler,
};
