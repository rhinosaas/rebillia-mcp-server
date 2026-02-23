/**
 * Transaction API service – TransactionController endpoints.
 */

import type { PaginatedResponse } from "../types.js";

export type Client = InstanceType<typeof import("../client.js").default>;

export interface ListTransactionsParams {
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
