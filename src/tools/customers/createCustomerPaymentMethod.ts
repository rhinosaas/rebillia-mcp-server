import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";

const billingAddressSchema = z.object({
  countryId: z.string().min(1, "billingAddress.countryId is required"),
  street1: z.string().min(1, "billingAddress.street1 is required"),
  city: z.string().min(1, "billingAddress.city is required"),
  state: z.string().min(1, "billingAddress.state is required"),
  zip: z.string().min(1, "billingAddress.zip is required"),
  street2: z.string().optional(),
});

const schema = z.object({
  customerId: z.string().min(1, "customerId is required"),
  companyGatewayId: z.string().min(1, "companyGatewayId is required"),
  type: z.enum(["card", "ach"], {
    errorMap: () => ({ message: "type must be 'card' or 'ach'" }),
  }),
  paymentNonce: z.string().min(1, "paymentNonce is required"),
  billingAddress: billingAddressSchema,
});

const definition = {
  name: "create_customer_payment_method",
  description:
    "Create a payment method for a customer. POST /customers/{customerId}/paymentmethods. Required: companyGatewayId, type (card or ach), paymentNonce, billingAddress (countryId, street1, city, state, zip). Sends body with paymentMethod: { nonce } and billingAddress.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      companyGatewayId: { type: "string", description: "Company gateway ID (required)" },
      type: { type: "string", description: "Payment method type (required): card or ach" },
      paymentNonce: { type: "string", description: "Payment nonce from gateway (required); sent as paymentMethod.nonce in body" },
      billingAddress: {
        type: "object",
        description: "Billing address (required): countryId, street1, city, state, zip; street2 optional",
        properties: {
          countryId: { type: "string", description: "Country ID (required)" },
          street1: { type: "string", description: "Street line 1 (required)" },
          city: { type: "string", description: "City (required)" },
          state: { type: "string", description: "State (required)" },
          zip: { type: "string", description: "Postal code (required)" },
          street2: { type: "string", description: "Street line 2" },
        },
        required: ["countryId", "street1", "city", "state", "zip"],
      },
    },
    required: ["customerId", "companyGatewayId", "type", "paymentNonce", "billingAddress"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const { customerId, companyGatewayId, type, paymentNonce, billingAddress } = parsed.data;
  return handleToolCall(() =>
    customerService.createCustomerPaymentMethod(client, customerId, {
      companyGatewayId,
      type,
      paymentNonce,
      billingAddress,
    })
  );
}

export const createCustomerPaymentMethodTool: Tool = {
  definition,
  handler,
};
