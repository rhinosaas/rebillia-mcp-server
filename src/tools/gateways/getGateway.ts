import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as gatewayService from "../../services/gatewayServices.js";

const schema = z.object({
  gatewayId: z.string().min(1, "gatewayId is required"),
});

const definition = {
  name: "get_gateway",
  description: "Get a company gateway by ID. GET /gateways/{gatewayId}.",
  inputSchema: {
    type: "object" as const,
    properties: {
      gatewayId: { type: "string", description: "Gateway ID (required)" },
    },
    required: ["gatewayId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() =>
    gatewayService.getGateway(client, parsed.data.gatewayId)
  );
}

export const getGatewayTool: Tool = {
  definition,
  handler,
};
