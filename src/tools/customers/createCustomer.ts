import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  firstName: z.string().min(1, "firstName is required"),
  lastName: z.string().min(1, "lastName is required"),
  email: z.string().email("Invalid email"),
  businessName: z.string().optional(),
  locale: z.string().optional(),
  phoneNum: z.string().optional(),
  phoneExt: z.string().optional(),
  preferredCurrency: z.string().optional(),
  taxExempt: z.boolean().optional(),
});

const definition = {
  name: "create_customer",
  description:
    "Create a new customer. POST /customers. Required: firstName, lastName, email. Optional: businessName, locale, phoneNum, phoneExt, preferredCurrency, taxExempt.",
  inputSchema: {
    type: "object" as const,
    properties: {
      firstName: { type: "string", description: "Customer first name (required)" },
      lastName: { type: "string", description: "Customer last name (required)" },
      email: { type: "string", description: "Customer email (required)" },
      businessName: { type: "string", description: "Business name" },
      locale: { type: "string", description: "Locale code" },
      phoneNum: { type: "string", description: "Phone number" },
      phoneExt: { type: "string", description: "Phone extension" },
      preferredCurrency: { type: "string", description: "Preferred currency code" },
      taxExempt: { type: "boolean", description: "Whether customer is tax exempt" },
    },
    required: ["firstName", "lastName", "email"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  return handleToolCall(() => customerService.createCustomer(client, parsed.data));
}

export const createCustomerTool: Tool = {
  definition,
  handler,
};
