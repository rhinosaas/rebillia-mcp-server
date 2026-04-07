/**
 * Company currency tools: list, get, create, update, delete, get_default, set_default.
 */

import type { Tool } from "../types.js";
import { createCurrencyTool } from "./createCurrency.js";
import { deleteCurrencyTool } from "./deleteCurrency.js";
import { getCurrencyTool } from "./getCurrency.js";
import { getDefaultCurrencyTool } from "./getDefaultCurrency.js";
import { listCurrenciesTool } from "./listCurrencies.js";
import { setDefaultCurrencyTool } from "./setDefaultCurrency.js";
import { updateCurrencyTool } from "./updateCurrency.js";

/** All 7 currency tools. */
export function registerCurrencyTools(): Tool[] {
  return [
    listCurrenciesTool,
    getCurrencyTool,
    createCurrencyTool,
    updateCurrencyTool,
    deleteCurrencyTool,
    getDefaultCurrencyTool,
    setDefaultCurrencyTool,
  ];
}

export { listCurrenciesTool } from "./listCurrencies.js";
export { getCurrencyTool } from "./getCurrency.js";
export { createCurrencyTool } from "./createCurrency.js";
export { updateCurrencyTool } from "./updateCurrency.js";
export { deleteCurrencyTool } from "./deleteCurrency.js";
export { getDefaultCurrencyTool } from "./getDefaultCurrency.js";
export { setDefaultCurrencyTool } from "./setDefaultCurrency.js";
