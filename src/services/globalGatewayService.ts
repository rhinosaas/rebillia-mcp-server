/**
 * Global gateways: list available gateway types and their required configuration.
 * Source: GET /globals/gateways (no /v1). Used so MCP tools can discover gblGatewayId and setting keys for create_gateway.
 */

export type Client = InstanceType<typeof import("../client.js").default>;

export interface GlobalGatewaySettingField {
  keyName: string;
  displayName?: string;
}

export interface GlobalGatewayItem {
  gblGatewayId: number;
  name: string;
  keyName: string;
  requiredFields: string[];
  fieldDetails?: GlobalGatewaySettingField[];
}

interface RawSettingItem {
  displayName?: string;
  keyName?: string;
  value?: unknown;
}

function extractSettingList(raw: unknown): RawSettingItem[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.setting)) {
    return (o.setting as unknown[]).filter(
      (s): s is RawSettingItem => s != null && typeof s === "object"
    ) as RawSettingItem[];
  }
  return [];
}

function extractGatewayList(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw.filter((x) => x != null && typeof x === "object") as Record<string, unknown>[];
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    for (const key of ["data", "gateways", "items", "results"]) {
      if (Array.isArray(o[key])) {
        return (o[key] as unknown[]).filter((x) => x != null && typeof x === "object") as Record<string, unknown>[];
      }
    }
  }
  return [];
}

function normalizeGateway(raw: Record<string, unknown>): GlobalGatewayItem | null {
  if (!raw || typeof raw !== "object") return null;
  const id =
    typeof raw.id === "number"
      ? raw.id
      : typeof raw.gblGatewayId === "number"
        ? raw.gblGatewayId
        : typeof raw.id === "string"
          ? parseInt(String(raw.id), 10)
          : NaN;
  if (!Number.isInteger(id) || id < 0) return null;
  const name = typeof raw.name === "string" ? raw.name : String(raw.keyName ?? id);
  const keyName = typeof raw.keyName === "string" ? raw.keyName : String(raw.name ?? id);

  const settingList = extractSettingList(raw);
  const requiredFields = settingList
    .map((s) => (typeof s.keyName === "string" && s.keyName.trim() ? s.keyName.trim() : null))
    .filter((k): k is string => k != null);
  const fieldDetails: GlobalGatewaySettingField[] = settingList
    .filter((s) => typeof s.keyName === "string" && s.keyName.trim())
    .map((s) => ({
      keyName: s.keyName!.trim(),
      displayName: typeof s.displayName === "string" ? s.displayName : undefined,
    }));

  return {
    gblGatewayId: id,
    name,
    keyName,
    requiredFields,
    fieldDetails: fieldDetails.length > 0 ? fieldDetails : undefined,
  };
}

/**
 * Fetch global gateways from GET /globals/gateways and return normalized list.
 * Each item includes gblGatewayId, name, keyName, requiredFields (setting keys), and optional fieldDetails (keyName + displayName).
 */
export async function listGlobalGateways(client: Client): Promise<GlobalGatewayItem[]> {
  const raw = await client.getRoot<unknown>("/globals/gateways");
  const list = extractGatewayList(raw);
  const items: GlobalGatewayItem[] = [];
  for (const g of list) {
    const normalized = normalizeGateway(g);
    if (normalized) items.push(normalized);
  }
  return items;
}
