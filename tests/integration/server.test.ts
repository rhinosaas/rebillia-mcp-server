import { beforeEach, describe, expect, it, vi } from "vitest";
import { executeTool, getToolDefinitions } from "../../src/tools/index.js";

describe("MCP server integration", () => {
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };
  });

  describe("tool registry", () => {
    it("returns tool definitions from getToolDefinitions()", () => {
      const tools = getToolDefinitions();
      expect(Array.isArray(tools)).toBe(true);
      expect(tools.length).toBeGreaterThan(0);
    });

    it("each tool has name, description, and inputSchema", () => {
      const tools = getToolDefinitions();
      for (const tool of tools) {
        expect(tool).toHaveProperty("name");
        expect(typeof tool.name).toBe("string");
        expect(tool.name.length).toBeGreaterThan(0);
        expect(tool).toHaveProperty("description");
        expect(typeof tool.description).toBe("string");
        expect(tool).toHaveProperty("inputSchema");
        expect(tool.inputSchema).toHaveProperty("type", "object");
        expect(tool.inputSchema).toHaveProperty("properties");
        expect(typeof tool.inputSchema.properties).toBe("object");
      }
    });

    it("registers expected tools", () => {
      const tools = getToolDefinitions();
      const names = tools.map((t) => t.name);
      expect(names).toContain("list_customers");
      expect(names).toContain("create_customer");
      expect(names).toContain("delete_customer");
      expect(names).toContain("create_subscription");
      expect(names).toContain("update_subscription_status");
      expect(names).toContain("get_subscription_next_bill");
      expect(names).toContain("get_api_docs");
    });
  });

  describe("tools/call via executeTool", () => {
    it("get_api_docs returns MCP response format (content array, type text)", async () => {
      const result = await executeTool("get_api_docs", {}, mockClient as never);
      expect(result).toBeDefined();
      expect(result).toHaveProperty("content");
      expect(Array.isArray(result!.content)).toBe(true);
      expect(result!.content.length).toBeGreaterThan(0);
      expect(result!.content[0]).toHaveProperty("type", "text");
      expect(result!.content[0]).toHaveProperty("text");
      expect(typeof result!.content[0].text).toBe("string");
      expect(result!.content[0].text.length).toBeGreaterThan(0);
      expect(result!.content[0].text).toMatch(/Rebillia|API|overview/i);
    });

    it("list_customers returns MCP response format when client returns data", async () => {
      const listResponse = {
        currentPageNumber: 1,
        itemsPerPage: 25,
        totalItems: 0,
        totalPages: 0,
        data: [],
      };
      mockClient.get.mockResolvedValueOnce(listResponse);

      const result = await executeTool("list_customers", {}, mockClient as never);

      expect(result).toBeDefined();
      expect(result).toHaveProperty("content");
      expect(Array.isArray(result!.content)).toBe(true);
      expect(result!.content[0]).toHaveProperty("type", "text");
      expect(result!.content[0]).toHaveProperty("text");
      const parsed = JSON.parse(result!.content[0].text);
      expect(parsed).toHaveProperty("data");
      expect(parsed).toHaveProperty("currentPageNumber", 1);
    });

    it("unknown tool returns undefined", async () => {
      const result = await executeTool("nonexistent_tool", {}, mockClient as never);
      expect(result).toBeUndefined();
    });

    it("MCP protocol compliance: tool result has content array and text items", async () => {
      mockClient.get.mockResolvedValueOnce({
        currentPageNumber: 1,
        itemsPerPage: 25,
        totalItems: 0,
        totalPages: 0,
        data: [],
      });
      const result = await executeTool("list_customers", {}, mockClient as never);
      expect(result).toBeDefined();
      expect(result).toHaveProperty("content");
      expect(Array.isArray(result!.content)).toBe(true);
      expect(result!.content.length).toBeGreaterThan(0);
      for (const item of result!.content) {
        expect(item).toHaveProperty("type", "text");
        expect(item).toHaveProperty("text");
        expect(typeof item.text).toBe("string");
      }
      if (result!.isError !== undefined) {
        expect(typeof result!.isError).toBe("boolean");
      }
    });

    it("at least one tool from each major category returns valid MCP response", async () => {
      const listResponse = {
        currentPageNumber: 1,
        itemsPerPage: 25,
        totalItems: 0,
        totalPages: 0,
        data: [],
      };
      mockClient.get.mockResolvedValue(listResponse);

      const categoryTools: Array<{ name: string; args: Record<string, unknown> }> = [
        { name: "list_customers", args: {} },
        { name: "list_products", args: {} },
        { name: "list_rate_plans", args: { productId: "1" } },
        { name: "list_rate_plan_charges", args: { ratePlanId: "1" } },
        { name: "list_subscriptions", args: {} },
        { name: "list_invoices", args: {} },
        { name: "list_transactions", args: {} },
        { name: "list_bill_runs", args: {} },
        { name: "list_gateways", args: {} },
        { name: "list_currencies", args: {} },
        { name: "list_integrations", args: {} },
        { name: "list_shipping_services", args: {} },
        { name: "list_filters", args: { section: "customers" } },
        { name: "get_api_docs", args: {} },
      ];

      for (const { name, args } of categoryTools) {
        const result = await executeTool(name, args, mockClient as never);
        expect(result, `Tool ${name} should return a result`).toBeDefined();
        expect(result!.content, `Tool ${name} should have content array`).toBeDefined();
        expect(Array.isArray(result!.content), `Tool ${name} content should be array`).toBe(true);
        expect(result!.content.length, `Tool ${name} should have at least one content item`).toBeGreaterThan(0);
        expect(result!.content[0], `Tool ${name} first content item`).toMatchObject({
          type: "text",
          text: expect.any(String),
        });
      }
    });
  });
});
