import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult } from "./helpers.js";
import { DOC_KEYS, getDocContent } from "../../resources/api-docs.js";

const schema = z.object({
  doc: z.enum(DOC_KEYS).optional().default("overview"),
});

const definition = {
  name: "get_api_docs",
  description:
    "Get Rebillia API documentation as markdown. Returns the overview by default so Claude can read base URLs, auth, pagination, dates, amounts without fetching external URLs. Optional: doc (overview | models | subscription-statuses | charge-types).",
  inputSchema: {
    type: "object" as const,
    properties: {
      doc: {
        type: "string",
        description:
          "Which doc to return. Default: overview. Options: overview, models, subscription-statuses, charge-types",
      },
    },
    required: [],
  },
};

async function handler(_client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  const docKey = parsed.data.doc;
  const text = getDocContent(docKey);
  if (text == null) {
    return errorResult(`Unknown doc: ${docKey}. Use one of: ${DOC_KEYS.join(", ")}`);
  }
  return {
    content: [{ type: "text" as const, text }],
  };
}

export const getApiDocsTool: Tool = {
  definition,
  handler,
};
