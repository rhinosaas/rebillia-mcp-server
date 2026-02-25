/**
 * Gateway tools: list, get, create, update, delete, test.
 */

import type { Tool } from "../types.js";
import { createGatewayTool } from "./createGateway.js";
import { deleteGatewayTool } from "./deleteGateway.js";
import { getGatewayTool } from "./getGateway.js";
import { listGatewaysTool } from "./listGateways.js";
import { testGatewayTool } from "./testGateway.js";
import { updateGatewayTool } from "./updateGateway.js";

/** All 6 gateway tools. */
export function registerGatewayTools(): Tool[] {
  return [
    listGatewaysTool,
    getGatewayTool,
    createGatewayTool,
    updateGatewayTool,
    deleteGatewayTool,
    testGatewayTool,
  ];
}

export { listGatewaysTool } from "./listGateways.js";
export { getGatewayTool } from "./getGateway.js";
export { createGatewayTool } from "./createGateway.js";
export { updateGatewayTool } from "./updateGateway.js";
export { deleteGatewayTool } from "./deleteGateway.js";
export { testGatewayTool } from "./testGateway.js";
