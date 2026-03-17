/**
 * Gateway tools: list, get, create, update, delete, test, get client token.
 */

import type { Tool } from "../types.js";
import { createGatewayTool } from "./createGateway.js";
import { deleteGatewayTool } from "./deleteGateway.js";
import { getClientTokenTool } from "./getClientToken.js";
import { getGatewayTool } from "./getGateway.js";
import { listGatewaysTool } from "./listGateways.js";
import { testGatewayTool } from "./testGateway.js";
import { updateGatewayTool } from "./updateGateway.js";

/** All 7 gateway tools. */
export function registerGatewayTools(): Tool[] {
  return [
    listGatewaysTool,
    getGatewayTool,
    getClientTokenTool,
    createGatewayTool,
    updateGatewayTool,
    deleteGatewayTool,
    testGatewayTool,
  ];
}

export { listGatewaysTool } from "./listGateways.js";
export { getGatewayTool } from "./getGateway.js";
export { getClientTokenTool } from "./getClientToken.js";
export { createGatewayTool } from "./createGateway.js";
export { updateGatewayTool } from "./updateGateway.js";
export { deleteGatewayTool } from "./deleteGateway.js";
export { testGatewayTool } from "./testGateway.js";
