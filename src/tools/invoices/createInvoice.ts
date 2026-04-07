import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as invoiceService from "../../services/invoiceServices.js";
import { mapShippingAddressInputToApiShippingAddress } from "../../types/addressInput.js";
import { COUNTRY_CODE_DESCRIPTION_CONST } from "../../types/addressInput.js";

/** MCP-facing address: countryCode (ISO 3166-1 alpha-2). When provided, contactName, street1, city, zip, countryCode, type required. */
const addressSchema = z.object({
  street1: z.string().min(1, "street1 is required"),
  city: z.string().min(1, "city is required"),
  zip: z.string().min(1, "zip is required"),
  countryCode: z.string().min(1, "countryCode is required"),
  contactName: z.string().min(1, "contactName is required"),
  type: z.enum(["residential", "commercial"]),
  street2: z.string().optional(),
  state: z.string().optional(),
  contactEmail: z.string().optional(),
  contactPhone: z.string().optional(),
  contactCompany: z.string().optional(),
});

/** Strip empty address object so we don't require fields when user sends shippingAddress: {}. */
function stripEmptyAddress(val: unknown): unknown {
  if (val && typeof val === "object" && !Array.isArray(val) && Object.keys(val as object).length === 0) return undefined;
  return val;
}

function moneyStringToCents(input: string): number {
  const s = input.trim();
  // If there's a decimal separator, treat as dollars with up to 2 decimals.
  if (s.includes(".")) {
    if (!/^\d+(\.\d{1,2})$/.test(s)) {
      throw new Error(
        `Invalid amount string "${input}". Expected a number like "41.00" (up to 2 decimals).`
      );
    }
    const [whole, frac] = s.split(".");
    const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
    return cents;
  }
  // No decimal point: treat as already-in-cents (backward compatibility with old behavior).
  if (!/^\d+$/.test(s)) {
    throw new Error(`Invalid amount string "${input}". Expected "41.00" or integer cents like "4100".`);
  }
  return Number(s);
}

function normalizeAmountToCents(amount: unknown): number {
  if (typeof amount === "number") {
    if (!Number.isInteger(amount) || amount < 0) throw new Error("amount must be a non-negative integer (cents)");
    return amount;
  }
  if (typeof amount === "string") {
    return moneyStringToCents(amount);
  }
  throw new Error("amount must be a number (cents) or string (e.g. '41.00' or '4100')");
}

/** Line item: amount as string dollars (e.g. '20.00') or number cents (e.g. 2000). */
const detailItemSchema = z.object({
  amount: z.union([
    z.string().min(1, "amount must be a non-empty string (e.g. '41.00' or '4100')"),
    z.number().int().min(0, "amount must be a non-negative integer cents"),
  ]),
  description: z.string().max(255).optional(),
  qty: z.number().int().min(1).optional(),
});

const paymentTypeEnum = ["offlinePaymentProvider", "thirdPartyPaymentProvider", "walletPaymentProvider", "otherPayment"] as const;

const schema = z
  .object({
  companyCurrencyId: z.number().int().positive("companyCurrencyId is required"),
  companyGatewayId: z.number().int().positive("companyGatewayId is required"),
  customerId: z.number().int().positive("customerId is required"),
  paymentMethodId: z.number().int().positive("paymentMethodId is required"),
  detail: z.array(detailItemSchema).min(1, "detail must have at least one line item"),
  customerEmail: z.string().max(45).optional(),
  customerName: z.string().max(45).optional(),
  customerPhone: z.string().max(45).optional(),
  customerPaymentMethodId: z.number().int().optional(),
  paymentType: z.enum(paymentTypeEnum).optional(),
    dateDue: z
      .string({ required_error: "dateDue is required" })
      .min(1, "dateDue is required"),
    dateFrom: z
      .string({ required_error: "dateFrom is required" })
      .min(1, "dateFrom is required"),
    dateTo: z
      .string({ required_error: "dateTo is required" })
      .min(1, "dateTo is required"),
  billingAddress: z.preprocess(stripEmptyAddress, addressSchema.optional()),
  shippingAddress: z.preprocess(stripEmptyAddress, addressSchema.optional()),
  shippingAmount: z.number().int().min(0).optional(),
  terms: z.string().max(200).optional(),
  comments: z.string().max(200).optional(),
  });

