import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as invoiceService from "../../services/invoiceServices.js";

/** Aligned with RebilliaServer AddressValidator: when address provided, contactName, street1, city, zip, countryId, type required. Empty object is treated as omitted. */
const addressSchema = z
  .object({
    street1: z.string().min(1, "street1 is required"),
    city: z.string().min(1, "city is required"),
    zip: z.string().min(1, "zip is required"),
    countryId: z.string().min(1, "countryId is required"),
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

/** Line item: amount as string (e.g. '20.00') or number (cents, e.g. 3000 → '30.00'). */
const detailItemSchema = z.object({
  amount: z.union([
    z.string().min(1, "amount must be a non-empty string (e.g. '20.00') or number (cents, e.g. 3000 for $30.00)"),
    z.number().int().min(0),
  ]),
  description: z.string().max(255).optional(),
  qty: z.number().int().min(1).optional(),
});

const paymentTypeEnum = ["offlinePaymentProvider", "thirdPartyPaymentProvider", "walletPaymentProvider", "otherPayment"] as const;

const schema = z.object({
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
  dateDue: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  billingAddress: z.preprocess(stripEmptyAddress, addressSchema.optional()),
  shippingAddress: z.preprocess(stripEmptyAddress, addressSchema.optional()),
  shippingAmount: z.number().int().min(0).optional(),
  terms: z.string().max(200).optional(),
  comments: z.string().max(200).optional(),
});

const definition = {
  name: "create_invoice",
  description:
    "Create an invoice. POST /invoices. Required: companyCurrencyId, companyGatewayId, customerId, paymentMethodId, detail (array, at least one line item). Optional: billingAddress, shippingAddress (when provided: contactName, street1, city, zip, countryId, type residential|commercial), customerEmail (max 45), customerName (max 45), customerPhone (max 45), paymentType (offlinePaymentProvider|thirdPartyPaymentProvider|walletPaymentProvider|otherPayment), dateDue, dateFrom, dateTo, shippingAmount (CENTS), terms (max 200), comments (max 200). Detail: amount as string '20.00' or number in cents (3000 = $30), description (max 255), qty. Omit shippingAddress or send full address; empty {} is ignored.",
  inputSchema: {
    type: "object" as const,
    properties: {
      companyCurrencyId: { type: "number", description: "Company currency ID (required)" },
      companyGatewayId: { type: "number", description: "Company gateway ID (required)" },
      detail: {
        type: "array",
        description: "Line items (required, at least one). Each: amount as string '20.00' or number in cents (3000 = $30), description (max 255), qty",
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
      dateDue: { type: "string", description: "Due date (valid date)" },
      dateFrom: { type: "string", description: "Period from (valid date)" },
      dateTo: { type: "string", description: "Period to (valid date)" },
      billingAddress: {
        type: "object",
        description: "Optional. If provided: contactName, street1, city, zip, countryId, type (residential|commercial)",
      },
      shippingAddress: {
        type: "object",
        description: "Optional. Same shape as billingAddress",
      },
      shippingAmount: { type: "number", description: "Shipping amount in CENTS" },
      terms: { type: "string", description: "Terms (max 200)" },
      comments: { type: "string", description: "Comments (max 200)" },
    },
    required: ["companyCurrencyId", "companyGatewayId", "customerId", "paymentMethodId", "detail"],
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
  const body = {
    ...raw,
    detail: raw.detail.map((item) => ({
      ...item,
      amount: typeof item.amount === "number" ? (item.amount / 100).toFixed(2) : item.amount,
    })),
  };
  return handleToolCall(() => invoiceService.createInvoice(client, body));
}

export const createInvoiceTool: Tool = {
  definition,
  handler,
};
