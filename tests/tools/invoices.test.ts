import { describe, expect, it, vi } from "vitest";
import { createInvoiceTool } from "../../src/tools/invoices/createInvoice.js";

describe("Invoice tools", () => {
  describe("create_invoice", () => {
    it("rejects when dateDue/dateFrom/dateTo are missing", async () => {
      const mockClient = {
        post: vi.fn(),
      };

      const result = await createInvoiceTool.handler(mockClient as never, {
        companyCurrencyId: 144,
        companyGatewayId: 9,
        customerId: 517,
        paymentMethodId: 1067,
        paymentType: "thirdPartyPaymentProvider",
        comments: "testing claude",
        detail: [
          { description: "item 1", qty: 2, amount: "41.00" },
          { description: "item 2", qty: 1, amount: "2.00" },
        ],
      });

      expect(mockClient.post).not.toHaveBeenCalled();
      expect(result.isError).toBe(true);
      const text = (result as any)?.content?.[0]?.text ?? "";
      expect(text).toMatch(/dateDue is required|dateDue.*required/i);
      expect(text).toMatch(/dateFrom is required|dateFrom.*required/i);
      expect(text).toMatch(/dateTo is required|dateTo.*required/i);
    });

    it("omits customerPaymentMethodId from payload and sends cents amounts", async () => {
      const mockClient = {
        post: vi.fn().mockResolvedValueOnce({ id: "inv-1" }),
      };

      const result = await createInvoiceTool.handler(mockClient as never, {
        companyCurrencyId: 144,
        companyGatewayId: 9,
        customerId: 517,
        paymentMethodId: 1067,
        customerPaymentMethodId: 1067,
        paymentType: "thirdPartyPaymentProvider",
        dateFrom: "2026-03-01",
        dateTo: "2026-03-31",
        dateDue: "2026-03-18",
        comments: "testing claude",
        detail: [
          { description: "item 1", qty: 2, amount: "41.00" },
          { description: "item 2", qty: 1, amount: "2.00" },
        ],
      });

      expect(mockClient.post).toHaveBeenCalledTimes(1);
      const postedBody = (mockClient.post as any).mock.calls[0][1];

      expect(postedBody).toHaveProperty("detail");
      expect(postedBody.detail[0].amount).toBe(4100);
      expect(postedBody.detail[1].amount).toBe(200);
      expect(postedBody).not.toHaveProperty("customerPaymentMethodId");
      expect(result.isError).toBeFalsy();
    });
  });
});

