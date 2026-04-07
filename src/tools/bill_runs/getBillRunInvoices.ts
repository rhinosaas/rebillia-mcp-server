import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as billRunService from "../../services/billRunServices.js";

const schema = z.object({
  billRunId: z.string().min(1, "billRunId is required"),
  pageNo: z.number().int().min(1).optional(),
  itemPerPage: z.number().int().min(1).optional(),
});

const definition = {
  name: "get_bill_run_invoices",
  description:
    "Get invoices for a bill run. GET /bill-run/{billRunId}/invoices. Returns paginated invoices. Optional: pageNo, itemPerPage.",
  inputSchema: {
    type: "object" as const,
    properties: {
      billRunId: { type: "string", description: "Bill run ID (required)" },
      pageNo: { type: "number", description: "Page number (default: 1)" },
      itemPerPage: { type: "number", description: "Items per page (default: 25)" },
    },
    required: ["billRunId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { billRunId, pageNo, itemPerPage } = parsed.data;
  return handleToolCall(() =>
    billRunService.getBillRunInvoices(client, billRunId, { pageNo, itemPerPage })
  );
}

export const getBillRunInvoicesTool: Tool = {
  definition,
  handler,
};
