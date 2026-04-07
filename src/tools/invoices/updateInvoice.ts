import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as invoiceService from "../../services/invoiceServices.js";
import { mapShippingAddressInputToApiShippingAddress } from "../../types/addressInput.js";
import { COUNTRY_CODE_DESCRIPTION_CONST } from "../../types/addressInput.js";

/** MCP-facing shipping address: countryCode (ISO 3166-1 alpha-2). When provided: contactName, street1, city, zip, countryCode, type. */
const addressSchema = z.object({
  street1: z.string().min(1),
  city: z.string().min(1),
  zip: z.string().min(1),
  countryCode: z.string().min(1),
  contactName: z.string().min(1),
  type: z.enum(["residential", "commercial"]),
  street2: z.string().optional(),
  state: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  contactCompany: z.string().optional(),
});

function moneyStringToCents(input: string): number {
  const s = input.trim();
  if (s.includes(".")) {
    if (!/^\d+(\.\d{1,2})$/.test(s)) {
      throw new Error(`Invalid amount string "${input}". Expected "41.00" (up to 2 decimals).`);
    }
    const [whole, frac] = s.split(".");
    return Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  }
  if (!/^\d+$/.test(s)) {
    throw new Error(`Invalid amount string "${input}". Expected "41.00" or integer cents like "4100".`);
  }
  return Number(s);
}

function normalizeAmountToCents(amount: unknown): number {
  if (typeof amount === "number") {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new Error("amount must be a non-negative integer (cents)");
    }
    return amount;
  }
  if (typeof amount === "string") {
    return moneyStringToCents(amount);
  }
  throw new Error("amount must be a number (cents) or string (e.g. '41.00' or '4100')");
}

const detailItemSchema = z.object({
  amount: z.union([
    z.string().min(1, "amount must be a non-empty string (e.g. '41.00' or '4100')"),
    z.number().int().min(0, "amount must be a non-negative integer cents"),
  ]),
  description: z.string().max(255).optional(),
  qty: z.number().int().optional(),
});

const paymentTypeEnum = ["offlinePaymentProvider", "thirdPartyPaymentProvider", "walletPaymentProvider"] as const;

const schema = z.object({
  invoiceId: z.string().min(1, "invoiceId is required"),
  companyGatewayId: z.number().int().positive().optional(),
  customerId: z.number().int().positive().optional(),
  customerEmail: z.string().max(45).optional(),
  customerName: z.string().max(45).optional(),
  customerPhone: z.string().max(45).optional(),
  customerPaymentMethodId: z.number().int().optional(),
  dateDue: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  comments: z.string().optional(),
  paymentType: z.enum(paymentTypeEnum).optional(),
  paymentMethodId: z.number().int().optional(),
  shippingAddress: addressSchema.optional(),
  shippingAmount: z.number().int().min(0).optional(),
  shippingServiceId: z.string().optional(),
  detail: z.array(detailItemSchema).optional(),
});

const definition = {
  name: "update_invoice",
  description:
    "Update an invoice. PUT /invoices/{invoiceId}. Only invoices with status 'posted' or 'requestPayment' can be updated. All body fields optional. Accepted: companyGatewayId, customerId, customerEmail, customerName, customerPhone (max 45), customerPaymentMethodId, dateDue, dateFrom, dateTo, comments, paymentType (offlinePaymentProvider|thirdPartyPaymentProvider|walletPaymentProvider), paymentMethodId, shippingAddress (when provided: contactName, street1, city, zip, countryCode (ISO 3166-1 alpha-2), type residential|commercial), shippingAmount (cents), shippingServiceId, detail (line items: amount as '41.00' dollars or 4100 cents; tool sends cents). Note: billingAddress is not accepted on update. Invoice must have customer and customerPaymentMethod set to avoid server error.",
  inputSchema: {
    type: "object" as const,
    properties: {
      invoiceId: { type: "string", description: "Invoice ID (required)" },
      companyGatewayId: { type: "number", description: "Company gateway ID" },
      customerId: { type: "number", description: "Customer ID" },
      customerEmail: { type: "string", description: "Customer email (max 45)" },
      customerName: { type: "string", description: "Customer name (max 45)" },
      customerPhone: { type: "string", description: "Customer phone (max 45)" },
      customerPaymentMethodId: { type: "number", description: "Customer payment method ID" },
      dateDue: { type: "string", description: "Due date (valid date)" },
      dateFrom: { type: "string", description: "Period from (valid date)" },
      dateTo: { type: "string", description: "Period to (valid date)" },
      comments: { type: "string", description: "Comments" },
      paymentType: {
        type: "string",
        description: "offlinePaymentProvider, thirdPartyPaymentProvider, or walletPaymentProvider",
      },
      paymentMethodId: { type: "number", description: "Payment method ID" },
      shippingAddress: {
        type: "object",
        description: `When provided: contactName, street1, city, zip, countryCode (${COUNTRY_CODE_DESCRIPTION_CONST}), type (residential|commercial)`,
      },
      shippingAmount: { type: "number", description: "Shipping amount in CENTS" },
      shippingServiceId: { type: "string", description: "Shipping service ID" },
      detail: {
        type: "array",
        description: "Line items: each { amount: '41.00' (dollars) or 4100 (cents), description?, qty? }",
      },
    },
    required: ["invoiceId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { invoiceId, shippingAddress: rawShipping, ...rest } = parsed.data;
  let shippingAddress: invoiceService.InvoiceAddressInput | undefined;
  if (rawShipping) {
    shippingAddress = await mapShippingAddressInputToApiShippingAddress(client, rawShipping);
  }
  const detail = rest.detail
    ? rest.detail.map((item) => ({
        ...item,
        amount: normalizeAmountToCents(item.amount),
      }))
    : undefined;

  const body: invoiceService.UpdateInvoiceBody = {
    ...rest,
    detail,
    shippingAddress,
  };
  return handleToolCall(() => invoiceService.updateInvoice(client, invoiceId, body));
}

export const updateInvoiceTool: Tool = {
  definition,
  handler,
};
