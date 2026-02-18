/**
 * Rebillia Public API Type Definitions
 * Aligned with RebilliaServer PublicAPI normalizers (Serializer/Normalizer/PublicAPI/)
 */

// ============================================================================
// Enums (value strings as returned by the API)
// ============================================================================

export enum ChargeType {
  OneTime = "oneTime",
  Recurring = "recurring",
  Usage = "usage",
}

export enum ChargeModel {
  FlatFee = "flatFee",
  PerUnit = "perUnit",
  Tiered = "tiered",
  Volume = "volume",
  Overage = "overage",
}

export enum BillingPeriod {
  Day = "day",
  Week = "week",
  Month = "month",
  Quarter = "quarter",
  Year = "year",
}

export enum BillingTiming {
  InAdvance = "inAdvance",
  InArrears = "inArrears",
}

// ============================================================================
// Shared / Nested types (from Gbl and normalizers)
// ============================================================================

/** GblCurrency – from GblCurrencyNormalizer */
export interface GblCurrency {
  flag: string | null;
  id: string;
  iso3: string;
  name: string;
  numericCode: string | null;
  symbol: string | null;
}

/** Country (GblCountry / Countries) – from GblCountryNormalizer, CountriesNormalizer */
export interface PublicApiCountry {
  alpha2Code: string;
  alpha3Code: string;
  flag: string | null;
  id: string;
  name: string;
  numericCode: string | null;
  priority?: number;
}

/** Customer address (CustomerAddressBook) – from CustomerAddressBookNormalizer */
export interface CustomerAddressBook {
  city: string;
  company: string | null;
  contactEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  country: PublicApiCountry;
  id: string;
  name: string | null;
  state: string | null;
  street1: string;
  street2: string | null;
  type: string | null;
  zip: string | null;
}

/** Inline billing address on payment method – from CustomerPaymentMethodNormalizer */
export interface PaymentMethodBillingAddress {
  city: string | null;
  country: PublicApiCountry | null;
  state: string | null;
  street1: string | null;
  street2: string | null;
  zip: string | null;
}

/** Company gateway (minimal) – from CompanyGatewaysNormalizer */
export interface CompanyGateway {
  credentialsLastUpdate: string | null;
  displayName: string;
  id: string;
  status: string | null;
  type: string;
}

/** Customer payment method – from CustomerPaymentMethodNormalizer */
export interface CustomerPaymentMethod {
  accountName: string | null;
  accountNumber: string | null;
  accountType: string | null;
  bankName: string | null;
  billingAddress: PaymentMethodBillingAddress;
  customerAddressBook: CustomerAddressBook | null;
  companyGateway?: CompanyGateway;
  expDate: string;
  id: string;
  routingNumber: string | null;
  type: string;
  verified: boolean;
}

/** Company currency – from CompanyCurrencyNormalizer */
export interface CompanyCurrency {
  companyGateway?: CompanyGateway[];
  conversionRate: number | null;
  createdAt: string;
  currency: GblCurrency;
  fixedRate: boolean;
  id: string;
  isEditable?: boolean;
  updatedAt: string;
}

/** Last invoice (customer include) – from CustomerNormalizer */
export interface CustomerLastInvoice {
  total: number;
  date: string;
  companyCurrency: CompanyCurrency | null;
}

/** Unpaid invoice (customer include) – from CustomerNormalizer */
export interface UnpaidInvoice {
  id: string;
  balanceDue: number;
  companyCurrency: CompanyCurrency | null;
  dateDue: string;
  dateFrom: string;
  dateTo: string;
  total: number;
}

/** Subscription summary (customer include) – from CustomerNormalizer */
export interface CustomerSubscriptionSummary {
  id: string;
  createdAt: string;
  name: string;
  shippingAmount: number | null;
  status: string;
  updatedAt: string;
}

/** External customer (customer include) – from ExternalCustomerNormalizer (shape used in CustomerNormalizer) */
export interface ExternalCustomer {
  id: string;
  [key: string]: unknown;
}

// ============================================================================
// Customer – from CustomerNormalizer
// ============================================================================

