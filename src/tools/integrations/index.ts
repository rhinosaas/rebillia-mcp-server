/**
 * Integration tools: list, get config, get by key, list by key, external invoices/products, order statuses.
 */

import type { Tool } from "../types.js";
import { getExternalProductTool } from "./getExternalProduct.js";
import { getIntegrationByKeyTool } from "./getIntegrationByKey.js";
import { getIntegrationConfigTool } from "./getIntegrationConfig.js";
import { listExternalInvoicesTool } from "./listExternalInvoices.js";
import { listExternalProductsTool } from "./listExternalProducts.js";
import { listIntegrationsByKeyTool } from "./listIntegrationsByKey.js";
import { listIntegrationsTool } from "./listIntegrations.js";
import { listOrderStatusesTool } from "./listOrderStatuses.js";

/** All 8 integration tools. */
export function registerIntegrationTools(): Tool[] {
  return [
    listIntegrationsTool,
    getIntegrationConfigTool,
    getIntegrationByKeyTool,
    listIntegrationsByKeyTool,
    listExternalInvoicesTool,
    listExternalProductsTool,
    getExternalProductTool,
    listOrderStatusesTool,
  ];
}

export { listIntegrationsTool } from "./listIntegrations.js";
export { getIntegrationConfigTool } from "./getIntegrationConfig.js";
export { getIntegrationByKeyTool } from "./getIntegrationByKey.js";
export { listIntegrationsByKeyTool } from "./listIntegrationsByKey.js";
export { listExternalInvoicesTool } from "./listExternalInvoices.js";
export { listExternalProductsTool } from "./listExternalProducts.js";
export { getExternalProductTool } from "./getExternalProduct.js";
export { listOrderStatusesTool } from "./listOrderStatuses.js";
export { INTEGRATION_TYPES, INTEGRATION_KEY_NAMES } from "./constants.js";
