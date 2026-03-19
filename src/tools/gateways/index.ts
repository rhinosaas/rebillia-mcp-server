/**
 * Gateway tools: list global gateways, list company gateways, get, create, update, delete, test, get client token.
 */

import type { Tool } from "../types.js";
import { createGatewayTool } from "./createGateway.js";
import { createSetupIntentTool } from "./createSetupIntent.js";
import { deleteGatewayTool } from "./deleteGateway.js";
import { getClientTokenTool } from "./getClientToken.js";
import { getGatewayTool } from "./getGateway.js";
import { listGatewaysTool } from "./listGateways.js";
import { listGlobalGatewaysTool } from "./listGlobalGateways.js";
import { testGatewayTool } from "./testGateway.js";
import { updateGatewayTool } from "./updateGateway.js";

/** All gateway tools. */
export function registerGatewayTools(): Tool[] {
  return [
    listGlobalGatewaysTool,
    listGatewaysTool,
    getGatewayTool,
    getClientTokenTool,
    createSetupIntentTool,
    createGatewayTool,
    updateGatewayTool,
    deleteGatewayTool,
    testGatewayTool,
  ];
}

export { listGatewaysTool } from "./listGateways.js";
export { listGlobalGatewaysTool } from "./listGlobalGateways.js";
export { getGatewayTool } from "./getGateway.js";
export { getClientTokenTool } from "./getClientToken.js";
export { createSetupIntentTool } from "./createSetupIntent.js";
export { createGatewayTool } from "./createGateway.js";
export { updateGatewayTool } from "./updateGateway.js";
export { deleteGatewayTool } from "./deleteGateway.js";
export { testGatewayTool } from "./testGateway.js";
