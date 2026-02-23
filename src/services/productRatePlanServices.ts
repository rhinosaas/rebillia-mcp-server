/**
 * Rate plan API service – ProductRateplanController endpoints.
 */

import type { PaginatedResponse } from "../types.js";

export type Client = InstanceType<typeof import("../client.js").default>;

export interface ListRatePlansParams {
  include?: string;
  orderBy?: string;
  sort?: string;
  sortBy?: string;
  pageNo?: number;
  itemPerPage?: number;
  query?: string;
  status?: string;
}

/** Create body: productId (product reference), name, type (contract|ongoing|prepaid). ProductRateplanValidator. */
export interface CreateRatePlanBody {
  /** Product reference (ID). URI: /products/{productId} */
  productId: number;
  name: string;
  type: "contract" | "ongoing" | "prepaid";
  description?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  minimumCommitment?: boolean;
  minimumCommitmentLength?: number;
  minimumCommitmentUnit?: string;
  changeStatusBasedOnCharge?: boolean;
  sourceTemplateId?: number;
  image?: string;
  productRatePlanCharge?: unknown[];
}

export interface UpdateRatePlanBody {
  name?: string;
  type?: "contract" | "ongoing" | "prepaid";
  description?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  minimumCommitment?: boolean;
  minimumCommitmentLength?: number;
  minimumCommitmentUnit?: string;
  changeStatusBasedOnCharge?: boolean;
  image?: string;
  productRatePlanCharge?: unknown[];
}

/** ProductRateplanValidator::validateStatus – published, archived, disabled, discontinue */
export type RatePlanStatus = "published" | "archived" | "disabled" | "discontinue";

export async function listRatePlans(
  client: Client,
  productId: string,
  params?: ListRatePlansParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.orderBy) search.append("orderBy", params.orderBy ?? "");
  if (params?.sort) search.append("sort", params.sort);
  if (params?.sortBy) search.append("sortBy", params.sortBy ?? "");
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params?.query) search.append("query", params.query);
  if (params?.status) search.append("status", params.status);
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(
    `/products/${productId}/product-rateplans${q ? `?${q}` : ""}`
  );
}

export async function getRatePlan(
  client: Client,
  ratePlanId: string,
  params?: { include?: string }
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  const q = search.toString();
  return client.get<unknown>(`/product-rateplans/${ratePlanId}${q ? `?${q}` : ""}`);
}

export async function createRatePlan(
  client: Client,
  body: CreateRatePlanBody
): Promise<unknown> {
  return client.post<unknown>("/product-rateplans", body);
}

export async function updateRatePlan(
  client: Client,
  ratePlanId: string,
  body: UpdateRatePlanBody
): Promise<unknown> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as UpdateRatePlanBody;
  return client.put<unknown>(
    `/product-rateplans/${ratePlanId}`,
    Object.keys(payload).length ? payload : undefined
  );
}

export async function deleteRatePlan(
  client: Client,
  ratePlanId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(
    `/product-rateplans/${ratePlanId}`
  );
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Rate plan deleted" };
}

export async function updateRatePlanStatus(
  client: Client,
  ratePlanId: string,
  status: RatePlanStatus
): Promise<unknown> {
  return client.put<unknown>(`/product-rateplans/${ratePlanId}/status`, { status });
}

export async function syncRatePlan(
  client: Client,
  ratePlanId: string
): Promise<unknown> {
  return client.post<unknown>(`/product-rateplans/${ratePlanId}/sync`, undefined);
}
