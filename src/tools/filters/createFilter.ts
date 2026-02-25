import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import { FILTER_SECTIONS } from "./constants.js";
import * as filterService from "../../services/filterServices.js";

const settingValueSchema = z.object({
  value: z.union([z.string(), z.number()]).optional(),
});

const ruleSchema = z.object({
  operatorId: z.number().int("operatorId is required"),
  operatorDisplayName: z.string().optional(),
  attributeId: z.number().int("attributeId is required"),
  settingValues: z.array(settingValueSchema).default([]),
});

const schema = z.object({
  displayName: z.string().min(1, "displayName is required"),
  section: z.enum(FILTER_SECTIONS, {
    errorMap: () => ({ message: "section must be a valid section (e.g. subscriptions, invoices, customers, products)" }),
  }),
  isDefault: z.boolean({ required_error: "isDefault is required" }),
  rules: z.array(ruleSchema).min(1, "rules must have at least one rule"),
});

const sectionsDesc = FILTER_SECTIONS.slice(0, 8).join(", ") + ", ...";

const definition = {
  name: "create_filter",
  description: `Create a company filter. POST /companies/filters. Required: displayName, section, isDefault, rules (array of { operatorId, attributeId, settingValues }). Optional per rule: operatorDisplayName. Section: ${sectionsDesc}`,
  inputSchema: {
    type: "object" as const,
    properties: {
      displayName: { type: "string", description: "Display name (required)" },
      section: {
        type: "string",
        description: "Section (required). One of: subscriptions, invoices, customers, products, orders, etc.",
      },
      isDefault: { type: "boolean", description: "Set as default filter (required)" },
      rules: {
        type: "array",
        description:
          "Rules array (required). Each: operatorId (number), attributeId (number), settingValues (array of { value }), optional operatorDisplayName",
      },
    },
    required: ["displayName", "section", "isDefault", "rules"],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; "));
  }
  const body = {
    displayName: parsed.data.displayName,
    section: parsed.data.section,
    isDefault: parsed.data.isDefault,
    rules: parsed.data.rules.map((r) => ({
      operatorId: r.operatorId,
      operatorDisplayName: r.operatorDisplayName,
      attributeId: r.attributeId,
      settingValues: r.settingValues ?? [],
    })),
  };
  return handleToolCall(() => filterService.createFilter(client, body));
}

export const createFilterTool: Tool = {
  definition,
  handler,
};
