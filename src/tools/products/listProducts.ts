import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as productService from "../../services/productServices.js";

const schema = z.object({
  include: z.string().optional(),
  orderBy: z.string().optional(),
  sortBy: z.enum(["ASC", "DESC"]).optional(),
  itemPerPage: z.number().int().min(1).optional(),
  pageNo: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_products",
  description:
    "List products. GET /products. Optional: include, orderBy, sortBy (ASC/DESC), itemPerPage, pageNo.",
  inputSchema: {
    type: "object" as const,
    properties: {
      include: { type: "string", description: "Comma-separated attributes to include" },
      orderBy: { type: "string", description: "Sort column" },
      sortBy: { type: "string", description: "ASC or DESC" },
      itemPerPage: { type: "number", description: "Items per page" },
      pageNo: { type: "number", description: "Page number (1-based)" },
    },
    required: [],
  },
};

async function handler(client: Client, args: Record<string, unknown> | undefined) {
  const parsed = schema.safeParse(args);
  if (!parsed.success) {
    return errorResult(parsed.error.errors.map((e) => e.message).join("; "));
  }
  return handleToolCall(() => productService.listProducts(client, parsed.data));
}

export const listProductsTool: Tool = {
  definition,
  handler,
};
