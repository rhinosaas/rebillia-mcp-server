import type { ToolResult } from "../types.js";

export type Client = InstanceType<typeof import("../../client.js").default>;

export function errorResult(message: string): ToolResult {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}
