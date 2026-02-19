/**
 * Product API service – Rebillia product endpoints.
 * Tools in tools/products/* call these functions.
 */

import type { PaginatedResponse } from "../types.js";

export type Client = InstanceType<typeof import("../client.js").default>;

// ============================================================================
// Params / body types (from ProductController, ProductService, ProductValidator)
// ============================================================================

export interface ListProductsParams {
  include?: string;
  orderBy?: string;
  sortBy?: "ASC" | "DESC";
  itemPerPage?: number;
  pageNo?: number;
  filterId?: number;
  query?: string;
}

export interface CreateProductBody {
  name: string;
  category: string;
  description?: string;
  internalProductId?: string;
  sku?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
  productRatePlan?: unknown[];
}

export interface UpdateProductBody {
  name?: string;
  category?: string;
  description?: string;
  internalProductId?: string;
  sku?: string;
  effectiveStartDate?: string;
  effectiveEndDate?: string;
}

/** Product status (ProductValidator::validateStatus – published, archived, disabled) */
export type ProductStatus = "published" | "archived" | "disabled";

/** Body for link external product (ProductService::createExternalProduct) */
export interface LinkExternalProductBody {
  companyIntegrationId: number;
  productId: string;
  settings: { modifierDisplayName: string; [k: string]: unknown };
  displayStyle?: string;
  required?: boolean;
  defaultRatePlan?: string;
  modifierDiscountRules?: unknown;
}

// ============================================================================
// Products
// ============================================================================

export async function listProducts(
  client: Client,
  params?: ListProductsParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.orderBy) search.append("orderBy", params.orderBy);
  if (params?.sortBy) search.append("sortBy", params.sortBy);
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  if (params?.filterId != null) search.append("filterId", String(params.filterId));
  if (params?.query) search.append("query", params.query);
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(`/products${q ? `?${q}` : ""}`);
}

export async function getProduct(
  client: Client,
  productId: string,
  params?: { include?: string }
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  const q = search.toString();
  return client.get<unknown>(`/products/${productId}${q ? `?${q}` : ""}`);
}

export async function createProduct(
  client: Client,
  body: CreateProductBody
): Promise<unknown> {
  const payload = {
    name: body.name,
    category: body.category,
    description: body.description,
    internalProductId: body.internalProductId,
    sku: body.sku,
    effectiveStartDate: body.effectiveStartDate,
    effectiveEndDate: body.effectiveEndDate,
    productRatePlan: body.productRatePlan ?? [],
  };
  return client.post<unknown>("/products", payload);
}

export async function updateProduct(
  client: Client,
  productId: string,
  body: UpdateProductBody
): Promise<unknown> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as UpdateProductBody;
  return client.put<unknown>(`/products/${productId}`, Object.keys(payload).length ? payload : undefined);
}

export async function deleteProduct(
  client: Client,
  productId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(`/products/${productId}`);
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Product deleted" };
}

export async function updateProductStatus(
  client: Client,
  productId: string,
  status: ProductStatus
): Promise<unknown> {
  return client.put<unknown>(`/products/${productId}/status`, { status });
}

export async function linkExternalProduct(
  client: Client,
  productId: string,
  body: LinkExternalProductBody
): Promise<unknown> {
  return client.post<unknown>(`/products/${productId}/external-products`, body);
}

export async function unlinkExternalProduct(
  client: Client,
  productId: string,
  externalProductId: string
): Promise<unknown> {
  return client.delete<unknown>(`/products/${productId}/external-products/${externalProductId}`);
}
