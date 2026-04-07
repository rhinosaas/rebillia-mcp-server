import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as integrationService from "../../services/integrationServices.js";

const schema = z.object({
  integrationId: z.string().min(1, "integrationId is required (company integration ID)"),
});

const definition = {
  name: "get_integration_config",
  description: "Get company integration config by ID. GET /integrations/{integrationId}/config.",
  inputSchema: {
    type: "object" as const,
    properties: {
      integrationId: { type: "string", description: "Company integration ID (required)" },
    },
    required: ["integrationId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() =>
    integrationService.getIntegrationConfig(client, parsed.data.integrationId)
  );
}

export const getIntegrationConfigTool: Tool = {
  definition,
  handler,
};
