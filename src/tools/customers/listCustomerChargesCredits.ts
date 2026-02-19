import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  status: z.string().optional(),
  type: z.enum(["charge", "credit"]).optional(),
  pageNo: z.number().int().min(1).optional(),
  itemPerPage: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_customer_charges_credits",
  description:
    "List charges and credits for a customer. GET /customers/{customerId}/charges_credits. Optional filters: status, type (charge or credit).",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      status: { type: "string", description: "Filter by status" },
      type: { type: "string", description: "Filter by type: charge or credit" },
      pageNo: { type: "number", description: "Page number (1-based)" },
      itemPerPage: { type: "number", description: "Items per page" },
    },
    required: ["customerId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { customerId, status, type, pageNo, itemPerPage } = parsed.data;
  return handleToolCall(() =>
    customerService.listCustomerChargesCredits(client, customerId, {
      status,
      type,
      pageNo,
      itemPerPage,
    })
  );
}

export const listCustomerChargesCreditsTool: Tool = {
  definition,
  handler,
};
