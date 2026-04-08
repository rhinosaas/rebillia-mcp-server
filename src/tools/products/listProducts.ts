import { z } from "zod";
import type { Tool } from "../types.js";
import type { Client } from "./helpers.js";
import { errorResult, handleToolCall } from "./helpers.js";
import * as productService from "../../services/productServices.js";

const schema = z.object({
  include: z.string().optional(),
  status: z.enum(["published", "draft", "archived", "disabled"]).optional(),
  name: z.string().optional(),
  category: z
    .enum(["baseProducts", "addOn", "bundleProduct", "miscellaneous", "service"])
    .optional(),
  orderBy: z.string().optional(),
  sortBy: z.enum(["ASC", "DESC"]).optional(),
  itemPerPage: z.number().int().min(1).optional(),
  pageNo: z.number().int().min(1).optional(),
});

const definition = {
  name: "list_products",
  description:
    "List products. GET /products. Optional: include (productRateplan, productRateplanCharge, chargeTier), status (published|draft|archived|disabled), name, category (baseProducts|addOn|bundleProduct|miscellaneous|service), orderBy, sortBy (ASC/DESC), itemPerPage, pageNo.",
  inputSchema: {
    type: "object" as const,
    properties: {
      include: {
        type: "string",
        description: "Comma-separated includes: productRateplan, productRateplanCharge, chargeTier",
      },
      status: {
        type: "string",
        enum: ["published", "draft", "archived", "disabled"],
        description: "Filter by product status",
      },
      name: { type: "string", description: "Filter by product name" },
      category: {
        type: "string",
        enum: ["baseProducts", "addOn", "bundleProduct", "miscellaneous", "service"],
        description: "Filter by product category",
      },
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
