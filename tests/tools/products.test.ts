import { beforeEach, describe, expect, it, vi } from "vitest";
import { listProductsTool } from "../../src/tools/products/listProducts.js";

describe("Product tools", () => {
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
    };
  });

  describe("list_products", () => {
    it("forwards new status, name, and category filters", async () => {
      const listResponse = {
        currentPageNumber: 1,
        itemsPerPage: 25,
        totalItems: 0,
        totalPages: 0,
        data: [],
      };
      mockClient.get.mockResolvedValueOnce(listResponse);

      const result = await listProductsTool.handler(mockClient as never, {
        include: "productRateplan",
        status: "draft",
        name: "Starter",
        category: "bundleProduct",
        orderBy: "createdAt",
        sortBy: "DESC",
        itemPerPage: 10,
        pageNo: 2,
      });

      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(mockClient.get).toHaveBeenCalledWith(
        "/products?include=productRateplan&status=draft&name=Starter&category=bundleProduct&orderBy=createdAt&sortBy=DESC&itemPerPage=10&pageNo=2"
      );
      expect(result.isError).toBeFalsy();
    });

    it("rejects invalid category values", async () => {
      const result = await listProductsTool.handler(mockClient as never, {
        category: "addon",
      });

      expect(mockClient.get).not.toHaveBeenCalled();
      expect(result.isError).toBe(true);
      expect((result as { content: [{ text: string }] }).content[0].text).toMatch(
        /invalid enum value/i
      );
    });
  });
});
