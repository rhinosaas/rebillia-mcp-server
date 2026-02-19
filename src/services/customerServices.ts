/**
 * Customer API service – storage for Rebillia customer endpoints.
 * Tools in tools/customers/* call these functions to avoid repeating HTTP/query logic.
 */

import type {
  Customer,
  CustomerAddressBook,
  CustomerPaymentMethod,
  Invoice,
  PaginatedResponse,
} from "../types.js";

export type Client = InstanceType<typeof import("../client.js").default>;

// ============================================================================
// Query / params types
// ============================================================================

export interface ListCustomersParams {
  pageNo?: number;
  itemPerPage?: number;
  query?: string;
  status?: string;
  sortBy?: string;
  orderBy?: string;
  include?: string;
  filterId?: number;
}

export interface PaginationIncludeParams {
  pageNo?: number;
  itemPerPage?: number;
  include?: string;
}

export interface CreateCustomerBody {
  firstName: string;
  lastName: string;
  email: string;
  businessName?: string;
  locale?: string;
  phoneNum?: string;
  phoneExt?: string;
  preferredCurrency?: string;
  taxExempt?: boolean;
}

export interface UpdateCustomerBody {
  firstName?: string;
  lastName?: string;
  email?: string;
  businessName?: string;
  locale?: string;
  phoneNum?: string;
  phoneExt?: string;
  preferredCurrency?: string;
  taxExempt?: boolean;
  status?: "active" | "disabled" | "archived";
}

export type AddressType = "residential" | "commercial";

export interface CreateCustomerAddressBody {
  name: string;
  contactName: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  countryId: string;
  type: AddressType;
  street2?: string;
  company?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface UpdateCustomerAddressBody {
  name?: string;
  contactName?: string;
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zip?: string;
  countryId?: string;
  company?: string;
  contactEmail?: string;
  contactPhone?: string;
  type?: AddressType;
}

/** Billing address for payment method (CustomerPaymentMethodService::createPayment). */
export interface CreatePaymentMethodBillingAddress {
  countryId: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  street2?: string;
}

/** Create payment method: API expects paymentMethod: { nonce } and billingAddress. Type: card | ach. */
export type PaymentMethodType = "card" | "ach";

export interface CreateCustomerPaymentMethodBody {
  companyGatewayId: string;
  type: PaymentMethodType;
  paymentNonce: string;
  billingAddress: CreatePaymentMethodBillingAddress;
}

/** Update payment method: API only updates billing address (AddressType). */
export interface UpdateCustomerPaymentMethodBillingAddress {
  countryId: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  street2?: string;
}

export interface UpdateCustomerPaymentMethodBody {
  billingAddress: UpdateCustomerPaymentMethodBillingAddress;
}

/** List charges/credits query params (ChargesCreditsController, CustomerChargeCreditService::getList). */
export interface ListChargesCreditsParams {
  status?: string;
  type?: string;
  include?: string;
  pageNo?: number;
  itemPerPage?: number;
}

/** Create charge/credit. Amount is in CENTS (e.g. 1000 = $10.00). Validator also requires companyCurrencyId, category, qty. */
export type ChargeCreditType = "charge" | "credit";

export interface CreateChargeCreditBody {
  /** Amount in CENTS (e.g. 1000 = $10.00) */
  amount: number;
  description?: string;
  type: ChargeCreditType;
  companyCurrencyId: number;
  category: "physical" | "digital";
  qty?: number;
  isFreeShipping?: boolean;
  taxable?: boolean;
  /** Weight (same scale as backend; required when category is physical in API) */
  weight?: number;
}

// ============================================================================
// Query string helper
// ============================================================================

function appendParams(params: URLSearchParams, data: Record<string, unknown>): void {
  if (data.pageNo != null) params.append("pageNo", String(data.pageNo));
  if (data.itemPerPage != null) params.append("itemPerPage", String(data.itemPerPage));
  if (typeof data.include === "string" && data.include) params.append("include", data.include);
}

function queryString(params: URLSearchParams): string {
  const q = params.toString();
  return q ? `?${q}` : "";
}

// ============================================================================
// API functions (storage)
// ============================================================================

export async function listCustomers(
  client: Client,
  params: ListCustomersParams
): Promise<PaginatedResponse<Customer>> {
  const search = new URLSearchParams();
  if (params.pageNo != null) search.append("pageNo", String(params.pageNo));
  if (params.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  if (params.query) search.append("query", params.query);
  if (params.status) search.append("status", params.status);
  if (params.sortBy) search.append("sortBy", params.sortBy);
  if (params.orderBy) search.append("orderBy", params.orderBy);
  if (params.include) search.append("include", params.include);
  if (params.filterId != null) search.append("filterId", String(params.filterId));
  return client.get<PaginatedResponse<Customer>>(`/customers${queryString(search)}`);
}

export async function getCustomer(
  client: Client,
  id: string,
  options?: { includeAddresses?: boolean; includePaymentMethods?: boolean }
): Promise<Customer> {
  const search = new URLSearchParams();
  const includes: string[] = [];
  if (options?.includeAddresses) includes.push("addressbook");
  if (options?.includePaymentMethods) includes.push("paymentmethod");
  if (includes.length > 0) search.append("include", includes.join(","));
  return client.get<Customer>(`/customers/${id}${queryString(search)}`);
}

export async function createCustomer(client: Client, body: CreateCustomerBody): Promise<Customer> {
  return client.post<Customer>("/customers", body);
}

export async function updateCustomer(
  client: Client,
  customerId: string,
  body: UpdateCustomerBody
): Promise<Customer> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as UpdateCustomerBody;
  return client.put<Customer>(
    `/customers/${customerId}`,
    Object.keys(payload).length ? payload : undefined
  );
}

export async function deleteCustomer(
  client: Client,
  customerId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(`/customers/${customerId}`);
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Customer deleted" };
}

export async function getCustomerInvoices(
  client: Client,
  customerId: string,
  params?: PaginationIncludeParams
): Promise<PaginatedResponse<Invoice>> {
  const search = new URLSearchParams();
  if (params) appendParams(search, params as Record<string, unknown>);
  return client.get<PaginatedResponse<Invoice>>(
    `/customers/${customerId}/invoices${queryString(search)}`
  );
}

export async function getCustomerSubscriptions(
  client: Client,
  customerId: string,
  params?: PaginationIncludeParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params) appendParams(search, params as Record<string, unknown>);
  return client.get<PaginatedResponse<unknown>>(
    `/customers/${customerId}/subscriptions${queryString(search)}`
  );
}

