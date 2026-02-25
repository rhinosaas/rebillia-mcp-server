import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as gatewayService from "../../services/gatewayServices.js";

const schema = z.object({
  gatewayId: z.string().min(1, "gatewayId is required"),
});

const definition = {
  name: "test_gateway",
  description:
    "Test gateway connection. GET /gateways/{gatewayId}/test. Returns the gateway object with connection status (e.g. status active on success).",
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
    gatewayService.testGateway(client, parsed.data.gatewayId)
  );
}

export const testGatewayTool: Tool = {
  definition,
  handler,
};
