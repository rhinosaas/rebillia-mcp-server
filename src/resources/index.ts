/**
 * Rebillia MCP resources – API documentation for understanding the Rebillia Public API.
 * Content is derived from https://apiguide.rebillia.com/
 */

import { apiResources, RESOURCE_URI_PREFIX } from "./api-docs.js";

export type { ApiResource } from "./api-docs.js";

/** List all available API documentation resources */
export function listResources(): Array<{
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}> {
  return apiResources.map(({ uri, name, description, mimeType }) => ({
    uri,
    name,
    description,
    mimeType,
  }));
}

/** Read a resource by URI. Returns contents array for MCP or null if not found. */
export function readResource(uri: string): {
  contents: Array<{ uri: string; mimeType: string; text: string }>;
} | null {
  const resource = apiResources.find((r) => r.uri === uri);
  if (!resource) return null;
  return {
    contents: [
      {
        uri: resource.uri,
        mimeType: resource.mimeType,
        text: resource.text,
      },
    ],
  };
}

export { RESOURCE_URI_PREFIX, apiResources } from "./api-docs.js";
