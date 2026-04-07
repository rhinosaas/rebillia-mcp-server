import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";
import { mapAddressInputToApiAddress, COUNTRY_CODE_DESCRIPTION_CONST } from "../../types/addressInput.js";

const COUNTRY_CODE_REGEX = /^[A-Za-z]{2}$/;

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  name: z.string().min(1, "name is required"),
  contactName: z.string().min(1, "contactName is required"),
  street1: z.string().min(1, "street1 is required"),
  city: z.string().min(1, "city is required"),
  state: z.string().min(1, "state is required"),
  zip: z.string().min(1, "zip is required"),
  countryCode: z
    .string()
    .min(1, "countryCode is required")
    .transform((s) => s.trim().toUpperCase())
    .refine((s) => COUNTRY_CODE_REGEX.test(s), "countryCode must be ISO 3166-1 alpha-2 (e.g. ES, AR, MX)"),
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
    "Create an address book entry for a customer. POST /customers/{customerId}/addressbooks. Required: name, contactName, street1, city, state, zip, countryCode (ISO 3166-1 alpha-2), type (residential or commercial). Optional: street2, company, contactEmail, contactPhone.",
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
      countryCode: { type: "string", description: COUNTRY_CODE_DESCRIPTION_CONST },
      type: { type: "string", description: "Address type (required): residential or commercial" },
      street2: { type: "string", description: "Street line 2" },
      company: { type: "string", description: "Company name" },
      contactEmail: { type: "string", description: "Contact email" },
      contactPhone: { type: "string", description: "Contact phone" },
    },
    required: ["customerId", "name", "contactName", "street1", "city", "state", "zip", "countryCode", "type"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const { customerId, ...rest } = parsed.data;
  const apiAddress = await mapAddressInputToApiAddress(client, rest);
  const body = {
    ...apiAddress,
    name: parsed.data.name,
    contactName: parsed.data.contactName,
  };
  return handleToolCall(() => customerService.createCustomerAddress(client, customerId, body));
}

export const createCustomerAddressTool: Tool = {
  definition,
  handler,
};
