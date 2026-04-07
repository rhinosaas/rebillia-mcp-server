/**
 * Shipping API service – PublicAPI ShippingController endpoints.
 * Routes: /v1/shipping (base URL from client includes /v1).
 */

export type Client = InstanceType<typeof import("../client.js").default>;

/** Body for POST /shipping/calculate. ShippingService requires companyCurrencyId; connectors use fromZip, fromCountry, zip, country, weight, orderAmount, orderQty/itemCount, optional address, services, packagingType. */
export interface CalculateShippingBody {
  /** Company currency ID (required by ShippingService::listShippingRates). */
  companyCurrencyId: number;
  fromZip: string;
  fromCountry: string;
  zip: string;
  country: string;
  weight: number;
  orderAmount: number;
  /** Item/order quantity (orderQty in some connectors). */
  itemCount: number;
  /** Residential address indicator (e.g. UPS). */
  residential?: boolean;
  /** Optional address fields (street1, city, state, etc.). */
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  /** Service IDs to filter (optional). */
  services?: (string | number)[];
  packagingType?: string;
  [k: string]: unknown;
}

/** GET /shipping/services */
export async function listShippingServices(client: Client): Promise<unknown> {
  return client.get<unknown>("/shipping/services");
}

/** POST /shipping/calculate. Sends orderQty from itemCount for API compatibility. */
export async function calculateShipping(
  client: Client,
  body: CalculateShippingBody
): Promise<unknown> {
  const { itemCount, ...rest } = body;
  const payload = { ...rest, orderQty: itemCount };
  return client.post<unknown>("/shipping/calculate", payload);
}
