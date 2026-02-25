/**
 * Subscription API service – SubscriptionController endpoints.
 */

import type { PaginatedResponse } from "../types.js";

export type Client = InstanceType<typeof import("../client.js").default>;

export interface ListSubscriptionsParams {
  include?: string;
  query?: string;
  orderBy?: string;
  sortBy?: string;
  filterId?: number;
  itemPerPage?: number;
  pageNo?: number;
}

/** Charge tier item for subscription rate plan charges (currency, price, optional startingUnit, endingUnit, priceFormat, tier). */
export interface SubscriptionChargeTierItem {
  currency: string;
  startingUnit?: string;
  endingUnit?: string;
  price: number;
  priceFormat?: string;
  tier?: number;
}

/** Ensure each charge tier has priceFormat (API requires it). Default to "" when missing. */
function normalizeChargeTier(tiers: SubscriptionChargeTierItem[]): SubscriptionChargeTierItem[] {
  return tiers.map((tier) => ({
    ...tier,
    priceFormat: tier.priceFormat ?? "",
  }));
}

/** Nested rate plan charge in create subscription. Can reference productRatePlanChargeId + quantity or full definition with chargeTier. */
export interface SubscriptionRatePlanChargeItem {
  productRatePlanChargeId?: number;
  quantity: number;
  name?: string;
  billCycleType?: string;
  chargeType?: string;
  endDateCondition?: string;
  taxable?: boolean;
  chargeTier?: SubscriptionChargeTierItem[];
  billingPeriod?: string;
  billingTiming?: string;
  billingPeriodAlignment?: string;
  specificBillingPeriod?: number;
  [k: string]: unknown;
}

/** Rate plan item in create subscription (SubscriptionValidator, RatePlanValidator). */
export interface SubscriptionRatePlanItem {
  productRatePlanId: number;
  name?: string;
  type?: "contract" | "ongoing" | "prepaid";
  effectiveStartDate?: string;
  changeStatusBasedOnCharge?: boolean;
  ratePlanCharge?: SubscriptionRatePlanChargeItem[];
}

/** Create subscription body. Controller adds source: publicApi. */
export interface CreateSubscriptionBody {
  customerId: number;
  name: string;
  companyCurrencyId: number;
  effectiveStartDate: string;
  ratePlan: SubscriptionRatePlanItem[];
  companyGatewayId?: number;
  customerPaymentMethodId?: number;
  detail?: string;
  offlinePaymentId?: string;
  billingAddressId?: number;
  shippingAddressId?: number;
  [k: string]: unknown;
}

export interface UpdateSubscriptionBody {
  name?: string;
  companyCurrencyId?: number;
  companyGatewayId?: number;
  customerPaymentMethodId?: number;
  detail?: string;
  effectiveStartDate?: string;
  billingAddressId?: number;
  shippingAddressId?: number;
  [k: string]: unknown;
}

/** Subscription status (SubscriptionValidator::validateStatus). */
export type SubscriptionStatus = "active" | "paused" | "archived" | "requestPayment";

export async function listSubscriptions(
  client: Client,
  params?: ListSubscriptionsParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.query) search.append("query", params.query);
  if (params?.orderBy) search.append("orderBy", params.orderBy ?? "");
  if (params?.sortBy) search.append("sortBy", params.sortBy ?? "");
  if (params?.filterId != null) search.append("filterId", String(params.filterId));
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(`/subscriptions${q ? `?${q}` : ""}`);
}

export async function getSubscription(
  client: Client,
  subscriptionId: string,
  params?: { include?: string }
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  const q = search.toString();
  return client.get<unknown>(`/subscriptions/${subscriptionId}${q ? `?${q}` : ""}`);
}

export async function createSubscription(
  client: Client,
  body: CreateSubscriptionBody
): Promise<unknown> {
  return client.post<unknown>("/subscriptions", body);
}

export async function updateSubscription(
  client: Client,
  subscriptionId: string,
  body: UpdateSubscriptionBody
): Promise<unknown> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as UpdateSubscriptionBody;
  return client.put<unknown>(
    `/subscriptions/${subscriptionId}`,
    Object.keys(payload).length ? payload : undefined
  );
}

export async function deleteSubscription(
  client: Client,
  subscriptionId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(
    `/subscriptions/${subscriptionId}`
  );
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Subscription deleted" };
}

export async function updateSubscriptionStatus(
  client: Client,
  subscriptionId: string,
  status: SubscriptionStatus
): Promise<unknown> {
  return client.put<unknown>(`/subscriptions/${subscriptionId}/status`, { status });
}

