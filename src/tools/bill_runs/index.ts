/**
 * Bill run tools: list, get, update, get_bill_run_invoices.
 */

import type { Tool } from "../types.js";
import { getBillRunInvoicesTool } from "./getBillRunInvoices.js";
import { getBillRunTool } from "./getBillRun.js";
import { listBillRunsTool } from "./listBillRuns.js";
import { updateBillRunTool } from "./updateBillRun.js";

/** All 4 bill run tools. */
export function registerBillRunTools(): Tool[] {
  return [
    listBillRunsTool,
    getBillRunTool,
    updateBillRunTool,
    getBillRunInvoicesTool,
  ];
}

export { listBillRunsTool } from "./listBillRuns.js";
export { getBillRunTool } from "./getBillRun.js";
export { updateBillRunTool } from "./updateBillRun.js";
export { getBillRunInvoicesTool } from "./getBillRunInvoices.js";
