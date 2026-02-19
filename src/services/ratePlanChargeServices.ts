/**
 * Rate plan charge API service – ProductRatePlanChargeController endpoints.
 */

import type { PaginatedResponse } from "../types.js";

export type Client = InstanceType<typeof import("../client.js").default>;

/** Charge type: oneTime, recurring, usage (ProductRateplanChargeValidator) */
export type ChargeType = "oneTime" | "recurring" | "usage";

/** Charge model: flatFeePricing, perUnitPricing, tieredPricing, volumePricing */
export type ChargeModel = "flatFeePricing" | "perUnitPricing" | "tieredPricing" | "volumePricing";

/** Billing period: day, week, month, year */
export type BillingPeriod = "day" | "week" | "month" | "year";

/** Billing timing: inAdvance, inArrears */
export type BillingTiming = "inAdvance" | "inArrears";

export interface ChargeTierItem {
  currency: string;
  startingUnit?: string;
  endingUnit?: string;
  price: number;
  priceFormat?: string;
  tier?: number;
}

export interface ListRatePlanChargesParams {
  include?: string;
  orderBy?: string;
  sortBy?: string;
  pageNo?: number;
  itemPerPage?: number;
}

/** Create body: productRateplan reference (ratePlanId), name, chargeType, chargeModel, billCycleType, category, chargeTier, taxable, weight, etc. */
export interface CreateRatePlanChargeBody {
  /** Rate plan reference (ID). URI: /product-rateplans/{ratePlanId} */
  ratePlanId: number;
  name: string;
  chargeType: ChargeType;
  chargeModel: ChargeModel;
  billCycleType: string;
  category: "physical" | "digital";
  chargeTier: ChargeTierItem[];
  taxable: boolean;
  weight: number;
  description?: string;
  endDateCondition: "subscriptionEnd" | "fixedPeriod";
  billingPeriod?: BillingPeriod;
  billingTiming?: BillingTiming;
  billingPeriodAlignment?: string;
  specificBillingPeriod?: number;
  allowChangeQuantity?: boolean;
  billCycleDay?: number;
  weeklyBillCycleDay?: string;
  monthlyBillCycleYear?: number;
  cutOffType?: string;
  cutOffValue?: string;
  delay?: number;
  delayType?: string;
  isFreeShipping?: boolean;
  maxQuantity?: number;
  minQuantity?: number;
  quantity?: number;
  listPriceBase?: string;
  [k: string]: unknown;
}

export interface UpdateRatePlanChargeBody {
  name?: string;
  chargeType?: ChargeType;
  chargeModel?: ChargeModel;
  billCycleType?: string;
  category?: "physical" | "digital";
  chargeTier?: ChargeTierItem[];
  taxable?: boolean;
  weight?: number;
  description?: string;
  billingPeriod?: BillingPeriod;
  billingTiming?: BillingTiming;
  [k: string]: unknown;
}

export async function listRatePlanCharges(
  client: Client,
  ratePlanId: string,
  params?: ListRatePlanChargesParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.orderBy) search.append("orderBy", params.orderBy ?? "");
  if (params?.sortBy) search.append("sortBy", params.sortBy ?? "");
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(
    `/product-rateplans/${ratePlanId}/product-rateplan-charges${q ? `?${q}` : ""}`
  );
}

export async function getRatePlanCharge(
  client: Client,
  chargeId: string,
  params?: { include?: string }
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  const q = search.toString();
  return client.get<unknown>(`/product-rateplan-charges/${chargeId}${q ? `?${q}` : ""}`);
}

export async function createRatePlanCharge(
  client: Client,
  body: CreateRatePlanChargeBody
): Promise<unknown> {
  return client.post<unknown>("/product-rateplan-charges", body);
}

export async function updateRatePlanCharge(
  client: Client,
  chargeId: string,
  body: UpdateRatePlanChargeBody
): Promise<unknown> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as UpdateRatePlanChargeBody;
  return client.put<unknown>(
    `/product-rateplan-charges/${chargeId}`,
    Object.keys(payload).length ? payload : undefined
  );
}

export async function deleteRatePlanCharge(
  client: Client,
  chargeId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(
    `/product-rateplan-charges/${chargeId}`
  );
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Rate plan charge deleted" };
}