// ============================================================================
// Billing preview and history
// ============================================================================

export interface SubscriptionNextBillParams {
  include?: string;
}

/** Next bill preview: amounts, dates, and related charges. GET /subscriptions/{id}/nextBill */
export async function getSubscriptionNextBill(
  client: Client,
  subscriptionId: string,
  params?: SubscriptionNextBillParams
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  const q = search.toString();
  return client.get<unknown>(`/subscriptions/${subscriptionId}/nextBill${q ? `?${q}` : ""}`);
}

export interface SubscriptionUpcomingParams {
  include?: string;
}

/** Upcoming charges for the subscription. GET /subscriptions/{id}/upcoming */
export async function getSubscriptionUpcomingCharges(
  client: Client,
  subscriptionId: string,
  params?: SubscriptionUpcomingParams
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  const q = search.toString();
  return client.get<unknown>(`/subscriptions/${subscriptionId}/upcoming${q ? `?${q}` : ""}`);
}

export interface SubscriptionInvoicesParams {
  include?: string;
  pageNo?: number;
  itemPerPage?: number;
}

/** Invoices for the subscription. GET /subscriptions/{id}/invoices. Use include for detail, transactions. */
export async function getSubscriptionInvoices(
  client: Client,
  subscriptionId: string,
  params?: SubscriptionInvoicesParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(
    `/subscriptions/${subscriptionId}/invoices${q ? `?${q}` : ""}`
  );
}

export interface SubscriptionLogsParams {
  pageNo?: number;
  itemPerPage?: number;
}

/** Activity history for the subscription. GET /subscriptions/{id}/logs */
export async function getSubscriptionLogs(
  client: Client,
  subscriptionId: string,
  params?: SubscriptionLogsParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(
    `/subscriptions/${subscriptionId}/logs${q ? `?${q}` : ""}`
  );
}

export interface SubscriptionExternalInvoicesParams {
  include?: string;
  pageNo?: number;
  itemPerPage?: number;
}

/** External (e-commerce) orders linked to the subscription. GET /subscriptions/{id}/external-invoices */
export async function getSubscriptionExternalInvoices(
  client: Client,
  subscriptionId: string,
  params?: SubscriptionExternalInvoicesParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(
    `/subscriptions/${subscriptionId}/external-invoices${q ? `?${q}` : ""}`
  );
}

// ============================================================================
// Subscription-level rate plans and rate plan charges
// ============================================================================

export interface ListSubscriptionRatePlansParams {
  include?: string;
  pageNo?: number;
  itemPerPage?: number;
  orderBy?: string;
  sortBy?: string;
}

/** List rate plans on a subscription. GET /subscriptions/{id}/rateplans */
export async function listSubscriptionRatePlans(
  client: Client,
  subscriptionId: string,
  params?: ListSubscriptionRatePlansParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params?.orderBy) search.append("orderBy", params.orderBy ?? "");
  if (params?.sortBy) search.append("sortBy", params.sortBy ?? "");
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(
    `/subscriptions/${subscriptionId}/rateplans${q ? `?${q}` : ""}`
  );
}

/** Get one rate plan on a subscription. GET /subscriptions/{id}/rateplans/{ratePlanId} */
export async function getSubscriptionRatePlan(
  client: Client,
  subscriptionId: string,
  ratePlanId: string,
  params?: { include?: string }
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  const q = search.toString();
  return client.get<unknown>(
    `/subscriptions/${subscriptionId}/rateplans/${ratePlanId}${q ? `?${q}` : ""}`
  );
}

/** Add a rate plan to a subscription. POST /subscriptions/{id}/rateplans */
export interface AddSubscriptionRatePlanBody {
  productRatePlanId: number;
  name?: string;
  type?: "contract" | "ongoing" | "prepaid";
  effectiveStartDate?: string;
  changeStatusBasedOnCharge?: boolean;
  ratePlanCharge?: SubscriptionRatePlanChargeItem[];
  [k: string]: unknown;
}

export async function addSubscriptionRatePlan(
  client: Client,
  subscriptionId: string,
  body: AddSubscriptionRatePlanBody
): Promise<unknown> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as AddSubscriptionRatePlanBody;
  return client.post<unknown>(
    `/subscriptions/${subscriptionId}/rateplans`,
    Object.keys(payload).length ? payload : undefined
  );
}

/** Update a subscription rate plan. PUT /subscriptions/{id}/rateplans/{ratePlanId} */
export interface UpdateSubscriptionRatePlanBody {
  name?: string;
  type?: "contract" | "ongoing" | "prepaid";
  effectiveStartDate?: string;
  changeStatusBasedOnCharge?: boolean;
  [k: string]: unknown;
}

