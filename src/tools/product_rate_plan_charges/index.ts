/**
 * Product rate plan charge tools: list, get, create, update, delete.
 */

import type { Tool } from "../types.js";
import { createRatePlanChargeTool } from "./createRatePlanCharge.js";
import { deleteRatePlanChargeTool } from "./deleteRatePlanCharge.js";
import { getRatePlanChargeTool } from "./getRatePlanCharge.js";
import { listRatePlanChargesTool } from "./listRatePlanCharges.js";
import { updateRatePlanChargeTool } from "./updateRatePlanCharge.js";

/** All 5 product rate plan charge tools. */
export function registerProductRatePlanChargeTools(): Tool[] {
  return [
    listRatePlanChargesTool,
    getRatePlanChargeTool,
    createRatePlanChargeTool,
    updateRatePlanChargeTool,
    deleteRatePlanChargeTool,
  ];
}

export { listRatePlanChargesTool } from "./listRatePlanCharges.js";
export { getRatePlanChargeTool } from "./getRatePlanCharge.js";
export { createRatePlanChargeTool } from "./createRatePlanCharge.js";
export { updateRatePlanChargeTool } from "./updateRatePlanCharge.js";
export { deleteRatePlanChargeTool } from "./deleteRatePlanCharge.js";
