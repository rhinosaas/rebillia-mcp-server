import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSubscriptionTool } from "../../src/tools/subscriptions/createSubscription.js";
import { getSubscriptionNextBillTool } from "../../src/tools/subscriptions/getSubscriptionNextBill.js";
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
    it("sends POST /subscriptions with nested body structure (ratePlan, ratePlanCharge)", async () => {
      const created = { id: "sub-1", name: "My Subscription", status: "active" };
      mockClient.post.mockResolvedValueOnce(created);

      const result = await createSubscriptionTool.handler(mockClient as never, {
        customerId: 100,
        name: "My Subscription",
        companyCurrencyId: 1,
        effectiveStartDate: "2025-01-15",
        ratePlan: [
          {
            productRatePlanId: 10,
            name: "Pro Plan",
            type: "ongoing",
            ratePlanCharge: [
              { quantity: 1, productRatePlanChargeId: 5 },
              {
                quantity: 2,
                name: "Add-on",
                chargeTier: [{ currency: "USD", price: 999 }],
                billCycleType: "chargeTriggerDay",
                endDateCondition: "subscriptionEnd",
              },
            ],
          },
        ],
      });

      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith("/subscriptions", {
        customerId: 100,
        name: "My Subscription",
        companyCurrencyId: 1,
        effectiveStartDate: "2025-01-15",
        ratePlan: [
          {
            productRatePlanId: 10,
            name: "Pro Plan",
            type: "ongoing",
            ratePlanCharge: [
              { quantity: 1, productRatePlanChargeId: 5 },
              {
                quantity: 2,
                name: "Add-on",
                chargeTier: [{ currency: "USD", price: 999 }],
                billCycleType: "chargeTriggerDay",
                endDateCondition: "subscriptionEnd",
              },
            ],
          },
        ],
      });
      expect(result.content).toHaveLength(1);
      expect(JSON.parse((result as { content: [{ text: string }] }).content[0].text)).toEqual(
        created
      );
    });

    it("sends optional top-level fields when provided", async () => {
      mockClient.post.mockResolvedValueOnce({ id: "sub-2" });

      await createSubscriptionTool.handler(mockClient as never, {
        customerId: 200,
        name: "Other Sub",
        companyCurrencyId: 2,
        effectiveStartDate: "2025-02-01",
        ratePlan: [{ productRatePlanId: 20 }],
        companyGatewayId: 3,
        customerPaymentMethodId: 4,
        billingAddressId: 5,
        shippingAddressId: 6,
      });

      expect(mockClient.post).toHaveBeenCalledWith("/subscriptions", {
        customerId: 200,
        name: "Other Sub",
        companyCurrencyId: 2,
        effectiveStartDate: "2025-02-01",
        ratePlan: [{ productRatePlanId: 20 }],
        companyGatewayId: 3,
        customerPaymentMethodId: 4,
        billingAddressId: 5,
        shippingAddressId: 6,
      });
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

  describe("get_subscription_next_bill", () => {
    it("calls GET /subscriptions/{subscriptionId}/nextBill", async () => {
      const nextBill = { total: 2999, dateDue: "2025-02-15", charges: [] };
      mockClient.get.mockResolvedValueOnce(nextBill);

      const result = await getSubscriptionNextBillTool.handler(mockClient as never, {
        subscriptionId: "sub-789",
      });

      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(mockClient.get).toHaveBeenCalledWith("/subscriptions/sub-789/nextBill");
      expect(JSON.parse((result as { content: [{ text: string }] }).content[0].text)).toEqual(
        nextBill
      );
    });

    it("appends include query param when provided", async () => {
      mockClient.get.mockResolvedValueOnce({});

      await getSubscriptionNextBillTool.handler(mockClient as never, {
        subscriptionId: "sub-999",
        include: "rateplan,rateplanCharge",
      });

      expect(mockClient.get).toHaveBeenCalledWith(
        "/subscriptions/sub-999/nextBill?include=rateplan%2CrateplanCharge"
      );
    });
  });
});