export async function updateSubscriptionRatePlan(
  client: Client,
  subscriptionId: string,
  ratePlanId: string,
  body: UpdateSubscriptionRatePlanBody
): Promise<unknown> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as UpdateSubscriptionRatePlanBody;
  return client.put<unknown>(
    `/subscriptions/${subscriptionId}/rateplans/${ratePlanId}`,
    Object.keys(payload).length ? payload : undefined
  );
}

/** Remove a rate plan from a subscription. DELETE /subscriptions/{id}/rateplans/{ratePlanId} */
export async function removeSubscriptionRatePlan(
  client: Client,
  subscriptionId: string,
  ratePlanId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(
    `/subscriptions/${subscriptionId}/rateplans/${ratePlanId}`
  );
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Rate plan removed" };
}

/** Get one rate plan charge on a subscription. GET /subscriptions/{id}/rateplan-charges/{chargeId} */
export async function getSubscriptionRatePlanCharge(
  client: Client,
  subscriptionId: string,
  chargeId: string,
  params?: { include?: string }
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  const q = search.toString();
  return client.get<unknown>(
    `/subscriptions/${subscriptionId}/rateplan-charges/${chargeId}${q ? `?${q}` : ""}`
  );
}

/** Add a rate plan charge to a subscription rate plan. POST /subscriptions/{id}/rateplans/{ratePlanId}/rateplan-charges. API requires: name, chargeType, chargeModel, billCycleType, category, chargeTier, taxable, weight, endDateCondition, quantity (or productRatePlanChargeId + quantity if API supports clone). */
export interface AddSubscriptionRatePlanChargeBody {
  productRatePlanChargeId?: number;
  quantity: number;
  name?: string;
  chargeType?: string;
  chargeModel?: string;
  billCycleType?: string;
  category?: "physical" | "digital";
  chargeTier?: SubscriptionChargeTierItem[];
  taxable?: boolean;
  weight?: number;
  endDateCondition?: string;
  billingPeriod?: string;
  billingTiming?: string;
  billingPeriodAlignment?: string;
  specificBillingPeriod?: number;
  [k: string]: unknown;
}

export async function addSubscriptionRatePlanCharge(
  client: Client,
  subscriptionId: string,
  ratePlanId: string,
  body: AddSubscriptionRatePlanChargeBody
): Promise<unknown> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as AddSubscriptionRatePlanChargeBody;
  if (payload.weight != null) payload.weight = Number(payload.weight);
  if (payload.chargeTier?.length) payload.chargeTier = normalizeChargeTier(payload.chargeTier);
  // Always send a JSON body; API may require productRatePlanChargeId or full charge definition
  const postBody = Object.keys(payload).length ? payload : { quantity: body.quantity };
  return client.post<unknown>(
    `/subscriptions/${subscriptionId}/rateplans/${ratePlanId}/rateplan-charges`,
    postBody
  );
}

/** Update a subscription rate plan charge. PUT /subscriptions/{id}/rateplan-charges/{chargeId} */
export interface UpdateSubscriptionRatePlanChargeBody {
  quantity?: number;
  name?: string;
  billCycleType?: string;
  chargeType?: string;
  endDateCondition?: string;
  taxable?: boolean;
  chargeTier?: SubscriptionChargeTierItem[];
  billingPeriod?: string;
  billingTiming?: string;
  billingPeriodAlignment?: string;
  specificBillingPeriod?: number;
  weight?: number;
  [k: string]: unknown;
}

export async function updateSubscriptionRatePlanCharge(
  client: Client,
  subscriptionId: string,
  chargeId: string,
  body: UpdateSubscriptionRatePlanChargeBody
): Promise<unknown> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as UpdateSubscriptionRatePlanChargeBody;
  if (payload.weight != null) payload.weight = Number(payload.weight);
  if (payload.chargeTier?.length) payload.chargeTier = normalizeChargeTier(payload.chargeTier);
  return client.put<unknown>(
    `/subscriptions/${subscriptionId}/rateplan-charges/${chargeId}`,
    Object.keys(payload).length ? payload : undefined
  );
}

/** Remove a rate plan charge from a subscription. DELETE /subscriptions/{id}/rateplan-charges/{chargeId} */
export async function removeSubscriptionRatePlanCharge(
  client: Client,
  subscriptionId: string,
  chargeId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(
    `/subscriptions/${subscriptionId}/rateplan-charges/${chargeId}`
  );
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Charge removed" };
}
