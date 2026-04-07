import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as gatewayService from "../../services/gatewayServices.js";

const settingSchema = z.record(z.union([z.string(), z.number(), z.boolean()])).optional();

const schema = z.object({
  gatewayId: z.string().min(1, "gatewayId is required"),
  displayName: z.string().optional(),
  setting: settingSchema,
});

const definition = {
  name: "update_gateway",
  description:
    "Update a company gateway. PUT /gateways/{gatewayId}. Optional: displayName, setting (credentials key-value object).",
  inputSchema: {
    type: "object" as const,
    properties: {
      gatewayId: { type: "string", description: "Gateway ID (required)" },
      displayName: { type: "string", description: "Display name" },
      setting: {
        type: "object",
        description: "Credentials object (key-value). Keys depend on gateway type.",
      },
    },
    required: ["gatewayId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { gatewayId, displayName, setting } = parsed.data;
  const body = { displayName, setting };
  return handleToolCall(() => gatewayService.updateGateway(client, gatewayId, body));
}

export const updateGatewayTool: Tool = {
  definition,
  handler,
};
