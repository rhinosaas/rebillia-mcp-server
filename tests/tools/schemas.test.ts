import { describe, expect, it } from "vitest";
import { getToolDefinitions } from "../../src/tools/index.js";

const FORBIDDEN_CARD_FIELDS = [
  "cardNumber",
  "cvv",
  "expirationMonth",
  "expirationYear",
] as const;

function collectPropertyKeys(
  props: Record<string, { type?: string; properties?: Record<string, unknown> }>,
  prefix = ""
): string[] {
  const keys: string[] = [];
  for (const [key, value] of Object.entries(props)) {
    keys.push(prefix ? `${prefix}.${key}` : key);
    if (value && typeof value === "object" && value.properties && typeof value.properties === "object") {
      keys.push(...collectPropertyKeys(value.properties as Record<string, { type?: string; properties?: Record<string, unknown> }>, prefix ? `${prefix}.${key}` : key));
    }
  }
  return keys;
}

describe("Tool schemas (no raw card data)", () => {
  it("no MCP tool inputSchema exposes raw card fields (cardNumber, cvv, expirationMonth, expirationYear)", () => {
    const definitions = getToolDefinitions();
    const violations: { tool: string; field: string }[] = [];

    for (const def of definitions) {
      const props = def.inputSchema?.properties;
      if (!props || typeof props !== "object") continue;
      const keys = collectPropertyKeys(props);
      for (const key of keys) {
        const baseKey = key.split(".").pop() ?? key;
        if (FORBIDDEN_CARD_FIELDS.includes(baseKey as (typeof FORBIDDEN_CARD_FIELDS)[number])) {
          violations.push({ tool: def.name, field: key });
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
