import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as subscriptionService from "../../services/subscriptionServices.js";

const schema = z.object({
  subscriptionId: z.string().min(1, "subscriptionId is required"),
  include: z.string().optional(),
  pageNo: z.number().int().min(1).optional(),
  itemPerPage: z.number().int().min(1).optional(),
});

const definition = {
  name: "get_subscription_invoices",
  description:
    "List invoices for a subscription. GET /subscriptions/{subscriptionId}/invoices. Returns paginated invoices. Use include for line-item detail and transactions (e.g. include=detail,transactions).",
  inputSchema: {
    type: "object" as const,
    properties: {
      subscriptionId: { type: "string", description: "Subscription ID (required)" },
      include: {
        type: "string",
        description: "Comma-separated: detail, transactions, billruns, externalInvoices",
      },
      pageNo: { type: "number", description: "Page number (default: 1)" },
      itemPerPage: { type: "number", description: "Items per page (default: 25)" },
    },
    required: ["subscriptionId"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const { subscriptionId, include, pageNo, itemPerPage } = parsed.data;
  return handleToolCall(() =>
    subscriptionService.getSubscriptionInvoices(client, subscriptionId, {
      include,
      pageNo,
      itemPerPage,
    })
  );
}

export const getSubscriptionInvoicesTool: Tool = {
  definition,
  handler,
};