export async function getCustomerLogs(
  client: Client,
  customerId: string,
  params?: Pick<PaginationIncludeParams, "pageNo" | "itemPerPage">
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  return client.get<PaginatedResponse<unknown>>(
    `/customers/${customerId}/logs${queryString(search)}`
  );
}

// ============================================================================
// Customer addressbooks (storage)
// ============================================================================

export async function listCustomerAddresses(
  client: Client,
  customerId: string
): Promise<CustomerAddressBook[] | PaginatedResponse<CustomerAddressBook>> {
  return client.get<CustomerAddressBook[] | PaginatedResponse<CustomerAddressBook>>(
    `/customers/${customerId}/addressbooks`
  );
}

export async function getCustomerAddress(
  client: Client,
  customerId: string,
  addressId: string
): Promise<CustomerAddressBook> {
  return client.get<CustomerAddressBook>(
    `/customers/${customerId}/addressbooks/${addressId}`
  );
}

export async function createCustomerAddress(
  client: Client,
  customerId: string,
  body: CreateCustomerAddressBody
): Promise<CustomerAddressBook> {
  return client.post<CustomerAddressBook>(
    `/customers/${customerId}/addressbooks`,
    body
  );
}

export async function updateCustomerAddress(
  client: Client,
  customerId: string,
  addressId: string,
  body: UpdateCustomerAddressBody
): Promise<CustomerAddressBook> {
  const payload = Object.fromEntries(
    Object.entries(body).filter(([, v]) => v !== undefined)
  ) as UpdateCustomerAddressBody;
  return client.put<CustomerAddressBook>(
    `/customers/${customerId}/addressbooks/${addressId}`,
    Object.keys(payload).length ? payload : undefined
  );
}

