import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  chargeCreditId: z.string().min(1, "chargeCreditId is required"),
});

const definition = {
  name: "delete_customer_charge_credit",
  description:
    "Delete a charge or credit for a customer. DELETE /customers/{customerId}/charges_credits/{chargeCreditId}. Fails if the charge/credit has invoice details assigned.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      chargeCreditId: { type: "string", description: "Charge/credit ID (required)" },
    },
    required: ["customerId", "chargeCreditId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { customerId, chargeCreditId } = parsed.data;
  return handleToolCall(() =>
    customerService.deleteCustomerChargeCredit(client, customerId, chargeCreditId)
  );
}

export const deleteCustomerChargeCreditTool: Tool = {
  definition,
  handler,
};
