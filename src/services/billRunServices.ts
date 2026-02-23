/**
 * Bill Run API service – BillRunController endpoints.
 */

import type { PaginatedResponse } from "../types.js";

export type Client = InstanceType<typeof import("../client.js").default>;

export interface ListBillRunsParams {
  include?: string;
  /** Filter by status: completed, pending, error */
  query?: "completed" | "pending" | "error";
  orderBy?: string;
  sortBy?: string;
  itemPerPage?: number;
  pageNo?: number;
}

export interface UpdateBillRunBody {
  newDateTime: string;
}

/** GET /bill-run */
export async function listBillRuns(
  client: Client,
  params?: ListBillRunsParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.query) search.append("query", params.query);
  if (params?.orderBy) search.append("orderBy", params.orderBy);
  if (params?.sortBy) search.append("sortBy", params.sortBy);
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(`/bill-run${q ? `?${q}` : ""}`);
}

/** GET /bill-run/{billRunId} */
export async function getBillRun(
  client: Client,
  billRunId: string
): Promise<unknown> {
  return client.get<unknown>(`/bill-run/${billRunId}`);
}

/**
 * Normalize datetime for API: RebilliaServer may require ISO 8601 with timezone.
 * - Replaces space between date and time with "T".
 * - If no timezone (Z or ±HH:MM), appends "Z" (UTC).
 */
function normalizeDateTime(value: string): string {
  let s = value.trim();
  if (/^\d{4}-\d{2}-\d{2}\s+\d{1,2}:\d{2}(:\d{2})?/.test(s)) {
    s = s.replace(/\s+/, "T");
  }
  const hasTimezone = /[Zz]$/.test(s) || /[+-]\d{2}:?\d{2}$/.test(s);
  if (!hasTimezone && /^\d{4}-\d{2}-\d{2}T\d{1,2}:\d{2}(:\d{2})?/.test(s)) {
    s = s + "Z";
  }
  return s;
}

/** PUT /bill-run/{billRunId}. newDateTime required (schedule date/time). API expects ISO 8601 format (e.g. 2026-02-26T19:00:00). */
export async function updateBillRun(
  client: Client,
  billRunId: string,
  body: UpdateBillRunBody
): Promise<unknown> {
  const payload = { newDateTime: normalizeDateTime(body.newDateTime) };
  return client.put<unknown>(`/bill-run/${billRunId}`, payload);
}

/** GET /bill-run/{billRunId}/invoices */
export async function getBillRunInvoices(
  client: Client,
  billRunId: string
): Promise<unknown> {
  return client.get<unknown>(`/bill-run/${billRunId}/invoices`);
}
