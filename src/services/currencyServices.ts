/**
 * Company Currency API service – PublicAPI CompanyCurrencyController endpoints.
 * Routes: /v1/currencies (base URL from client includes /v1).
 */

export type Client = InstanceType<typeof import("../client.js").default>;

export interface ListCurrenciesParams {
  include?: string;
  itemPerPage?: number;
  pageNo?: number;
}

/** Create body. Aligned with CurrencyService::createCompanyCurrency: currencyId, conversionRate, fixedRate required. */
export interface CreateCurrencyBody {
  /** Global currency ID (required). */
  currencyId: number;
  /** Conversion rate (required, number). */
  conversionRate: number;
  /** Fixed rate flag (required, boolean). */
  fixedRate: boolean;
}

/** Update body. Aligned with CurrencyService::updateCompanyCurrency: conversionRate, fixedRate required. */
export interface UpdateCurrencyBody {
  conversionRate: number;
  fixedRate: boolean;
}

/** Set default body. Controller requires currencyId in request body. */
export interface SetDefaultCurrencyBody {
  currencyId: number;
}

/** GET /currencies */
export async function listCurrencies(
  client: Client,
  params?: ListCurrenciesParams
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  const q = search.toString();
  return client.get<unknown>(`/currencies${q ? `?${q}` : ""}`);
}

/** GET /currencies/{currencyId} – company currency by ID (numeric). */
export async function getCurrency(
  client: Client,
  currencyId: string
): Promise<unknown> {
  return client.get<unknown>(`/currencies/${currencyId}`);
}

/** POST /currencies */
export async function createCurrency(
  client: Client,
  body: CreateCurrencyBody
): Promise<unknown> {
  return client.post<unknown>("/currencies", body);
}

/** PUT /currencies/{companyCurrencyId} */
export async function updateCurrency(
  client: Client,
  companyCurrencyId: string,
  body: UpdateCurrencyBody
): Promise<unknown> {
  return client.put<unknown>(`/currencies/${companyCurrencyId}`, body);
}

/** DELETE /currencies/{companyCurrencyId} */
export async function deleteCurrency(
  client: Client,
  companyCurrencyId: string
): Promise<unknown> {
  return client.delete<unknown>(`/currencies/${companyCurrencyId}`);
}

/** GET /currencies/default */
export async function getDefaultCurrency(client: Client): Promise<unknown> {
  return client.get<unknown>("/currencies/default");
}

/** POST /currencies/default. Body: { currencyId }. */
export async function setDefaultCurrency(
  client: Client,
  body: SetDefaultCurrencyBody
): Promise<unknown> {
  return client.post<unknown>("/currencies/default", body);
}
