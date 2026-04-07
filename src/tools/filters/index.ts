/**
 * Filter tools: list_filters, create_filter, list_filter_fields, remove_filter.
 */

import type { Tool } from "../types.js";
import { createFilterTool } from "./createFilter.js";
import { listFilterFieldsTool } from "./listFilterFields.js";
import { listFiltersTool } from "./listFilters.js";
import { removeFilterTool } from "./removeFilter.js";

/** All 4 filter tools. */
export function registerFilterTools(): Tool[] {
  return [listFiltersTool, createFilterTool, listFilterFieldsTool, removeFilterTool];
}

export { listFiltersTool } from "./listFilters.js";
export { createFilterTool } from "./createFilter.js";
export { listFilterFieldsTool } from "./listFilterFields.js";
export { removeFilterTool } from "./removeFilter.js";
export { FILTER_SECTIONS, OPERATOR_DISPLAY_NAMES } from "./constants.js";
