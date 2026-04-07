import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";
import { COUNTRY_CODE_DESCRIPTION_CONST } from "../../types/addressInput.js";
import { resolveCountryId } from "../../services/countryResolverService.js";

const COUNTRY_CODE_REGEX = /^[A-Za-z]{2}$/;

const nullableMin1String = z.string().min(1);
const countryCodeSchema = z
  .preprocess(
    (v) => (typeof v === "string" ? v.trim().toUpperCase() : v),
    z
      .string()
      .min(1)
      .refine(
        (s) => COUNTRY_CODE_REGEX.test(s),
        "countryCode must be ISO 3166-1 alpha-2 (e.g. ES, AR, MX)"
      )
  )
  .optional()
  .nullable();

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  addressId: z.string().min(1, "addressId is required"),
  street1: nullableMin1String.optional().nullable(),
  city: nullableMin1String.optional().nullable(),
  state: nullableMin1String.optional().nullable(),
  zip: nullableMin1String.optional().nullable(),
  countryCode: countryCodeSchema,
  name: nullableMin1String.optional().nullable(),
  contactName: nullableMin1String.optional().nullable(),
  street2: nullableMin1String.optional().nullable(),
  company: nullableMin1String.optional().nullable(),
  contactEmail: nullableMin1String.optional().nullable(),
  contactPhone: nullableMin1String.optional().nullable(),
  type: z.enum(["residential", "commercial"]).optional().nullable(),
});

const definition = {
  name: "update_customer_address",
  description:
    "Update an address book entry (partial update). PUT /customers/{customerId}/addressbooks/{addressId}. Only explicitly provided fields are modified; omitted fields are kept from the existing address record.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID" },
      addressId: { type: "string", description: "Address book entry ID" },
      street1: { type: "string", description: "Street line 1" },
      city: { type: "string", description: "City" },
      state: { type: "string", description: "State" },
      zip: { type: "string", description: "Postal code" },
      countryCode: { type: "string", description: COUNTRY_CODE_DESCRIPTION_CONST },
      name: { type: "string", description: "Address name" },
      contactName: { type: "string", description: "Contact name" },
      street2: { type: "string", description: "Street line 2" },
      company: { type: "string", description: "Company name" },
      contactEmail: { type: "string", description: "Contact email" },
      contactPhone: { type: "string", description: "Contact phone" },
      type: {
        type: "string",
        enum: ["residential", "commercial"],
        description: "Address type: residential or commercial",
      },
    },
    required: ["customerId", "addressId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const rawArgs = args ?? {};
  const parsed = schema.safeParse(rawArgs);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }

  const { customerId, addressId, ...incoming } = parsed.data;
  const hasField = (key: string): boolean => Object.prototype.hasOwnProperty.call(rawArgs, key);

  const existing = await customerService.getCustomerAddress(client, customerId, addressId);

  const pickOptional = <T extends string | null>(
    key: keyof typeof incoming,
    existingVal: T,
    incomingVal: T | undefined | null
  ): string | null | undefined => {
    if (hasField(String(key))) return incomingVal === undefined ? undefined : incomingVal;
    return existingVal === null ? undefined : existingVal;
  };

  const pickRequired = (
    key: "street1" | "city" | "state" | "zip",
    existingVal: string | null,
    incomingVal: string | null | undefined
  ): string | null | undefined => {
    if (hasField(key)) {
      // If explicitly provided as `null`, we allow passing it through.
      return incomingVal === undefined ? existingVal ?? undefined : incomingVal;
    }
    if (existingVal == null) {
      // Upstream expects these fields to be present for a meaningful update.
      throw new Error(`Existing address record is missing "${key}". Provide "${key}" in the update payload.`);
    }
    return existingVal;
  };

  const requiredStreet1 = pickRequired("street1", existing.street1, incoming.street1);
  const requiredCity = pickRequired("city", existing.city, incoming.city);
  const requiredState = pickRequired("state", existing.state, incoming.state);
  const requiredZip = pickRequired("zip", existing.zip, incoming.zip);

  const chosenCountryCode = (() => {
    if (hasField("countryCode")) {
      return incoming.countryCode === undefined ? existing.country.alpha2Code : incoming.countryCode;
    }
    return existing.country.alpha2Code;
  })();

  const countryId: number | null =
    chosenCountryCode === null
      ? null
      : // Re-resolve using the authoritative alpha2Code (keeps us aligned with upstream's numeric id).
        await resolveCountryId(client, chosenCountryCode);

  const chosenType = (() => {
    if (hasField("type")) {
      return incoming.type === undefined ? undefined : incoming.type;
    }
    return existing.type === "residential" || existing.type === "commercial" ? existing.type : undefined;
  })();

  const body: customerService.UpdateCustomerAddressBody = {
    street1: requiredStreet1,
    city: requiredCity,
    state: requiredState,
    zip: requiredZip,
    countryId,
  };

  const name = pickOptional("name", existing.name, incoming.name);
  if (name !== undefined) body.name = name;

  const contactName = pickOptional("contactName", existing.contactName, incoming.contactName);
  if (contactName !== undefined) body.contactName = contactName;

  const street2 = pickOptional("street2", existing.street2, incoming.street2);
  if (street2 !== undefined) body.street2 = street2;

  const company = pickOptional("company", existing.company, incoming.company);
  if (company !== undefined) body.company = company;

  const contactEmail = pickOptional("contactEmail", existing.contactEmail, incoming.contactEmail);
  if (contactEmail !== undefined) body.contactEmail = contactEmail;

  const contactPhone = pickOptional("contactPhone", existing.contactPhone, incoming.contactPhone);
  if (contactPhone !== undefined) body.contactPhone = contactPhone;

  if (chosenType !== undefined) body.type = chosenType;

  return handleToolCall(() =>
    customerService.updateCustomerAddress(client, customerId, addressId, body)
  );
}

export const updateCustomerAddressTool: Tool = {
  definition,
  handler,
};