export interface Customer {
  agent: string | null;
  businessName: string | null;
  createdAt: string;
  customerId: string | null;
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  locale: string | null;
  phoneExt: string | null;
  phoneNum: string | null;
  preferredCurrency: string | null;
  status: string;
  taxExempt: boolean;
  updatedAt: string;
  /** Present when include=addressbook */
  addressBook?: CustomerAddressBook[];
  /** Present when include=lastInvoice */
  lastInvoice?: CustomerLastInvoice;
  /** Present when include=paymentmethod */
  paymentMethods?: CustomerPaymentMethod[];
  /** Present when include=subscriptions */
  subscriptions?: CustomerSubscriptionSummary[];
  /** Present when include=unpaidInvoices */
  unpaidInvoice?: UnpaidInvoice[];
  /** Present when include=externalCustomers */
  externalCustomer?: ExternalCustomer[];
}

// ============================================================================
// Rateplan charge tier – from RateplanChargeTierNormalizer
// ============================================================================

export interface RateplanChargeTier {
  createdAt: string | null;
  currency: string | null;
  endingUnit: number | null;
  id: string;
  price: number;
  priceFormat: string | null;
  startingUnit: number;
  tier: number | null;
  updatedAt: string | null;
}

// ============================================================================
// Rateplan charge – from RateplanChargeNormalizer
// ============================================================================

export interface RateplanCharge {
  allowChangeQuantity: boolean;
  billCycleDay: number | null;
  billCycleType: string | null;
  billingPeriod: string | null;
  billingPeriodAlignment: string | null;
  billingTiming: string | null;
  category: string | null;
  chargeModel: string;
  chargeTier: RateplanChargeTier[] | string;
  chargeType: string;
  chargedThroughDate: string | null;
  createdAt: string | null;
  depth: number | null;
  delay: number | null;
  delayType: string | null;
  description: string | null;
  dimensionalRule: string | null;
  effectiveEndDate: string | null;
  effectiveStartDate: string | null;
  endDateCondition: string | null;
  fixedShippingPrice: number | null;
  height: number | null;
  id: string;
  isFreeShipping: boolean;
  usageType: string | null;
  isGift: boolean;
  listPriceBase: number | null;
  mrr: number | null;
  name: string;
  numberOfPeriod: number | null;
  originLocation: string | null;
  price: number;
  priceIncreasePercentage: number | null;
  processedThroughDate: string | null;
  productRateplanChargeId: string | null;
  quantity: number;
  shippingAmount: number | null;
  shippingGroup: string | null;
  specificBillingPeriod: string | null;
  specificEndDate: string | null;
  status: string;
  taxClass: string | null;
  taxCode: string | null;
  taxMode: string | null;
  taxable: boolean;
  updatedAt: string | null;
  upToPeriods: number | null;
  upToPeriodsType: string | null;
  useSaleChannelData: boolean;
  weeklyBillCycleDay: number | null;
  weight: number | null;
  width: number | null;
  lastBillRun?: unknown;
}

// ============================================================================
// Rateplan – from RateplanNormalizer
// ============================================================================

export interface Rateplan {
  createdAt: string | null;
  id: string;
  lastCharge: string | null;
  name: string;
  nextCharge: string | null;
  oneTimeChargeAmount: number;
  oneTimeChargeQty: number;
  productId: string;
  productName: string;
  productRateplanId: string;
  rateplanCharge: RateplanCharge[] | string;
  recurringChargeAmount: number;
  recurringChargeQty: number;
  status: string;
  updatedAt: string | null;
  usageChargeAmount: number;
  usageChargeQty: number;
  customerPaymentMethod?: CustomerPaymentMethod | null;
}

// ============================================================================
// Company integration – from CompanyIntegrationNormalizer
// ============================================================================

export interface CompanyIntegration {
  createdAt: string;
  displayName: string;
  id: string;
  status: string;
  updatedAt: string;
}

// ============================================================================
// Subscription – from SubscriptionNormalizer
// ============================================================================

export interface Subscription {
  billingAddress: CustomerAddressBook | null;
  companyCurrency: CompanyCurrency | null;
  companyGateway: CompanyGateway | null;
  createdAt: string | null;
  customer: Customer | null;
  customerPaymentMethod: CustomerPaymentMethod | null;
  detail: string | null;
  id: string;
  lastCharge: string | null;
  name: string;
  nextCharge: string | null;
  offlinePaymentId: string | null;
  oneTimeChargeAmount: number;
  oneTimeChargeQty: number;
  rateplan?: Rateplan[];
  recurringChargeAmount: number;
  recurringChargeQty: number;
  shippingAddress: CustomerAddressBook | null;
  shippingAmount: number | null;
  shippingCompanyIntegration: CompanyIntegration | null;
  shippingServiceId: string | null;
  source: string | null;
  sourceCompanyIntegration: CompanyIntegration | null;
  status: string;
  updatedAt: string | null;
  usageChargeAmount: number;
  usageChargeQty: number;
  lastBillRun?: unknown;
}

