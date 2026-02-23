/**
 * Invoice tools: list, get, create, update, delete, charge, charge_external, void.
 */

import type { Tool } from "../types.js";
import { chargeInvoiceExternalTool } from "./chargeInvoiceExternal.js";
import { chargeInvoiceTool } from "./chargeInvoice.js";
import { createInvoiceTool } from "./createInvoice.js";
import { deleteInvoiceTool } from "./deleteInvoice.js";
import { getInvoiceTool } from "./getInvoice.js";
import { listInvoicesTool } from "./listInvoices.js";
import { updateInvoiceTool } from "./updateInvoice.js";
import { voidInvoiceTool } from "./voidInvoice.js";

/** All 8 invoice tools. */
export function registerInvoiceTools(): Tool[] {
  return [
    listInvoicesTool,
    getInvoiceTool,
    createInvoiceTool,
    updateInvoiceTool,
    deleteInvoiceTool,
    chargeInvoiceTool,
    chargeInvoiceExternalTool,
    voidInvoiceTool,
  ];
}

export { listInvoicesTool } from "./listInvoices.js";
export { getInvoiceTool } from "./getInvoice.js";
export { createInvoiceTool } from "./createInvoice.js";
export { updateInvoiceTool } from "./updateInvoice.js";
export { deleteInvoiceTool } from "./deleteInvoice.js";
export { chargeInvoiceTool } from "./chargeInvoice.js";
export { chargeInvoiceExternalTool } from "./chargeInvoiceExternal.js";
export { voidInvoiceTool } from "./voidInvoice.js";
