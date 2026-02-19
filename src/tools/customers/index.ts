/**
 * Customer tools: list, get, create, update, delete, invoices, subscriptions, logs, addresses, payment methods.
 * Storage/registry for all customer-related MCP tools.
 */

import type { Tool } from "../types.js";
import { createCustomerAddressTool } from "./createCustomerAddress.js";
import { createCustomerChargeCreditTool } from "./createCustomerChargeCredit.js";
import { createCustomerPaymentMethodTool } from "./createCustomerPaymentMethod.js";
import { createCustomerTool } from "./createCustomer.js";
import { deleteCustomerAddressTool } from "./deleteCustomerAddress.js";
import { deleteCustomerChargeCreditTool } from "./deleteCustomerChargeCredit.js";
import { deleteCustomerPaymentMethodTool } from "./deleteCustomerPaymentMethod.js";
import { deleteCustomerTool } from "./deleteCustomer.js";
import { getCustomerAddressTool } from "./getCustomerAddress.js";
import { getCustomerPaymentMethodTool } from "./getCustomerPaymentMethod.js";
import { getCustomerInvoicesTool } from "./getCustomerInvoices.js";
import { getCustomerLogsTool } from "./getCustomerLogs.js";
import { getCustomerSubscriptionsTool } from "./getCustomerSubscriptions.js";
import { getCustomerTool } from "./getCustomer.js";
import { listCustomerAddressesTool } from "./listCustomerAddresses.js";
import { listCustomerChargesCreditsTool } from "./listCustomerChargesCredits.js";
import { listCustomerPaymentMethodsTool } from "./listCustomerPaymentMethods.js";
import { listCustomersTool } from "./listCustomers.js";
import { updateCustomerAddressTool } from "./updateCustomerAddress.js";
import { updateCustomerPaymentMethodTool } from "./updateCustomerPaymentMethod.js";
import { updateCustomerTool } from "./updateCustomer.js";

/** All 18 customer tools. Register with the main tool registry. */
export function registerCustomerTools(): Tool[] {
  return [
    listCustomersTool,
    getCustomerTool,
    createCustomerTool,
    updateCustomerTool,
    deleteCustomerTool,
    getCustomerInvoicesTool,
    getCustomerSubscriptionsTool,
    getCustomerLogsTool,
    listCustomerAddressesTool,
    getCustomerAddressTool,
    createCustomerAddressTool,
    updateCustomerAddressTool,
    deleteCustomerAddressTool,
    listCustomerPaymentMethodsTool,
    getCustomerPaymentMethodTool,
    createCustomerPaymentMethodTool,
    updateCustomerPaymentMethodTool,
    deleteCustomerPaymentMethodTool,
    listCustomerChargesCreditsTool,
    createCustomerChargeCreditTool,
    deleteCustomerChargeCreditTool,
  ];
}

export { listCustomersTool } from "./listCustomers.js";
export { getCustomerTool } from "./getCustomer.js";
export { createCustomerTool } from "./createCustomer.js";
export { updateCustomerTool } from "./updateCustomer.js";
export { deleteCustomerTool } from "./deleteCustomer.js";
export { getCustomerInvoicesTool } from "./getCustomerInvoices.js";
export { getCustomerSubscriptionsTool } from "./getCustomerSubscriptions.js";
export { getCustomerLogsTool } from "./getCustomerLogs.js";
export { listCustomerAddressesTool } from "./listCustomerAddresses.js";
export { getCustomerAddressTool } from "./getCustomerAddress.js";
export { createCustomerAddressTool } from "./createCustomerAddress.js";
export { updateCustomerAddressTool } from "./updateCustomerAddress.js";
export { deleteCustomerAddressTool } from "./deleteCustomerAddress.js";
export { listCustomerPaymentMethodsTool } from "./listCustomerPaymentMethods.js";
export { getCustomerPaymentMethodTool } from "./getCustomerPaymentMethod.js";
export { createCustomerPaymentMethodTool } from "./createCustomerPaymentMethod.js";
export { updateCustomerPaymentMethodTool } from "./updateCustomerPaymentMethod.js";
export { deleteCustomerPaymentMethodTool } from "./deleteCustomerPaymentMethod.js";
export { listCustomerChargesCreditsTool } from "./listCustomerChargesCredits.js";
export { createCustomerChargeCreditTool } from "./createCustomerChargeCredit.js";
export { deleteCustomerChargeCreditTool } from "./deleteCustomerChargeCredit.js";
