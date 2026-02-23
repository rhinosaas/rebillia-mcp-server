/**
 * Transaction tools: list, get, refund, void.
 */

import type { Tool } from "../types.js";
import { getTransactionTool } from "./getTransaction.js";
import { listTransactionsTool } from "./listTransactions.js";
import { refundTransactionTool } from "./refundTransaction.js";
import { voidTransactionTool } from "./voidTransaction.js";

/** All 4 transaction tools. */
export function registerTransactionTools(): Tool[] {
  return [
    listTransactionsTool,
    getTransactionTool,
    refundTransactionTool,
    voidTransactionTool,
  ];
}

export { listTransactionsTool } from "./listTransactions.js";
export { getTransactionTool } from "./getTransaction.js";
export { refundTransactionTool } from "./refundTransaction.js";
export { voidTransactionTool } from "./voidTransaction.js";
