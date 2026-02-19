import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  amount: z.number().int().min(1, "amount must be a positive integer (in cents)"),
  description: z.string().max(200).optional(),
  type: z.enum(["charge", "credit"], {
    errorMap: () => ({ message: "type must be 'charge' or 'credit'" }),
  }),
  companyCurrencyId: z.number().int().positive("companyCurrencyId is required and must be > 0"),
  category: z.enum(["physical", "digital"], {
    errorMap: () => ({ message: "category must be 'physical' or 'digital'" }),
  }),
  qty: z.number().int().min(1).optional(),
  isFreeShipping: z.boolean().optional(),
  taxable: z.boolean().optional(),
  weight: z.number().optional(),
});

const definition = {
  name: "create_customer_charge_credit",
  description:
    "Create a charge or credit for a customer. POST /customers/{customerId}/charges_credits. IMPORTANT: amount is in CENTS (e.g. 10000 = $100.00). Required: amount (integer, in cents), type (charge or credit), companyCurrencyId, category (physical or digital). Optional: description, qty (default 1), isFreeShipping, taxable, weight (required by API when category is physical).",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      amount: {
        type: "number",
        description:
          "Amount in CENTS (required). Example: 1000 = $10.00, 500 = $5.00. Must be a positive integer.",
      },
      description: { type: "string", description: "Description (max 200 chars)" },
      type: {
        type: "string",
        description: "Type (required): charge or credit",
      },
      companyCurrencyId: {
        type: "number",
        description: "Company currency ID (required, must be > 0)",
      },
      category: {
        type: "string",
        description: "Category (required): physical or digital",
      },
      qty: { type: "number", description: "Quantity (default 1)" },
      isFreeShipping: { type: "boolean", description: "Free shipping" },
      taxable: { type: "boolean", description: "Whether the line is taxable" },
      weight: { type: "number", description: "Weight (required by API when category is physical)" },
    },
    required: ["customerId", "amount", "type", "companyCurrencyId", "category"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const { customerId, ...body } = parsed.data;
  return handleToolCall(() =>
    customerService.createCustomerChargeCredit(client, customerId, {
      amount: body.amount,
      description: body.description,
      type: body.type,
      companyCurrencyId: body.companyCurrencyId,
      category: body.category,
      qty: body.qty,
      isFreeShipping: body.isFreeShipping,
      taxable: body.taxable,
      weight: body.weight,
    })
  );
}

export const createCustomerChargeCreditTool: Tool = {
  definition,
  handler,
};
