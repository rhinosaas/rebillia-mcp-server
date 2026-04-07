import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as gatewayService from "../../services/gatewayServices.js";

const schema = z.object({
  status: z.string().optional(),
  companyCurrencyId: z.string().optional(),
  include: z.string().optional(),
});

const definition = {
  name: "list_gateways",
  description:
    "List company gateways. GET /gateways. Optional: status (filter by active, disabled, error, archive), companyCurrencyId, include.",
  inputSchema: {
    type: "object" as const,
    properties: {
      status: { type: "string", description: "Filter by status (e.g. active, disabled, error, archive)" },
      companyCurrencyId: { type: "string", description: "Filter by company currency ID" },
      include: { type: "string", description: "Comma-separated attributes to include" },
    },
    required: [],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => gatewayService.listGateways(client, parsed.data));
}

export const listGatewaysTool: Tool = {
  definition,
  handler,
};
