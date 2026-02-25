/**
 * Company Filter API service – PublicAPI CompanyFilterController endpoints.
 * Routes: /v1/companies/filters (base URL from client includes /v1).
 */

export type Client = InstanceType<typeof import("../client.js").default>;

export interface ListFiltersParams {
  /** Filter by section (use section names). */
  section?: string;
}

/** Rule item for create filter. Server uses operatorId, attributeId, settingValues. */
export interface CreateFilterRule {
  operatorId: number;
  operatorDisplayName?: string;
  attributeId: number;
  settingValues: Array<{ value?: string | number }>;
}

export interface CreateFilterBody {
  displayName: string;
  section: string;
  isDefault: boolean;
  rules: CreateFilterRule[];
}

/** GET /companies/filters. Optional section query. */
export async function listFilters(
  client: Client,
  params?: ListFiltersParams
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.section) search.append("section", params.section);
  const q = search.toString();
  return client.get<unknown>(`/companies/filters${q ? `?${q}` : ""}`);
}

/** GET /companies/filters/fields. Section required (returns available filter attributes for section). */
export async function listFilterFields(
  client: Client,
  section: string
): Promise<unknown> {
  const search = new URLSearchParams();
  search.append("section", section);
  return client.get<unknown>(`/companies/filters/fields?${search.toString()}`);
}

/** POST /companies/filters */
export async function createFilter(
  client: Client,
  body: CreateFilterBody
): Promise<unknown> {
  return client.post<unknown>("/companies/filters", body);
}
