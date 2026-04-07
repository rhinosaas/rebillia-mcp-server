import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { handleToolCall } from "./helpers.js";
import * as shippingService from "../../services/shippingServices.js";

const definition = {
  name: "list_shipping_services",
  description: "List shipping services. GET /shipping/services. Returns available shipping services for the company.",
  inputSchema: {
    type: "object" as const,
    properties: {},
    required: [],
  },
};

async function handler(client: Client, _args: Record<string, unknown> | undefined) {
  return handleToolCall(() => shippingService.listShippingServices(client));
}

export const listShippingServicesTool: Tool = {
  definition,
  handler,
};
