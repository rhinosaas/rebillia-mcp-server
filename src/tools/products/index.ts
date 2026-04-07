/**
 * Product tools: list, get, create, update, delete, status, link/unlink external product.
 */

import type { Tool } from "../types.js";
import { createProductTool } from "./createProduct.js";
import { deleteProductTool } from "./deleteProduct.js";
import { getProductTool } from "./getProduct.js";
import { linkExternalProductTool } from "./linkExternalProduct.js";
import { listProductsTool } from "./listProducts.js";
import { unlinkExternalProductTool } from "./unlinkExternalProduct.js";
import { updateProductStatusTool } from "./updateProductStatus.js";
import { updateProductTool } from "./updateProduct.js";

/** All 8 product tools. Register with the main tool registry. */
export function registerProductTools(): Tool[] {
  return [
    listProductsTool,
    getProductTool,
    createProductTool,
    updateProductTool,
    deleteProductTool,
    updateProductStatusTool,
    linkExternalProductTool,
    unlinkExternalProductTool,
  ];
}

export { listProductsTool } from "./listProducts.js";
export { getProductTool } from "./getProduct.js";
export { createProductTool } from "./createProduct.js";
export { updateProductTool } from "./updateProduct.js";
export { deleteProductTool } from "./deleteProduct.js";
export { updateProductStatusTool } from "./updateProductStatus.js";
export { linkExternalProductTool } from "./linkExternalProduct.js";
export { unlinkExternalProductTool } from "./unlinkExternalProduct.js";
