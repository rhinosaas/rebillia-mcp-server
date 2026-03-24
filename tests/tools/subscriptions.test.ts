import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSubscriptionTool } from "../../src/tools/subscriptions/createSubscription.js";
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
});
