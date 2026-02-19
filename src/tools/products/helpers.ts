import type { ToolResult } from "../types.js";

export type Client = InstanceType<typeof import("../../client.js").default>;

export function errorResult(message: string): ToolResult {
  return {
    content: [{ type: "text" as const, text: message }],
    isError: true,
  };
}

export function successResult(data: unknown): ToolResult {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(data, null, 2),
      },
    ],
  };
}

export async function handleToolCall<T>(fn: () => Promise<T>): Promise<ToolResult> {
  try {
    const data = await fn();
    return successResult(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return errorResult(`Error: ${message}`);
  }
}