export async function deleteCustomerAddress(
  client: Client,
  customerId: string,
  addressId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(
    `/customers/${customerId}/addressbooks/${addressId}`
  );
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Address deleted" };
}

// ============================================================================
// Customer payment methods (storage)
// ============================================================================

export async function listCustomerPaymentMethods(
  client: Client,
  customerId: string
): Promise<CustomerPaymentMethod[] | PaginatedResponse<CustomerPaymentMethod>> {
  return client.get<CustomerPaymentMethod[] | PaginatedResponse<CustomerPaymentMethod>>(
    `/customers/${customerId}/paymentmethods`
  );
}

export async function getCustomerPaymentMethod(
  client: Client,
  customerId: string,
  paymentMethodId: string
): Promise<CustomerPaymentMethod> {
  return client.get<CustomerPaymentMethod>(
    `/customers/${customerId}/paymentmethods/${paymentMethodId}`
  );
}

export async function createCustomerPaymentMethod(
  client: Client,
  customerId: string,
  body: CreateCustomerPaymentMethodBody
): Promise<CustomerPaymentMethod> {
  const billingAddress = {
    countryId: body.billingAddress.countryId,
    street1: body.billingAddress.street1,
    street2: body.billingAddress.street2 ?? "",
    city: body.billingAddress.city,
    state: body.billingAddress.state,
    zip: body.billingAddress.zip,
  };
  const payload = {
    companyGatewayId: body.companyGatewayId,
    type: body.type,
    paymentMethod: { nonce: body.paymentNonce },
    billingAddress,
  };
  return client.post<CustomerPaymentMethod>(
    `/customers/${customerId}/paymentmethods`,
    payload
  );
}

export async function updateCustomerPaymentMethod(
  client: Client,
  customerId: string,
  paymentMethodId: string,
  body: UpdateCustomerPaymentMethodBody
): Promise<CustomerPaymentMethod> {
  return client.put<CustomerPaymentMethod>(
    `/customers/${customerId}/paymentmethods/${paymentMethodId}`,
    { billingAddress: body.billingAddress }
  );
}

export async function deleteCustomerPaymentMethod(
  client: Client,
  customerId: string,
  paymentMethodId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(
    `/customers/${customerId}/paymentmethods/${paymentMethodId}`
  );
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Payment method deleted" };
}

// ============================================================================
// Customer charges/credits (storage)
// ============================================================================

export async function listCustomerChargesCredits(
  client: Client,
  customerId: string,
  params?: ListChargesCreditsParams
): Promise<PaginatedResponse<unknown>> {
  const search = new URLSearchParams();
  if (params?.status) search.append("status", params.status);
  if (params?.type) search.append("type", params.type);
  if (params?.include) search.append("include", params.include);
  if (params?.pageNo != null) search.append("pageNo", String(params.pageNo));
  if (params?.itemPerPage != null) search.append("itemPerPage", String(params.itemPerPage));
  const q = search.toString();
  return client.get<PaginatedResponse<unknown>>(
    `/customers/${customerId}/charges_credits${q ? `?${q}` : ""}`
  );
}

export async function createCustomerChargeCredit(
  client: Client,
  customerId: string,
  body: CreateChargeCreditBody
): Promise<unknown> {
  const payload: Record<string, unknown> = {
    amount: body.amount,
    description: body.description ?? "",
    type: body.type,
    companyCurrencyId: body.companyCurrencyId,
    category: body.category,
    qty: body.qty ?? 1,
    // API validator requires these (CustomerChargeCreditValidator – no Optional())
    isFreeShipping: body.isFreeShipping ?? false,
    taxable: body.taxable ?? false,
  };
  if (body.weight !== undefined) payload.weight = body.weight;
  return client.post<unknown>(`/customers/${customerId}/charges_credits`, payload);
}

export async function deleteCustomerChargeCredit(
  client: Client,
  customerId: string,
  chargeCreditId: string
): Promise<Record<string, unknown>> {
  const result = await client.delete<Record<string, unknown>>(
    `/customers/${customerId}/charges_credits/${chargeCreditId}`
  );
  return Object.keys(result ?? {}).length ? result : { success: true, message: "Charge/credit deleted" };
}
