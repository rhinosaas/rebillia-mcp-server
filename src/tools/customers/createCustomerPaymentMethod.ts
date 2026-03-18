import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as customerService from "../../services/customerServices.js";
import { mapBillingAddressInputToApiBillingAddress } from "../../types/addressInput.js";
import { COUNTRY_CODE_DESCRIPTION_CONST } from "../../types/addressInput.js";

const billingAddressSchema = z.object({
  countryCode: z.string().min(1, "billingAddress.countryCode is required"),
  street1: z.string().min(1, "billingAddress.street1 is required"),
  city: z.string().min(1, "billingAddress.city is required"),
  state: z.string().min(1, "billingAddress.state is required"),
  zip: z.string().min(1, "billingAddress.zip is required"),
  street2: z.string().optional(),
});

// Public MCP field is paymentMethodNonce only; paymentNonce kept for backward compat (internal only).
const schema = z
  .object({
    customerId: z.string().min(1, "customerId is required"),
    companyGatewayId: z.string().min(1, "companyGatewayId is required"),
    type: z.enum(["card", "ach"], {
      errorMap: () => ({ message: "type must be 'card' or 'ach'" }),
    }),
    paymentMethodNonce: z.string().optional(),
    paymentNonce: z.string().optional(), // deprecated: use paymentMethodNonce
    billingAddress: billingAddressSchema,
  })
  .refine(
    (data) => (data.paymentMethodNonce?.trim() ?? data.paymentNonce?.trim() ?? "").length > 0,
    { message: "paymentMethodNonce is required" }
  );

const PAYMENT_METHOD_NONCE_DESCRIPTION =
  "Single-use token from your payment integration. Obtain gateway client credential via get_client_token, then use your hosted payment UI to produce this token. Do not send raw card data. Gateway-specific tokenization is handled outside MCP.";

const definition = {
  name: "create_customer_payment_method",
  description:
    "Create a payment method for a customer. Gateway-agnostic: required companyGatewayId, type (card or ach), paymentMethodNonce, billingAddress (countryCode, street1, city, state, zip). Obtain gateway client credential via get_client_token; use your payment integration to produce paymentMethodNonce, then call this tool. No raw card data or gateway-specific fields in MCP.",
  inputSchema: {
    type: "object" as const,
    properties: {
      customerId: { type: "string", description: "Customer ID (required)" },
      companyGatewayId: { type: "string", description: "Company gateway ID (required)" },
      type: { type: "string", description: "Payment method type (required): card or ach" },
      paymentMethodNonce: {
        type: "string",
        description: PAYMENT_METHOD_NONCE_DESCRIPTION,
      },
      billingAddress: {
        type: "object",
        description: "Billing address (required): countryCode, street1, city, state, zip; street2 optional",
        properties: {
          countryCode: { type: "string", description: COUNTRY_CODE_DESCRIPTION_CONST },
          street1: { type: "string", description: "Street line 1 (required)" },
          city: { type: "string", description: "City (required)" },
          state: { type: "string", description: "State (required)" },
          zip: { type: "string", description: "Postal code (required)" },
          street2: { type: "string", description: "Street line 2" },
        },
        required: ["countryCode", "street1", "city", "state", "zip"],
      },
    },
    required: ["customerId", "companyGatewayId", "type", "paymentMethodNonce", "billingAddress"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const { customerId, companyGatewayId, type, billingAddress } = parsed.data;
  const nonce = (parsed.data.paymentMethodNonce ?? parsed.data.paymentNonce)?.trim();
  if (!nonce) {
    return errorResult("paymentMethodNonce is required");
  }
  const apiBillingAddress = await mapBillingAddressInputToApiBillingAddress(client, billingAddress);
  return handleToolCall(() =>
    customerService.createCustomerPaymentMethod(client, customerId, {
      companyGatewayId,
      type,
      paymentNonce: nonce, // internal: upstream expects paymentMethod: { nonce }
      billingAddress: apiBillingAddress,
    })
  );
}

export const createCustomerPaymentMethodTool: Tool = {
  definition,
  handler,
};
