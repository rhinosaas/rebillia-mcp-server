/**
 * Shipping tools: list_shipping_services, calculate_shipping.
 */

import type { Tool } from "../types.js";
import { calculateShippingTool } from "./calculateShipping.js";
import { listShippingServicesTool } from "./listShippingServices.js";

/** All 2 shipping tools. */
export function registerShippingTools(): Tool[] {
  return [listShippingServicesTool, calculateShippingTool];
}

export { listShippingServicesTool } from "./listShippingServices.js";
export { calculateShippingTool } from "./calculateShipping.js";
