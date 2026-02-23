/**
 * Subscription tools: list, get, create, update, delete, status; billing preview and history; rate plans and charges.
 */

import type { Tool } from "../types.js";
import { addSubscriptionRatePlanChargeTool } from "./addSubscriptionRatePlanCharge.js";
import { addSubscriptionRatePlanTool } from "./addSubscriptionRatePlan.js";
import { createSubscriptionTool } from "./createSubscription.js";
import { deleteSubscriptionTool } from "./deleteSubscription.js";
import { getSubscriptionExternalInvoicesTool } from "./getSubscriptionExternalInvoices.js";
import { getSubscriptionInvoicesTool } from "./getSubscriptionInvoices.js";
import { getSubscriptionLogsTool } from "./getSubscriptionLogs.js";
import { getSubscriptionNextBillTool } from "./getSubscriptionNextBill.js";
import { getSubscriptionRatePlanChargeTool } from "./getSubscriptionRatePlanCharge.js";
import { getSubscriptionRatePlanTool } from "./getSubscriptionRatePlan.js";
import { getSubscriptionTool } from "./getSubscription.js";
import { getSubscriptionUpcomingChargesTool } from "./getSubscriptionUpcomingCharges.js";
import { listSubscriptionRatePlansTool } from "./listSubscriptionRatePlans.js";
import { listSubscriptionsTool } from "./listSubscriptions.js";
import { removeSubscriptionRatePlanChargeTool } from "./removeSubscriptionRatePlanCharge.js";
import { removeSubscriptionRatePlanTool } from "./removeSubscriptionRatePlan.js";
import { updateSubscriptionRatePlanChargeTool } from "./updateSubscriptionRatePlanCharge.js";
import { updateSubscriptionRatePlanTool } from "./updateSubscriptionRatePlan.js";
import { updateSubscriptionStatusTool } from "./updateSubscriptionStatus.js";
import { updateSubscriptionTool } from "./updateSubscription.js";

/** All 20 subscription tools. */
export function registerSubscriptionTools(): Tool[] {
  return [
    listSubscriptionsTool,
    getSubscriptionTool,
    createSubscriptionTool,
    updateSubscriptionTool,
    deleteSubscriptionTool,
    updateSubscriptionStatusTool,
    getSubscriptionNextBillTool,
    getSubscriptionUpcomingChargesTool,
    getSubscriptionInvoicesTool,
    getSubscriptionLogsTool,
    getSubscriptionExternalInvoicesTool,
    listSubscriptionRatePlansTool,
    getSubscriptionRatePlanTool,
    addSubscriptionRatePlanTool,
    updateSubscriptionRatePlanTool,
    removeSubscriptionRatePlanTool,
    getSubscriptionRatePlanChargeTool,
    addSubscriptionRatePlanChargeTool,
    updateSubscriptionRatePlanChargeTool,
    removeSubscriptionRatePlanChargeTool,
  ];
}

export { listSubscriptionsTool } from "./listSubscriptions.js";
export { getSubscriptionTool } from "./getSubscription.js";
export { createSubscriptionTool } from "./createSubscription.js";
export { updateSubscriptionTool } from "./updateSubscription.js";
export { deleteSubscriptionTool } from "./deleteSubscription.js";
export { updateSubscriptionStatusTool } from "./updateSubscriptionStatus.js";
export { getSubscriptionNextBillTool } from "./getSubscriptionNextBill.js";
export { getSubscriptionUpcomingChargesTool } from "./getSubscriptionUpcomingCharges.js";
export { getSubscriptionInvoicesTool } from "./getSubscriptionInvoices.js";
export { getSubscriptionLogsTool } from "./getSubscriptionLogs.js";
export { getSubscriptionExternalInvoicesTool } from "./getSubscriptionExternalInvoices.js";
export { listSubscriptionRatePlansTool } from "./listSubscriptionRatePlans.js";
export { getSubscriptionRatePlanTool } from "./getSubscriptionRatePlan.js";
export { addSubscriptionRatePlanTool } from "./addSubscriptionRatePlan.js";
export { updateSubscriptionRatePlanTool } from "./updateSubscriptionRatePlan.js";
export { removeSubscriptionRatePlanTool } from "./removeSubscriptionRatePlan.js";
export { getSubscriptionRatePlanChargeTool } from "./getSubscriptionRatePlanCharge.js";
export { addSubscriptionRatePlanChargeTool } from "./addSubscriptionRatePlanCharge.js";
export { updateSubscriptionRatePlanChargeTool } from "./updateSubscriptionRatePlanCharge.js";
export { removeSubscriptionRatePlanChargeTool } from "./removeSubscriptionRatePlanCharge.js";
