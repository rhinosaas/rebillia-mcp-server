import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as billRunService from "../../services/billRunServices.js";

const schema = z.object({
  billRunId: z.string().min(1, "billRunId is required"),
});

const definition = {
  name: "get_bill_run_invoices",
  description: "Get invoices for a bill run. GET /bill-run/{billRunId}/invoices.",
  inputSchema: {
    type: "object" as const,
    properties: {
      billRunId: { type: "string", description: "Bill run ID (required)" },
    },
    required: ["billRunId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() =>
    billRunService.getBillRunInvoices(client, parsed.data.billRunId)
  );
}

export const getBillRunInvoicesTool: Tool = {
  definition,
  handler,
};
