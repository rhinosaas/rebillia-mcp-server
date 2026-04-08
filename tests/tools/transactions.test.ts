import { beforeEach, describe, expect, it, vi } from "vitest";
import { listTransactionsTool } from "../../src/tools/transactions/listTransactions.js";

describe("Transaction tools", () => {
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
    };
  });

  describe("list_transactions", () => {
    it("forwards transaction filters and pagination", async () => {
      const listResponse = {
        currentPageNumber: 1,
        itemsPerPage: 25,
        totalItems: 0,
        totalPages: 0,
        data: [],
      };
      mockClient.get.mockResolvedValueOnce(listResponse);

      const result = await listTransactionsTool.handler(mockClient as never, {
        customerId: 123,
        invoiceId: 456,
        status: "awaitingForSettlement",
        type: "refund",
        dateFrom: "2026-04-01",
        dateTo: "2026-04-08",
        companyGatewayId: 99,
        orderBy: "createdAt",
        sortBy: "DESC",
        itemPerPage: 10,
        pageNo: 2,
      });

      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(mockClient.get).toHaveBeenCalledWith(
        "/transactions?customerId=123&invoiceId=456&status=awaitingForSettlement&type=refund&dateFrom=2026-04-01&dateTo=2026-04-08&companyGatewayId=99&orderBy=createdAt&sortBy=DESC&itemPerPage=10&pageNo=2"
      );
      expect(result.isError).toBeFalsy();
    });

    it("rejects invalid status values", async () => {
      const result = await listTransactionsTool.handler(mockClient as never, {
        status: "failed",
      });

      expect(mockClient.get).not.toHaveBeenCalled();
      expect(result.isError).toBe(true);
      expect((result as { content: [{ text: string }] }).content[0].text).toMatch(
        /invalid enum value/i
      );
    });

    it("rejects invalid type values", async () => {
      const result = await listTransactionsTool.handler(mockClient as never, {
        type: "chargeback",
      });

      expect(mockClient.get).not.toHaveBeenCalled();
      expect(result.isError).toBe(true);
      expect((result as { content: [{ text: string }] }).content[0].text).toMatch(
        /invalid enum value/i
      );
    });
  });
});
