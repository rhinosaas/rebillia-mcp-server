import type { Customer } from "../types.js";
import type { Tool } from "./types.js";

const definition = {
  name: "get_customer",
  description: "Get a specific customer by ID with optional related data includes",
  inputSchema: {
    type: "object" as const,
    properties: {
      id: {
        type: "string",
        description: "Customer ID",
      },
      includeAddresses: {
        type: "boolean",
        description: "Include customer addresses",
      },
      includePaymentMethods: {
        type: "boolean",
        description: "Include payment methods",
      },
    },
    required: ["id"],
  },
};

async function handler(
  client: InstanceType<typeof import("../client.js").default>,
  args: Record<string, unknown> | undefined
) {
  const id = args?.id as string | undefined;
  const includeAddresses = args?.includeAddresses as boolean | undefined;
  const includePaymentMethods = args?.includePaymentMethods as boolean | undefined;

  if (!id) {
    return {
      content: [{ type: "text" as const, text: "Error: id parameter is required" }],
      isError: true,
    };
  }

  const includes: string[] = [];
  if (includeAddresses) includes.push("addressbook");
  if (includePaymentMethods) includes.push("paymentmethod");

  const params = new URLSearchParams();
  if (includes.length > 0) params.append("include", includes.join(","));

  const queryString = params.toString();
  const endpoint = `/customers/${id}${queryString ? `?${queryString}` : ""}`;

  const response = await client.get<Customer>(endpoint);

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(response, null, 2),
      },
    ],
  };
}

export const getCustomerTool: Tool = {
  definition,
  handler,
};
