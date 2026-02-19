import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  name: z.string().min(1, "name is required"),
  contactName: z.string().min(1, "contactName is required"),
  street1: z.string().min(1, "street1 is required"),
  city: z.string().min(1, "city is required"),
  state: z.string().min(1, "state is required"),
  zip: z.string().min(1, "zip is required"),
  countryId: z.string().min(1, "countryId is required"),
  type: z.enum(["residential", "commercial"], {
    errorMap: () => ({ message: "type must be 'residential' or 'commercial'" }),
  }),
  street2: z.string().optional(),
  company: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
});

const definition = {
  name: "create_customer_address",
  description:
    "Create an address book entry for a customer. POST /customers/{customerId}/addressbooks. Required: name, contactName, street1, city, state, zip, countryId, type (residential or commercial). Optional: street2, company, contactEmail, contactPhone.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      name: { type: "string", description: "Address name (required)" },
      contactName: { type: "string", description: "Contact name (required)" },
      street1: { type: "string", description: "Street line 1 (required)" },
      city: { type: "string", description: "City (required)" },
      state: { type: "string", description: "State (required)" },
      zip: { type: "string", description: "Postal code (required)" },
      countryId: { type: "string", description: "Country ID (required)" },
      type: { type: "string", description: "Address type (required): residential or commercial" },
      street2: { type: "string", description: "Street line 2" },
      company: { type: "string", description: "Company name" },
      contactEmail: { type: "string", description: "Contact email" },
      contactPhone: { type: "string", description: "Contact phone" },
    },
    required: ["customerId", "name", "contactName", "street1", "city", "state", "zip", "countryId", "type"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const { customerId, ...body } = parsed.data;
  return handleToolCall(() => customerService.createCustomerAddress(client, customerId, body));
}

export const createCustomerAddressTool: Tool = {
  definition,
  handler,
};
