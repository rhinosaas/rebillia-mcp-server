/**
 * MCP-facing address input types: use countryCode (ISO 3166-1 alpha-2) instead of opaque countryId.
 * Mappers convert these to API payloads with countryId before calling upstream.
 */

import { resolveCountryId } from "../services/countryResolverService.js";

type Client = InstanceType<typeof import("../client.js").default>;

const COUNTRY_CODE_DESCRIPTION = "ISO 3166-1 alpha-2 country code, e.g. ES, AR, MX";

// ---------------------------------------------------------------------------
// MCP-facing input types (countryCode)
// ---------------------------------------------------------------------------

export interface AddressInput {
  countryCode: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  type: "residential" | "commercial";
  name?: string;
  contactName?: string;
  street2?: string;
  company?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface BillingAddressInput {
  countryCode: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  street2?: string;
}

export interface ShippingAddressInput {
  countryCode: string;
  street1: string;
  city: string;
  zip: string;
  contactName: string;
  type: "residential" | "commercial";
  street2?: string;
  state?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
}

// ---------------------------------------------------------------------------
// API payload types (countryId – internal)
// ---------------------------------------------------------------------------

export interface ApiAddress {
  countryId: number;
  street1: string;
  city: string;
  state: string;
  zip: string;
  type: "residential" | "commercial";
  name?: string;
  contactName?: string;
  street2?: string;
  company?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface ApiBillingAddress {
  countryId: number;
  street1: string;
  city: string;
  state: string;
  zip: string;
  street2?: string;
}

export interface ApiShippingAddress {
  countryId: number;
  street1: string;
  city: string;
  zip: string;
  contactName: string;
  type: "residential" | "commercial";
  street2?: string;
  state?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
}

// ---------------------------------------------------------------------------
// Mappers: MCP input -> API payload (resolve countryCode -> countryId)
// ---------------------------------------------------------------------------

/**
 * Map MCP address input to API address. Resolves countryCode to countryId.
 * Prefers countryCode; legacy countryId (deprecated) supported only when countryCode is missing.
 */
export async function mapAddressInputToApiAddress(
  client: Client,
  input: AddressInput | (AddressInput & { countryId?: number })
): Promise<ApiAddress> {
  const code = (input as AddressInput).countryCode?.trim();
  const legacyId = (input as { countryId?: number }).countryId;
  let countryId: number;
  if (code !== undefined && code !== "") {
    countryId = await resolveCountryId(client, code);
  } else if (typeof legacyId === "number") {
    countryId = legacyId; // deprecated: backward compat
  } else {
    throw new Error("countryCode is required");
  }

  return {
    countryId,
    street1: input.street1,
    city: input.city,
    state: input.state,
    zip: input.zip,
    type: input.type,
    name: input.name,
    contactName: input.contactName,
    street2: input.street2,
    company: input.company,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
  };
}

/**
 * Map MCP billing address input to API billing address. Resolves countryCode to countryId.
 */
export async function mapBillingAddressInputToApiBillingAddress(
  client: Client,
  input: BillingAddressInput | (BillingAddressInput & { countryId?: number })
): Promise<ApiBillingAddress> {
  const code = (input as BillingAddressInput).countryCode?.trim();
  const legacyId = (input as { countryId?: number }).countryId;
  let countryId: number;
  if (code !== undefined && code !== "") {
    countryId = await resolveCountryId(client, code);
  } else if (typeof legacyId === "number") {
    countryId = legacyId; // deprecated: backward compat
  } else {
    throw new Error("countryCode is required");
  }

  return {
    countryId,
    street1: input.street1,
    city: input.city,
    state: input.state,
    zip: input.zip,
    street2: input.street2,
  };
}

/**
 * Map MCP shipping address input to API shipping address. Resolves countryCode to countryId.
 */
export async function mapShippingAddressInputToApiShippingAddress(
  client: Client,
  input: ShippingAddressInput | (ShippingAddressInput & { countryId?: number })
): Promise<ApiShippingAddress> {
  const code = (input as ShippingAddressInput).countryCode?.trim();
  const legacyId = (input as { countryId?: number }).countryId;
  let countryId: number;
  if (code !== undefined && code !== "") {
    countryId = await resolveCountryId(client, code);
  } else if (typeof legacyId === "number") {
    countryId = legacyId; // deprecated: backward compat
  } else {
    throw new Error("countryCode is required");
  }

  return {
    countryId,
    street1: input.street1,
    city: input.city,
    zip: input.zip,
    contactName: input.contactName,
    type: input.type,
    street2: input.street2,
    state: input.state,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    contactCompany: input.contactCompany,
  };
}

export const COUNTRY_CODE_DESCRIPTION_CONST = COUNTRY_CODE_DESCRIPTION;
