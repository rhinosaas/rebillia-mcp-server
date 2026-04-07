import { beforeEach, describe, expect, it, vi } from "vitest";
import { createSetupIntentTool } from "../../src/tools/gateways/createSetupIntent.js";

describe("Gateway tools", () => {
  let mockClient: {
    get: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      get: vi.fn(),
    };
  });

  describe("create_setup_intent", () => {
    it("calls GET /gateways/{companyGatewayId}/customers/{customerId}/setup_intent", async () => {
      mockClient.get.mockResolvedValueOnce({ id: "seti_123" });

      const result = await createSetupIntentTool.handler(mockClient as never, {
        companyGatewayId: 2,
        customerId: 3,
      });

      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(mockClient.get).toHaveBeenCalledWith(
        "/gateways/2/customers/3/setup_intent"
      );
      expect(result.isError).toBeFalsy();
    });
  });
});

