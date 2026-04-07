import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  businessName: z.string().optional(),
  locale: z.string().optional(),
  phoneNum: z.string().optional(),
  phoneExt: z.string().optional(),
  preferredCurrency: z.string().optional(),
  taxExempt: z.boolean().optional(),
  status: z.enum(["active", "disabled", "archived"]).optional(),
});

const definition = {
  name: "update_customer",
  description:
    "Update an existing customer. PUT /customers/{customerId}. Required: customerId. Optional: firstName, lastName, email, businessName, locale, phoneNum, phoneExt, preferredCurrency, taxExempt, status (active|disabled|archived).",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID to update (required)" },
      firstName: { type: "string", description: "Customer first name" },
      lastName: { type: "string", description: "Customer last name" },
      email: { type: "string", description: "Customer email" },
      businessName: { type: "string", description: "Business name" },
      locale: { type: "string", description: "Locale code" },
      phoneNum: { type: "string", description: "Phone number" },
      phoneExt: { type: "string", description: "Phone extension" },
      preferredCurrency: { type: "string", description: "Preferred currency code" },
      taxExempt: { type: "boolean", description: "Whether customer is tax exempt" },
      status: { type: "string", description: "Customer status: active, disabled, or archived" },
    },
    required: ["customerId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const { customerId, ...rest } = parsed.data;
  return handleToolCall(() => customerService.updateCustomer(client, customerId, rest));
}

export const updateCustomerTool: Tool = {
  definition,
  handler,
};
