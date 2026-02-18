import type { PaginatedResponse } from "../types.js";
import type { Customer } from "../types.js";
import type { Tool } from "./types.js";

const definition = {
  name: "list_customers",
  description:
    "List customers with optional query parameters for filtering and pagination. See https://apiguide.rebillia.com/ for the Public API.",
  inputSchema: {
    type: "object" as const,
    properties: {
      pageNo: {
        type: "number",
        description: "Page number (default: 1)",
      },
      itemPerPage: {
        type: "number",
        description: "Items per page (default: 25, max 250)",
      },
      query: {
        type: "string",
        description:
          "Search term: matches firstName, lastName, email, and related company name/support pin",
      },
      status: {
        type: "string",
        description: "Filter by customer status: active, disabled, or archived",
      },
      sortBy: {
        type: "string",
        description: "Sort direction: ASC or DESC (default: ASC for customers)",
      },
      orderBy: {
        type: "string",
        description:
          "Column to sort by (e.g. firstName, lastName, email, createdAt). Default: firstName",
      },
      include: {
        type: "string",
        description:
          "Comma-separated includes: addressbook, paymentmethod, lastInvoice, subscriptions, unpaidInvoices, externalCustomers",
      },
      filterId: {
        type: "number",
        description: "Optional saved filter ID to apply predefined filters",
      },
    },
  },
};

async function handler(
  client: InstanceType<typeof import("../client.js").default>,
  args: Record<string, unknown> | undefined
) {
  const pageNo = args?.pageNo as number | undefined;
  const itemPerPage = args?.itemPerPage as number | undefined;
  const query = args?.query as string | undefined;
  const status = args?.status as string | undefined;
  const sortBy = args?.sortBy as string | undefined;
  const orderBy = args?.orderBy as string | undefined;
  const include = args?.include as string | undefined;
  const filterId = args?.filterId as number | undefined;

  const params = new URLSearchParams();
  if (pageNo) params.append("pageNo", pageNo.toString());
  if (itemPerPage) params.append("itemPerPage", itemPerPage.toString());
  if (query) params.append("query", query);
  if (status) params.append("status", status);
  if (sortBy) params.append("sortBy", sortBy);
  if (orderBy) params.append("orderBy", orderBy);
  if (include) params.append("include", include);
  if (filterId != null) params.append("filterId", filterId.toString());

  const queryString = params.toString();
  const endpoint = `/customers${queryString ? `?${queryString}` : ""}`;

  const response = await client.get<PaginatedResponse<Customer>>(endpoint);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}

export const listCustomersTool: Tool = {
  definition,
  handler,
};
