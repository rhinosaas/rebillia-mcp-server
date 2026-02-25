import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import { INTEGRATION_KEY_NAMES } from "./constants.js";
import * as integrationService from "../../services/integrationServices.js";

const schema = z.object({
  keyName: z.enum(INTEGRATION_KEY_NAMES, {
    errorMap: () => ({ message: "keyName must be a valid integration key" }),
  }),
});

const keyNamesDesc = INTEGRATION_KEY_NAMES.join(", ");

const definition = {
  name: "list_integrations_by_key",
  description: `List company integrations by key name. GET /integrations/{keyName}/list. keyName: ${keyNamesDesc}.`,
  inputSchema: {
    type: "object" as const,
    properties: {
      keyName: {
        type: "string",
        description: `Integration key name (required). One of: ${keyNamesDesc}`,
      },
    },
    required: ["keyName"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() =>
    integrationService.listIntegrationsByKey(client, parsed.data.keyName)
  );
}

export const listIntegrationsByKeyTool: Tool = {
  definition,
  handler,
};
