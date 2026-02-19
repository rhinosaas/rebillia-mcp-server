import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  addressId: z.string().min(1, "addressId is required"),
  name: z.string().min(1).optional(),
  contactName: z.string().min(1).optional(),
  street1: z.string().min(1).optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  countryId: z.string().optional(),
  company: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  type: z.enum(["residential", "commercial"]).optional(),
});

const definition = {
  name: "update_customer_address",
  description:
    "Update an address book entry. PUT /customers/{customerId}/addressbooks/{addressId}. Required: customerId, addressId. All other fields optional.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      addressId: { type: "string", description: "Address book entry ID (required)" },
      name: { type: "string", description: "Address name" },
      contactName: { type: "string", description: "Contact name" },
      street1: { type: "string", description: "Street line 1" },
      street2: { type: "string", description: "Street line 2" },
      city: { type: "string", description: "City" },
      state: { type: "string", description: "State" },
      zip: { type: "string", description: "Postal code" },
      countryId: { type: "string", description: "Country ID" },
      company: { type: "string", description: "Company name" },
      contactEmail: { type: "string", description: "Contact email" },
      contactPhone: { type: "string", description: "Contact phone" },
      type: { type: "string", description: "Address type: residential or commercial" },
    },
    required: ["customerId", "addressId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const { customerId, addressId, ...body } = parsed.data;
  return handleToolCall(() =>
    customerService.updateCustomerAddress(client, customerId, addressId, body)
  );
}

export const updateCustomerAddressTool: Tool = {
  definition,
  handler,
};
