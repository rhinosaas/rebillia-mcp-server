import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as shippingService from "../../services/shippingServices.js";

const schema = z.object({
  companyCurrencyId: z.number().int().positive("companyCurrencyId is required"),
  fromZip: z.string().min(1, "fromZip is required"),
  fromCountry: z.string().min(1, "fromCountry is required"),
  zip: z.string().min(1, "zip is required"),
  country: z.string().min(1, "country is required"),
  weight: z.number().finite("weight is required"),
  orderAmount: z.number().finite("orderAmount is required"),
  itemCount: z.number().int().min(0, "itemCount is required"),
  residential: z.boolean().optional(),
  street1: z.string().optional(),
  street2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  services: z.array(z.union([z.string(), z.number()])).optional(),
  packagingType: z.string().optional(),
});

const definition = {
  name: "calculate_shipping",
  description:
    "Calculate shipping rates. POST /shipping/calculate. Required: companyCurrencyId, fromZip, fromCountry, zip, country, weight, orderAmount, itemCount. Optional: residential, street1, street2, city, state, services, packagingType.",
  inputSchema: {
    type: "object" as const,
    properties: {
      companyCurrencyId: { type: "number", description: "Company currency ID (required)" },
      fromZip: { type: "string", description: "Origin zip (required)" },
      fromCountry: { type: "string", description: "Origin country code (required)" },
      zip: { type: "string", description: "Destination zip (required)" },
      country: { type: "string", description: "Destination country code (required)" },
      weight: { type: "number", description: "Weight (required)" },
      orderAmount: { type: "number", description: "Order amount (required)" },
      itemCount: { type: "number", description: "Item/order quantity (required)" },
      residential: { type: "boolean", description: "Residential address indicator" },
      street1: { type: "string", description: "Street line 1" },
      street2: { type: "string", description: "Street line 2" },
      city: { type: "string", description: "City" },
      state: { type: "string", description: "State" },
      services: { type: "array", description: "Service IDs to filter" },
      packagingType: { type: "string", description: "Packaging type" },
    },
    required: [
      "companyCurrencyId",
      "fromZip",
      "fromCountry",
      "zip",
      "country",
      "weight",
      "orderAmount",
      "itemCount",
    ],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const data = parsed.data;
  const body = {
    companyCurrencyId: data.companyCurrencyId,
    fromZip: data.fromZip,
    fromCountry: data.fromCountry,
    zip: data.zip,
    country: data.country,
    weight: data.weight,
    orderAmount: data.orderAmount,
    itemCount: data.itemCount,
    residential: data.residential,
    street1: data.street1,
    street2: data.street2,
    city: data.city,
    state: data.state,
    services: data.services,
    packagingType: data.packagingType,
  };
  return handleToolCall(() => shippingService.calculateShipping(client, body));
}

export const calculateShippingTool: Tool = {
  definition,
  handler,
};
