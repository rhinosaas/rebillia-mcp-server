/**
 * Transaction API service – TransactionController endpoints.
 */

import type { PaginatedResponse } from "../types.js";

export type Client = InstanceType<typeof import("../client.js").default>;

export interface ListTransactionsParams {
  customerId?: number;
  invoiceId?: number;
  status?:
    | "settled"
    | "authorized"
    | "declined"
    | "error"
    | "voided"
    | "requiresPaymentMethod"
    | "awaitingForSettlement"
    | "authorizeAndHold";
  type?: "sale" | "refund";
  dateFrom?: string;
  dateTo?: string;
  companyGatewayId?: number;
  orderBy?: string;
  sortBy?: string;
  itemPerPage?: number;
  pageNo?: number;
}

/** GET /transactions */
export async function listTransactions(
  client: Client,
  params?: ListTransactionsParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.customerId != null) search.append("customerId", String(params.customerId));
  if (params?.invoiceId != null) search.append("invoiceId", String(params.invoiceId));
  if (params?.status) search.append("status", params.status);
  if (params?.type) search.append("type", params.type);
  if (params?.dateFrom) search.append("dateFrom", params.dateFrom);
  if (params?.dateTo) search.append("dateTo", params.dateTo);
  if (params?.companyGatewayId != null) {
    search.append("companyGatewayId", String(params.companyGatewayId));
  }
  if (params?.orderBy) search.append("orderBy", params.orderBy);
  if (params?.sortBy) search.append("sortBy", params.sortBy);
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(`/transactions${q ? `?${q}` : ""}`);
}

/** GET /transactions/{transactionId} */
export async function getTransaction(
  client: Client,
  transactionId: string
): Promise<unknown> {
  return client.get<unknown>(`/transactions/${transactionId}`);
}

/** POST /transactions/{transactionId}/refund?amount={amount}. amount in CENTS (e.g. 250 = $2.50). Required. */
export async function refundTransaction(
  client: Client,
  transactionId: string,
  amountCents: number
): Promise<unknown> {
  const search = new URLSearchParams();
  search.append("amount", String(amountCents));
  const q = search.toString();
  return client.post<unknown>(
    `/transactions/${transactionId}/refund?${q}`,
    {}
  );
}

/** POST /transactions/{transactionId}/void. Only works before settlement. */
export async function voidTransaction(
  client: Client,
  transactionId: string
): Promise<unknown> {
  return client.post<unknown>(`/transactions/${transactionId}/void`, {});
}
