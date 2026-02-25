/**
 * Gateway (Company Gateway) API service – PublicAPI CompanyGatewayController endpoints.
 * Routes: /v1/gateways (base URL from client includes /v1).
 */

export type Client = InstanceType<typeof import("../client.js").default>;

export interface ListGatewaysParams {
  /** Filter by status (e.g. active, disabled, error, archive) */
  status?: string;
  companyCurrencyId?: string;
  include?: string;
}

/** Create body: aligned with CompanyGatewayType. setting = credentials key-value object; card = array of card type IDs. */
export interface CreateGatewayBody {
  /** Global gateway ID (required). */
  gblGatewayId: number;
  displayName?: string;
  /** Credentials key-value object (required). Keys depend on gateway type. */
  setting: Record<string, string | number | boolean>;
  /** Card type IDs (optional). */
  card?: number[];
  /** Payment method (required by form). */
  paymentMethod?: string;
}

/** Update body: displayName and/or setting (credentials). */
export interface UpdateGatewayBody {
  displayName?: string;
  setting?: Record<string, string | number | boolean>;
}

/** GET /gateways */
export async function listGateways(
  client: Client,
  params?: ListGatewaysParams
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.status) search.append("status", params.status);
  if (params?.companyCurrencyId) search.append("companyCurrencyId", params.companyCurrencyId);
  if (params?.include) search.append("include", params.include);
  const q = search.toString();
  return client.get<unknown>(`/gateways${q ? `?${q}` : ""}`);
}

/** GET /gateways/{gatewayId} */
export async function getGateway(
  client: Client,
  gatewayId: string
): Promise<unknown> {
  return client.get<unknown>(`/gateways/${gatewayId}`);
}

/** POST /gateways */
export async function createGateway(
  client: Client,
  body: CreateGatewayBody
): Promise<unknown> {
  return client.post<unknown>("/gateways", body);
}

/** PUT /gateways/{gatewayId} */
export async function updateGateway(
  client: Client,
  gatewayId: string,
  body: UpdateGatewayBody
): Promise<unknown> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as UpdateGatewayBody;
  return client.put<unknown>(`/gateways/${gatewayId}`, Object.keys(payload).length ? payload : {});
}

/** DELETE /gateways/{gatewayId} */
export async function deleteGateway(
  client: Client,
  gatewayId: string
): Promise<unknown> {
  return client.delete<unknown>(`/gateways/${gatewayId}`);
}

/** GET /gateways/{gatewayId}/test – test connection, returns gateway with connection status. */
export async function testGateway(
  client: Client,
  gatewayId: string
): Promise<unknown> {
  return client.get<unknown>(`/gateways/${gatewayId}/test`);
}
