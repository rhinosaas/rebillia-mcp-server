/**
 * Product rate plan tools: list, get, create, update, delete, status, sync.
 */

import type { Tool } from "../types.js";
import { createRatePlanTool } from "./createRatePlan.js";
import { deleteRatePlanTool } from "./deleteRatePlan.js";
import { getRatePlanTool } from "./getRatePlan.js";
import { listRatePlansTool } from "./listRatePlans.js";
import { syncRatePlanTool } from "./syncRatePlan.js";
import { updateRatePlanStatusTool } from "./updateRatePlanStatus.js";
import { updateRatePlanTool } from "./updateRatePlan.js";

/** All 7 product rate plan tools. */
export function registerProductRatePlanTools(): Tool[] {
  return [
    listRatePlansTool,
    getRatePlanTool,
    createRatePlanTool,
    updateRatePlanTool,
    deleteRatePlanTool,
    updateRatePlanStatusTool,
    syncRatePlanTool,
  ];
}

export { listRatePlansTool } from "./listRatePlans.js";
export { getRatePlanTool } from "./getRatePlan.js";
export { createRatePlanTool } from "./createRatePlan.js";
export { updateRatePlanTool } from "./updateRatePlan.js";
export { deleteRatePlanTool } from "./deleteRatePlan.js";
export { updateRatePlanStatusTool } from "./updateRatePlanStatus.js";
export { syncRatePlanTool } from "./syncRatePlan.js";
