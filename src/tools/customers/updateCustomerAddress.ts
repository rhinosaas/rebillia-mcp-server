import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";
import { mapAddressInputToApiAddress } from "../../types/addressInput.js";
import { COUNTRY_CODE_DESCRIPTION_CONST } from "../../types/addressInput.js";

const COUNTRY_CODE_REGEX = /^[A-Za-z]{2}$/;

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  addressId: z.string().min(1, "addressId is required"),
  street1: z.string().min(1, "street1 is required"),
  city: z.string().min(1, "city is required"),
  state: z.string().min(1, "state is required"),
  zip: z.string().min(1, "zip is required"),
  countryCode: z
    .string()
    .min(1, "countryCode is required")
    .transform((s) => s.trim().toUpperCase())
    .refine((s) => COUNTRY_CODE_REGEX.test(s), "countryCode must be ISO 3166-1 alpha-2 (e.g. ES, AR, MX)"),
  name: z.string().min(1).optional(),
  contactName: z.string().min(1).optional(),
  street2: z.string().optional(),
  company: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  type: z.enum(["residential", "commercial"]).optional(),
});

const definition = {
  name: "update_customer_address",
  description:
    "Update an address book entry. PUT /customers/{customerId}/addressbooks/{addressId}. Required: customerId, addressId, street1, city, state, zip, countryCode (ISO 3166-1 alpha-2). Optional: name, contactName, street2, company, contactEmail, contactPhone, type (residential|commercial).",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      addressId: { type: "string", description: "Address book entry ID (required)" },
      street1: { type: "string", description: "Street line 1 (required)" },
      city: { type: "string", description: "City (required)" },
      state: { type: "string", description: "State (required)" },
      zip: { type: "string", description: "Postal code (required)" },
      countryCode: { type: "string", description: COUNTRY_CODE_DESCRIPTION_CONST },
      name: { type: "string", description: "Address name" },
      contactName: { type: "string", description: "Contact name" },
      street2: { type: "string", description: "Street line 2" },
      company: { type: "string", description: "Company name" },
      contactEmail: { type: "string", description: "Contact email" },
      contactPhone: { type: "string", description: "Contact phone" },
      type: { type: "string", description: "Address type: residential or commercial" },
    },
    required: ["customerId", "addressId", "street1", "city", "state", "zip", "countryCode"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const { customerId, addressId, ...rest } = parsed.data;
  const apiAddress = await mapAddressInputToApiAddress(client, { ...rest, type: rest.type ?? "residential" });
  const body: customerService.UpdateCustomerAddressBody = {
    street1: apiAddress.street1,
    city: apiAddress.city,
    state: apiAddress.state,
    zip: apiAddress.zip,
    countryId: apiAddress.countryId,
    name: rest.name,
    contactName: rest.contactName,
    street2: rest.street2,
    company: rest.company,
    contactEmail: rest.contactEmail,
    contactPhone: rest.contactPhone,
    type: rest.type,
  };
  return handleToolCall(() =>
    customerService.updateCustomerAddress(client, customerId, addressId, body)
  );
}

export const updateCustomerAddressTool: Tool = {
  definition,
  handler,
};
