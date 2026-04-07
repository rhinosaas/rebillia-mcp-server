/**
 * Docs tools: get_api_docs (returns overview or other API documentation as markdown).
 */

import type { Tool } from "../types.js";
import { getApiDocsTool } from "./getApiDocs.js";

/** All docs tools. */
export function registerDocsTools(): Tool[] {
  return [getApiDocsTool];
}

export { getApiDocsTool } from "./getApiDocs.js";
