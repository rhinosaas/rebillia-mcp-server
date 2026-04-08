import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSubscriptionTool } from "../../src/tools/subscriptions/createSubscription.js";
import { listSubscriptionRatePlansTool } from "../../src/tools/subscriptions/listSubscriptionRatePlans.js";
import { listSubscriptionsTool } from "../../src/tools/subscriptions/listSubscriptions.js";
import { updateSubscriptionStatusTool } from "../../src/tools/subscriptions/updateSubscriptionStatus.js";

describe("Subscription tools", () => {
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

  describe("create_subscription", () => {
    it("sends POST /subscriptions/from-product-rateplan with simplified body", async () => {
      const created = { id: "sub-1", status: "active" };
      mockClient.post.mockResolvedValueOnce(created);

      const result = await createSubscriptionTool.handler(mockClient as never, {
        productRatePlanId: 10,
        customerId: 100,
        customerPaymentMethodId: 4,
        billingAddressId: 5,
        effectiveStartDate: "2025-01-15",
      });

      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith("/subscriptions/from-product-rateplan", {
        productRatePlanId: 10,
        customerId: 100,
        customerPaymentMethodId: 4,
        billingAddressId: 5,
        effectiveStartDate: "2025-01-15",
      });
      expect(result.content).toHaveLength(1);
      expect(JSON.parse(result.content[0].text)).toEqual(created);
    });
  });

  describe("update_subscription_status", () => {
    it("calls PUT /subscriptions/{subscriptionId}/status with status body", async () => {
      mockClient.put.mockResolvedValueOnce({ id: "sub-123", status: "archived" });

      const result = await updateSubscriptionStatusTool.handler(mockClient as never, {
        subscriptionId: "sub-123",
        status: "archived",
      });

      expect(mockClient.put).toHaveBeenCalledTimes(1);
      expect(mockClient.put).toHaveBeenCalledWith("/subscriptions/sub-123/status", {
        status: "archived",
      });
      expect(result.content).toHaveLength(1);
    });

    it("accepts all status values", async () => {
      for (const status of ["active", "paused", "archived", "requestPayment"] as const) {
        mockClient.put.mockResolvedValueOnce({ status });
        await updateSubscriptionStatusTool.handler(mockClient as never, {
          subscriptionId: "sub-456",
          status,
        });
        expect(mockClient.put).toHaveBeenLastCalledWith("/subscriptions/sub-456/status", {
          status,
        });
      }
    });
  });

  describe("list_subscriptions contract", () => {
    it("documents new filter params with enum/format metadata", () => {
      const properties = listSubscriptionsTool.definition.inputSchema.properties;

      expect(properties).toHaveProperty("status");
      expect(properties.status).toMatchObject({
        type: "string",
        enum: ["active", "paused", "requestPayment", "archived"],
      });

      expect(properties).toHaveProperty("customerId");
      expect(properties.customerId).toMatchObject({
        type: "integer",
        format: "int64",
      });

      expect(properties).toHaveProperty("companyGatewayId");
      expect(properties.companyGatewayId).toMatchObject({
        type: "integer",
        format: "int64",
      });

      expect(properties).toHaveProperty("dateFrom");
      expect(properties.dateFrom).toMatchObject({
        type: "string",
        format: "date",
        example: "2026-01-01",
      });

      expect(properties).toHaveProperty("dateTo");
      expect(properties.dateTo).toMatchObject({
        type: "string",
        format: "date",
        example: "2026-01-31",
      });
    });

    it("accepts combined filters and forwards them in query string", async () => {
      mockClient.get.mockResolvedValueOnce({
        currentPageNumber: 1,
        itemsPerPage: 25,
        totalItems: 0,
        totalPages: 0,
        data: [],
      });

      await listSubscriptionsTool.handler(mockClient as never, {
        status: "paused",
        customerId: 123,
        dateFrom: "2026-01-01",
        dateTo: "2026-01-31",
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        "/subscriptions?status=paused&customerId=123&dateFrom=2026-01-01&dateTo=2026-01-31"
      );
    });
  });

  describe("list_subscription_rate_plans", () => {
    it("normalizes status/type filters and forwards them", async () => {
      mockClient.get.mockResolvedValueOnce({
        currentPageNumber: 1,
        itemsPerPage: 25,
        totalItems: 0,
        totalPages: 0,
        data: [],
      });

      await listSubscriptionRatePlansTool.handler(mockClient as never, {
        subscriptionId: "sub-123",
        status: "AcTiVe",
        type: "PrePaid",
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        "/subscriptions/sub-123/rateplans?status=active&type=prepaid"
      );
    });

    it("rejects unsupported status values", async () => {
      const result = await listSubscriptionRatePlansTool.handler(mockClient as never, {
        subscriptionId: "sub-123",
        status: "paused",
      });

      expect(mockClient.get).not.toHaveBeenCalled();
      expect(result.isError).toBe(true);
      expect((result as { content: [{ text: string }] }).content[0].text).toMatch(
        /invalid enum value/i
      );
    });
  });
});