const definition = {
  name: "create_invoice",
  description:
    "Create an invoice. POST /invoices. Required: companyCurrencyId, companyGatewayId, customerId, paymentMethodId, detail (array, at least one line item), dateDue, dateFrom, dateTo. Optional: billingAddress, shippingAddress (when provided: contactName, street1, city, zip, countryCode (ISO 3166-1 alpha-2), type residential|commercial), customerEmail (max 45), customerName (max 45), customerPhone (max 45), paymentType (offlinePaymentProvider|thirdPartyPaymentProvider|walletPaymentProvider|otherPayment), shippingAmount (CENTS), terms (max 200), comments (max 200). Detail: amount can be '41.00' (dollars) or 4100 (cents). Tool always sends cents to publicAPI.",
  inputSchema: {
    type: "object" as const,
    properties: {
      companyCurrencyId: { type: "number", description: "Company currency ID (required)" },
      companyGatewayId: { type: "number", description: "Company gateway ID (required)" },
      detail: {
        type: "array",
        description: "Line items (required, at least one). Each: amount as '41.00' (dollars) or 4100 (cents). Tool always sends cents to publicAPI. description (max 255), qty",
      },
      customerId: { type: "number", description: "Customer ID (required)" },
      customerEmail: { type: "string", description: "Customer email (max 45)" },
      customerName: { type: "string", description: "Customer name (max 45)" },
      customerPhone: { type: "string", description: "Customer phone (max 45)" },
      paymentMethodId: { type: "number", description: "Payment method ID (required)" },
      customerPaymentMethodId: { type: "number", description: "Customer payment method ID" },
      paymentType: {
        type: "string",
        description: "offlinePaymentProvider, thirdPartyPaymentProvider, walletPaymentProvider, or otherPayment",
      },
      dateDue: {
        type: "string",
        description: "Due date (valid date). Required.",
      },
      dateFrom: {
        type: "string",
        description: "Period from (valid date). Required.",
      },
      dateTo: {
        type: "string",
        description: "Period to (valid date). Required.",
      },
      billingAddress: {
        type: "object",
        description: `Optional. If provided: contactName, street1, city, zip, countryCode (${COUNTRY_CODE_DESCRIPTION_CONST}), type (residential|commercial)`,
      },
      shippingAddress: {
        type: "object",
        description: "Optional. Same shape as billingAddress",
      },
      shippingAmount: { type: "number", description: "Shipping amount in CENTS" },
      terms: { type: "string", description: "Terms (max 200)" },
      comments: { type: "string", description: "Comments (max 200)" },
    },
    required: [
      "companyCurrencyId",
      "companyGatewayId",
      "customerId",
      "paymentMethodId",
      "dateDue",
      "dateFrom",
      "dateTo",
      "detail",
    ],
  },
};

function formatValidationErrors(err: z.ZodError): string {
  return err.errors
    .map((e) => {
      const path = e.path.length ? e.path.join(".") : "body";
      return `${path}: ${e.message}`;
    })
    .join(". ");
}

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(formatValidationErrors(parsed.error));
  }
  const raw = parsed.data;
  const { customerPaymentMethodId: _customerPaymentMethodId, ...rest } = raw;
  const detail = raw.detail.map((item) => ({
    ...item,
    amount: normalizeAmountToCents(item.amount),
  }));

  let billingAddress: invoiceService.InvoiceAddressInput | undefined;
  let shippingAddress: invoiceService.InvoiceAddressInput | undefined;
  if (raw.billingAddress) {
    billingAddress = await mapShippingAddressInputToApiShippingAddress(client, raw.billingAddress);
  }
  if (raw.shippingAddress) {
    shippingAddress = await mapShippingAddressInputToApiShippingAddress(client, raw.shippingAddress);
  }

  const body: invoiceService.CreateInvoiceBody = {
    ...rest,
    detail,
    billingAddress,
    shippingAddress,
  };
  return handleToolCall(() => invoiceService.createInvoice(client, body));
}

export const createInvoiceTool: Tool = {
  definition,
  handler,
};
