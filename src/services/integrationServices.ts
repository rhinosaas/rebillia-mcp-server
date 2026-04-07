/**
 * Company Integration API service – PublicAPI IntegrationController endpoints.
 * Routes: /v1/integrations (base URL from client includes /v1).
 */

export type Client = InstanceType<typeof import("../client.js").default>;

/** Integration types (filter for list). */
export type IntegrationType =
  | "ecommerce"
  | "email"
  | "marketing"
  | "tax"
  | "shipping"
  | "accounting"
  | "chat";

export interface ListIntegrationsParams {
  /** Filter by integration type */
  type?: IntegrationType;
  include?: string;
  itemPerPage?: number;
  pageNo?: number;
}

export interface ListExternalInvoicesParams {
  include?: string;
  itemPerPage?: number;
  pageNo?: number;
}

export interface ListExternalProductsParams {
  /** Optional product name filter */
  name?: string;
}

/** GET /integrations. Optional type filter (ecommerce, email, marketing, tax, shipping, accounting, chat). */
export async function listIntegrations(
  client: Client,
  params?: ListIntegrationsParams
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.type) search.append("type", params.type);
  if (params?.include) search.append("include", params.include);
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  const q = search.toString();
  return client.get<unknown>(`/integrations${q ? `?${q}` : ""}`);
}

/** GET /integrations/{integrationId}/config – company integration config by ID. */
export async function getIntegrationConfig(
  client: Client,
  integrationId: string
): Promise<unknown> {
  return client.get<unknown>(`/integrations/${integrationId}/config`);
}

/** GET /integrations/{keyName}/get – global integration info by key name. */
export async function getIntegrationByKey(
  client: Client,
  keyName: string
): Promise<unknown> {
  return client.get<unknown>(`/integrations/${encodeURIComponent(keyName)}/get`);
}

/** GET /integrations/{keyName}/list – list company integrations by key name. */
export async function listIntegrationsByKey(
  client: Client,
  keyName: string
): Promise<unknown> {
  return client.get<unknown>(`/integrations/${encodeURIComponent(keyName)}/list`);
}

/** GET /integrations/{integrationId}/external-invoices */
export async function listExternalInvoices(
  client: Client,
  integrationId: string,
  params?: ListExternalInvoicesParams
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  const q = search.toString();
  return client.get<unknown>(`/integrations/${integrationId}/external-invoices${q ? `?${q}` : ""}`);
}

/** GET /integrations/{integrationId}/products. Optional name filter. */
export async function listExternalProducts(
  client: Client,
  integrationId: string,
  params?: ListExternalProductsParams
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.name) search.append("name", params.name);
  const q = search.toString();
  return client.get<unknown>(`/integrations/${integrationId}/products${q ? `?${q}` : ""}`);
}

/** GET /integrations/{integrationId}/products/{externalProductId} */
export async function getExternalProduct(
  client: Client,
  integrationId: string,
  externalProductId: string
): Promise<unknown> {
  return client.get<unknown>(`/integrations/${integrationId}/products/${externalProductId}`);
}

/** GET /integrations/{integrationId}/orders/statuses */
export async function listOrderStatuses(
  client: Client,
  integrationId: string
): Promise<unknown> {
  return client.get<unknown>(`/integrations/${integrationId}/orders/statuses`);
}