// ============================================================================
// Invoice address block – from InvoiceNormalizer
// ============================================================================

export interface InvoiceAddress {
  city: string | null;
  contactCompany: string | null;
  contactEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  country: PublicApiCountry | string;
  state: string | null;
  street1: string | null;
  street2: string | null;
  type: string | null;
  zip: string | null;
}

// ============================================================================
// Invoice detail item – from InvoiceNormalizer (with detail include)
// ============================================================================

export interface InvoiceDetailItem {
  amount: number;
  chargeCredit: unknown | null;
  description: string | null;
  id: string;
  qty: number;
  taxAmount: number | null;
  taxRate: number | null;
  totalTaxExc: number | null;
  totalTaxInc: number | null;
  product: unknown | null;
  productRatePlanCharge: unknown | null;
  ratePlanCharge: RateplanCharge | null;
  subscription: Subscription | null;
}

// ============================================================================
// Invoice – from InvoiceNormalizer
// ============================================================================

export interface Invoice {
  autoCollection: boolean;
  balanceDue: number;
  billingAddress: InvoiceAddress;
  billRuns?: unknown[];
  comments: string | null;
  companyGateway: CompanyGateway | null;
  createdAt: string | null;
  currency: GblCurrency | null;
  customer: Customer | null;
  customerEmail: string | null;
  customerName: string | null;
  customerPaymentMethod: CustomerPaymentMethod | null;
  customerPhone: string | null;
  dateDue: string | null;
  dateFrom: string | null;
  datePaid: string | null;
  datePaymentRetry: string | null;
  dateRefund: string | null;
  dateTo: string | null;
  dateVoid: string | null;
  detail: InvoiceDetailItem[];
  externalInvoices?: unknown[];
  id: string;
  invoiceNo: string | null;
  offlinePaymentId: string | null;
  paymentType: string | null;
  refundAmount: number | null;
  shippingAddress: InvoiceAddress;
  shippingAmount: number | null;
  shippingCompanyIntegration: CompanyIntegration | null;
  shippingServiceId: string | null;
  shippingServiceName: string;
  status: string;
  subtotalTaxExc: number | null;
  subtotalTaxInc: number | null;
  taxAmount: number | null;
  taxCompanyIntegration: CompanyIntegration | null;
  taxRate: number | null;
  terms: string | null;
  total: number;
  transaction?: unknown[];
  updatedAt: string | null;
}

// ============================================================================
// Transaction – from TransactionNormalizer
// ============================================================================

export interface Transaction {
  amount: number;
  companyGateway: CompanyGateway | null;
  companyPaymentRun: null;
  createdAt: string;
  currency: GblCurrency;
  customer: Customer | null;
  customerPaymentSource: CustomerPaymentMethod | null;
  errorMessage: string | null;
  id: string;
  invoiceId: string | null;
  kind: string;
  parentId: string | null;
  paymentAccountName: string | null;
  paymentAccountNumber: string | null;
  paymentExpDate: string | null;
  paymentMethod: string | null;
  paymentType: string | null;
  status: string;
  transactionId: string | null;
  type: string;
  updatedAt: string;
}

// ============================================================================
// Product – from ProductNormalizer
// ============================================================================

export interface Product {
  category: string | null;
  createdAt: string;
  description: string | null;
  effectiveEndDate: string | null;
  effectiveStartDate: string | null;
  externalProduct?: unknown[];
  id: string;
  internalProductId: string | null;
  name: string;
  productRateplan: unknown[] | string;
  salesChannels?: unknown[];
  sku: string | null;
  status: string;
  updatedAt: string;
}

// ============================================================================
// Paginated response – from PaginatorService
// ============================================================================

export interface PaginatedResponse<T> {
  currentPageNumber: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
  data: T[];
}

// ============================================================================
// API Error
// ============================================================================

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: string;
}
