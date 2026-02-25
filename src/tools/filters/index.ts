/**
 * Filter tools: list_filters, create_filter, list_filter_fields.
 */

import type { Tool } from "../types.js";
import { createFilterTool } from "./createFilter.js";
import { listFilterFieldsTool } from "./listFilterFields.js";
import { listFiltersTool } from "./listFilters.js";

/** All 3 filter tools. */
export function registerFilterTools(): Tool[] {
  return [listFiltersTool, createFilterTool, listFilterFieldsTool];
}

export { listFiltersTool } from "./listFilters.js";
export { createFilterTool } from "./createFilter.js";
export { listFilterFieldsTool } from "./listFilterFields.js";
export { FILTER_SECTIONS, OPERATOR_DISPLAY_NAMES } from "./constants.js";
