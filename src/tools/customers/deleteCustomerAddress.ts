import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  addressId: z.string().min(1, "addressId is required"),
});

const definition = {
  name: "delete_customer_address",
  description:
    "Delete an address book entry. DELETE /customers/{customerId}/addressbooks/{addressId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      addressId: { type: "string", description: "Address book entry ID (required)" },
    },
    required: ["customerId", "addressId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { customerId, addressId } = parsed.data;
  return handleToolCall(() =>
    customerService.deleteCustomerAddress(client, customerId, addressId)
  );
}

export const deleteCustomerAddressTool: Tool = {
  definition,
  handler,
};
