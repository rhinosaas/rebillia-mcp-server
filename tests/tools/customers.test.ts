import { beforeEach, describe, expect, it, vi } from "vitest";
import { createCustomerTool } from "../../src/tools/customers/createCustomer.js";
import { deleteCustomerTool } from "../../src/tools/customers/deleteCustomer.js";
import { listCustomersTool } from "../../src/tools/customers/listCustomers.js";

describe("Customer tools", () => {
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

  describe("list_customers", () => {
    it("calls GET /customers with params", async () => {
      const listResponse = {
        currentPageNumber: 1,
        itemsPerPage: 25,
        totalItems: 0,
        totalPages: 0,
        data: [],
      };
      mockClient.get.mockResolvedValueOnce(listResponse);

      const result = await listCustomersTool.handler(mockClient as never, {
        pageNo: 2,
        itemPerPage: 10,
        query: "john",
        status: "active",
        sortBy: "DESC",
        orderBy: "createdAt",
        include: "addressbook,subscriptions",
        filterId: 5,
      });

      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(mockClient.get).toHaveBeenCalledWith(
        "/customers?pageNo=2&itemPerPage=10&query=john&status=active&sortBy=DESC&orderBy=createdAt&include=addressbook%2Csubscriptions&filterId=5"
      );
      expect(result.content).toHaveLength(1);
      expect(JSON.parse((result as { content: [{ text: string }] }).content[0].text)).toEqual(
        listResponse
      );
    });

    it("calls GET /customers with no params (empty query string)", async () => {
      mockClient.get.mockResolvedValueOnce({
        currentPageNumber: 1,
        itemsPerPage: 25,
        totalItems: 0,
        totalPages: 0,
        data: [],
      });

      await listCustomersTool.handler(mockClient as never, {});

      expect(mockClient.get).toHaveBeenCalledTimes(1);
      expect(mockClient.get).toHaveBeenCalledWith("/customers");
    });
  });

  describe("create_customer", () => {
    it("calls POST /customers with body", async () => {
      const created = {
        id: "cust-123",
        customerId: "cust-123",
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
      };
      mockClient.post.mockResolvedValueOnce(created);

      const result = await createCustomerTool.handler(mockClient as never, {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
      });

      expect(mockClient.post).toHaveBeenCalledTimes(1);
      expect(mockClient.post).toHaveBeenCalledWith("/customers", {
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
      });
      expect(result.content).toHaveLength(1);
      expect(JSON.parse((result as { content: [{ text: string }] }).content[0].text)).toEqual(
        created
      );
    });

    it("calls POST /customers with optional fields in body", async () => {
      mockClient.post.mockResolvedValueOnce({ id: "cust-456" });

      await createCustomerTool.handler(mockClient as never, {
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        businessName: "Acme Inc",
        preferredCurrency: "USD",
        taxExempt: true,
      });

      expect(mockClient.post).toHaveBeenCalledWith("/customers", {
        firstName: "John",
        lastName: "Smith",
        email: "john@example.com",
        businessName: "Acme Inc",
        preferredCurrency: "USD",
        taxExempt: true,
      });
    });

    it("returns error when required fields missing", async () => {
      const result = await createCustomerTool.handler(mockClient as never, {
        firstName: "Jane",
        // missing lastName, email
      });

      expect(mockClient.post).not.toHaveBeenCalled();
      expect(result.isError).toBe(true);
      expect((result as { content: [{ text: string }] }).content[0].text).toMatch(
        /lastName|email|required/i
      );
    });
  });

  describe("delete_customer", () => {
    it("calls DELETE with correct endpoint", async () => {
      mockClient.delete.mockResolvedValueOnce({});

      const result = await deleteCustomerTool.handler(mockClient as never, {
        customerId: "cust-789",
      });

      expect(mockClient.delete).toHaveBeenCalledTimes(1);
      expect(mockClient.delete).toHaveBeenCalledWith("/customers/cust-789");
      expect(result.content).toHaveLength(1);
    });

    it("returns error when customerId missing", async () => {
      const result = await deleteCustomerTool.handler(mockClient as never, {});

      expect(mockClient.delete).not.toHaveBeenCalled();
      expect(result.isError).toBe(true);
    });
  });
});
