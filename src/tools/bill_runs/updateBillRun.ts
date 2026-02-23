import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as billRunService from "../../services/billRunServices.js";

const schema = z.object({
  billRunId: z.string().min(1, "billRunId is required"),
  newDateTime: z.string().min(1, "newDateTime is required"),
});

const definition = {
  name: "update_bill_run",
  description:
    "Update a bill run. PUT /bill-run/{billRunId}. Required: billRunId, newDateTime. Use ISO 8601: YYYY-MM-DDTHH:MM:SS or with timezone (e.g. 2026-02-26T20:05:00Z). If no timezone, Z (UTC) is appended.",
  inputSchema: {
    type: "object" as const,
    properties: {
      billRunId: { type: "string", description: "Bill run ID (required)" },
      newDateTime: {
        type: "string",
        description: "New date/time for schedule (required). ISO 8601, e.g. 2026-02-26T20:05:00 or 2026-02-26T20:05:00Z. Without timezone, Z is added.",
      },
    },
    required: ["billRunId", "newDateTime"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { billRunId, newDateTime } = parsed.data;
  return handleToolCall(() =>
    billRunService.updateBillRun(client, billRunId, { newDateTime })
  );
}

export const updateBillRunTool: Tool = {
  definition,
  handler,
};
