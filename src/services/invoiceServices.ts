/**
 * Invoice API service – InvoiceController endpoints.
 */

import type { PaginatedResponse } from "../types.js";

export type Client = InstanceType<typeof import("../client.js").default>;

export interface ListInvoicesParams {
  include?: string;
  status?: string;
  query?: string;
  orderBy?: string;
  sortBy?: string;
  filterId?: number;
  itemPerPage?: number;
  pageNo?: number;
}

/** Billing/shipping address. When provided, AddressValidator requires: contactName, street1, city, zip, countryId, type (residential|commercial). */
export interface InvoiceAddressInput {
  street1: string;
  city: string;
  zip: string;
  countryId: string;
  contactName: string;
  type: "residential" | "commercial";
  street2?: string;
  state?: string;
  contactEmail?: string;
  contactPhone?: string;
  contactCompany?: string;
}

/** Line item for create invoice. amount in DOLLAR STRINGS e.g. '20.00'. */
export interface InvoiceDetailItemInput {
  amount: string;
  description?: string;
  qty?: number;
  [k: string]: unknown;
}

/** Aligned with RebilliaServer InvoiceValidator (PublicAPI). Required: companyCurrencyId, companyGatewayId, customerId, paymentMethodId, detail (non-empty). billingAddress/shippingAddress optional; when provided need contactName, street1, city, zip, countryId, type. */
export interface CreateInvoiceBody {
  companyCurrencyId: number;
  companyGatewayId: number;
  customerId: number;
  paymentMethodId: number;
  detail: InvoiceDetailItemInput[];
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  customerPaymentMethodId?: number;
  paymentType?: "offlinePaymentProvider" | "thirdPartyPaymentProvider" | "walletPaymentProvider" | "otherPayment";
  dateDue?: string;
  dateFrom?: string;
  dateTo?: string;
  billingAddress?: InvoiceAddressInput;
  shippingAddress?: InvoiceAddressInput;
  /** shippingAmount in CENTS */
  shippingAmount?: number;
  terms?: string;
  comments?: string;
  [k: string]: unknown;
}

/** Update body: aligned with RebilliaServer PublicAPI InvoiceService::updateValidator. Only invoices with status 'posted' or 'requestPayment' can be updated. billingAddress not accepted; shippingAddress uses AddressValidator when provided. */
export interface UpdateInvoiceBody {
  companyGatewayId?: number;
  customerId?: number;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  customerPaymentMethodId?: number;
  dateDue?: string;
  dateFrom?: string;
  dateTo?: string;
  comments?: string;
  paymentType?: "offlinePaymentProvider" | "thirdPartyPaymentProvider" | "walletPaymentProvider";
  paymentMethodId?: number;
  shippingAddress?: InvoiceAddressInput;
  shippingAmount?: number;
  shippingServiceId?: string;
  detail?: InvoiceDetailItemInput[];
  [k: string]: unknown;
}

/** Charge invoice body. amount in CENTS (e.g. 5500 = $55.00). paymentType required by API. */
export interface ChargeInvoiceBody {
  amount: number;
  paymentType: "offlinePaymentProvider" | "thirdPartyPaymentProvider" | "walletPaymentProvider" | "otherPayment";
  [k: string]: unknown;
}

export async function listInvoices(
  client: Client,
  params?: ListInvoicesParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  if (params?.status) search.append("status", params.status);
  if (params?.query) search.append("query", params.query);
  if (params?.orderBy) search.append("orderBy", params.orderBy ?? "");
  if (params?.sortBy) search.append("sortBy", params.sortBy ?? "");
  if (params?.filterId != null) search.append("filterId", String(params.filterId));
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(`/invoices${q ? `?${q}` : ""}`);
}

export async function getInvoice(
  client: Client,
  invoiceId: string,
  params?: { include?: string }
): Promise<unknown> {
  const search = new URLSearchParams();
  if (params?.include) search.append("include", params.include);
  const q = search.toString();
  return client.get<unknown>(`/invoices/${invoiceId}${q ? `?${q}` : ""}`);
}

export async function createInvoice(
  client: Client,
  body: CreateInvoiceBody
): Promise<unknown> {
  return client.post<unknown>("/invoices", body);
}

export async function updateInvoice(
  client: Client,
  invoiceId: string,
  body: UpdateInvoiceBody
): Promise<unknown> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as UpdateInvoiceBody;
  // Always send a JSON body; some server paths expect it and may throw getId() on null when body is missing
  return client.put<unknown>(`/invoices/${invoiceId}`, Object.keys(payload).length ? payload : {});
}

export async function deleteInvoice(
  client: Client,
  invoiceId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(`/invoices/${invoiceId}`);
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Invoice deleted" };
}

/** Charge invoice (card/online). amount in CENTS. POST /invoices/{id}/charge */
export async function chargeInvoice(
  client: Client,
  invoiceId: string,
  body: ChargeInvoiceBody
): Promise<unknown> {
  return client.post<unknown>(`/invoices/${invoiceId}/charge`, body);
}

/** Charge invoice via offline (cash/check/wire). amount in CENTS; service adds paymentType: offlinePaymentProvider */
export async function chargeInvoiceExternal(
  client: Client,
  invoiceId: string,
  body: Omit<ChargeInvoiceBody, "paymentType">
): Promise<unknown> {
  return client.post<unknown>(`/invoices/${invoiceId}/charge`, {
    ...body,
    paymentType: "offlinePaymentProvider",
  });
}

/** Void invoice. IRREVERSIBLE. PUT /invoices/{id}/void */
export async function voidInvoice(
  client: Client,
  invoiceId: string
): Promise<unknown> {
  return client.put<unknown>(`/invoices/${invoiceId}/void`, undefined);
}
