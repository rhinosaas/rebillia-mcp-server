import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RebilliaClient from "../src/client";

describe("RebilliaClient", () => {
  const apiKey = "test-api-key";
  const baseUrl = "https://api.rebillia.com/v1";

  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("X-AUTH-TOKEN header", () => {
    it("sends X-AUTH-TOKEN on GET requests", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ data: [] }), { status: 200 })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      await client.get("/customers");
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/customers`,
        expect.objectContaining({
          method: "GET",
          headers: expect.objectContaining({
            "X-AUTH-TOKEN": apiKey,
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("sends X-AUTH-TOKEN on POST requests", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "1" }), { status: 201 })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      await client.post("/customers", { name: "Test" });
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/customers`,
        expect.objectContaining({
          method: "POST",
          headers: expect.objectContaining({
            "X-AUTH-TOKEN": apiKey,
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("sends X-AUTH-TOKEN on PUT requests", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "1" }), { status: 200 })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      await client.put("/customers/1", { name: "Updated" });
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/customers/1`,
        expect.objectContaining({
          method: "PUT",
          headers: expect.objectContaining({
            "X-AUTH-TOKEN": apiKey,
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("sends X-AUTH-TOKEN on DELETE requests", async () => {
      fetchMock.mockResolvedValueOnce(new Response(undefined, { status: 204 }));
      const client = new RebilliaClient(apiKey, baseUrl);
      await client.delete("/customers/1");
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/customers/1`,
        expect.objectContaining({
          method: "DELETE",
          headers: expect.objectContaining({
            "X-AUTH-TOKEN": apiKey,
            "Content-Type": "application/json",
          }),
        })
      );
    });
  });

  describe("query param appending", () => {
    it("passes endpoint with query string to fetch (full URL)", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ currentPageNumber: 1, data: [] }), {
          status: 200,
        })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      await client.get("/customers?pageNo=2&itemPerPage=10");
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/customers?pageNo=2&itemPerPage=10`,
        expect.any(Object)
      );
    });
  });

  describe("POST JSON body", () => {
    it("sends JSON stringified body on POST", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "123" }), { status: 201 })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      const body = { firstName: "Jane", lastName: "Doe", email: "jane@example.com" };
      await client.post("/customers", body);
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/customers`,
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify(body),
        })
      );
    });

    it("sends undefined body when no data provided", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({}), { status: 200 })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      await client.post("/customers");
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/customers`,
        expect.objectContaining({
          body: undefined,
        })
      );
    });
  });

  describe("PUT JSON body", () => {
    it("sends JSON stringified body on PUT", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response(JSON.stringify({ id: "1" }), { status: 200 })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      const body = { name: "Updated Name" };
      await client.put("/customers/1", body);
      expect(fetchMock).toHaveBeenCalledWith(
        `${baseUrl}/customers/1`,
        expect.objectContaining({
          method: "PUT",
          body: JSON.stringify(body),
        })
      );
    });
  });

  describe("error handling", () => {
    it("throws descriptive error on 400 Bad Request", async () => {
      const errorBody = '{"code":"validation_error","message":"Invalid data"}';
      fetchMock.mockResolvedValueOnce(
        new Response(errorBody, { status: 400, statusText: "Bad Request" })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      await expect(client.get("/customers/invalid")).rejects.toThrow(
        /Rebillia API error \(400 Bad Request\): .*Invalid data/
      );
    });

    it("throws descriptive error on 401 Unauthorized", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response("Unauthorized", { status: 401, statusText: "Unauthorized" })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      await expect(client.post("/customers", {})).rejects.toThrow(
        /Rebillia API error \(401 Unauthorized\): Unauthorized/
      );
    });

    it("throws descriptive error on 404 Not Found", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response('{"error":"Not found"}', {
          status: 404,
          statusText: "Not Found",
        })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      await expect(client.get("/customers/999")).rejects.toThrow(
        /Rebillia API error \(404 Not Found\)/
      );
    });

    it("throws descriptive error on 500 Internal Server Error", async () => {
      fetchMock.mockResolvedValueOnce(
        new Response("Internal Server Error", {
          status: 500,
          statusText: "Internal Server Error",
        })
      );
      const client = new RebilliaClient(apiKey, baseUrl);
      await expect(client.get("/customers")).rejects.toThrow(
        /Rebillia API error \(500 Internal Server Error\): Internal Server Error/
      );
    });
  });
});
