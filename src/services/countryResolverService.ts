/**
 * Country resolver: maps ISO 3166-1 alpha-2 country codes to Rebillia upstream countryId.
 * Source of truth: GET /globals/countries. Used so MCP tools accept countryCode instead of opaque countryId.
 */

export type Client = InstanceType<typeof import("../client.js").default>;

export interface CountryItem {
  id: number;
  code: string;
  name: string;
}

const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

let cache: { byCode: Map<string, number>; items: CountryItem[]; expiresAt: number } | null = null;

function isCacheValid(): boolean {
  return cache !== null && Date.now() < cache.expiresAt;
}

/** Normalize a raw API country object to CountryItem. Accepts common field names. */
function normalizeCountry(raw: Record<string, unknown>): CountryItem | null {
  if (!raw || typeof raw !== "object") return null;
  const id =
    typeof raw.id === "number"
      ? raw.id
      : typeof raw.countryId === "number"
        ? raw.countryId
        : typeof raw.id === "string"
          ? parseInt(String(raw.id), 10)
          : NaN;
  if (!Number.isInteger(id) || id < 0) return null;
  // Rebillia Public API uses alpha2Code (see https://api.rebillia.com/globals/countries)
  const code = [
    raw.alpha2Code,
    raw.code,
    raw.countryCode,
    raw.iso2,
    raw.iso_code,
    raw.isoCode,
  ]
    .find((v) => typeof v === "string" && v.length === 2) as string | undefined;
  if (!code) return null;
  const name =
    typeof raw.name === "string"
      ? raw.name
      : typeof raw.countryName === "string"
        ? raw.countryName
        : typeof raw.label === "string"
          ? raw.label
          : "";
  return { id, code: code.trim().toUpperCase(), name: name || code };
}

function extractCountryList(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  for (const key of ["data", "countries", "items", "results"]) {
    if (Array.isArray(o[key])) return o[key] as unknown[];
  }
  return [];
}

/**
 * Fetch countries from upstream and populate cache.
 * Supports response shapes: array, or { data: array }, { countries: array }, etc.
 */
export async function fetchCountries(client: Client): Promise<CountryItem[]> {
  const raw = await client.getRoot<unknown>("/globals/countries");
  const list: unknown[] = extractCountryList(raw);
  const items: CountryItem[] = [];
  for (const c of list) {
    const normalized = normalizeCountry(
      typeof c === "object" && c !== null && !Array.isArray(c) ? (c as Record<string, unknown>) : {}
    );
    if (normalized) items.push(normalized);
  }
  const byCode = new Map<string, number>();
  for (const c of items) {
    if (c.code.length === 2) byCode.set(c.code, c.id);
  }
  if (items.length === 0) {
    throw new Error(
      "Could not resolve countryCode to upstream countryId: /globals/countries returned no valid countries. Check API response shape (expected id and alpha2Code/code)."
    );
  }
  cache = {
    byCode,
    items,
    expiresAt: Date.now() + CACHE_TTL_MS,
  };
  return cache.items;
}

/**
 * Get list of countries (cached). Use for MCP resource globals://countries.
 */
export async function getCountries(client: Client): Promise<CountryItem[]> {
  if (!isCacheValid()) {
    await fetchCountries(client);
  }
  return cache!.items;
}

/**
 * Resolve ISO 3166-1 alpha-2 country code to upstream countryId.
 * - Normalizes code to uppercase
 * - Validates format (non-empty, 2 letters)
 * - Fetches /globals/countries if cache empty or stale
 * - Throws clear errors if code is invalid or unsupported
 */
export async function resolveCountryId(client: Client, countryCode: string): Promise<number> {
  const trimmed = (countryCode ?? "").trim();
  if (!trimmed) {
    throw new Error("countryCode is required");
  }
  const code = trimmed.toUpperCase();
  if (!COUNTRY_CODE_REGEX.test(code)) {
    throw new Error(`Invalid countryCode: must be ISO 3166-1 alpha-2 (e.g. ES, AR, MX), got: ${trimmed}`);
  }
  if (!isCacheValid()) {
    await fetchCountries(client);
  }
  const id = cache!.byCode.get(code);
  if (id === undefined) {
    const available = Array.from(cache!.byCode.keys()).slice(0, 20).sort().join(", ");
    const more = cache!.byCode.size > 20 ? ` (and ${cache!.byCode.size - 20} more)` : "";
    throw new Error(
      `Unsupported countryCode: ${code}. Could not resolve to upstream countryId. Available codes include: ${available}${more}. Use rebillia://globals/countries resource to see full list.`
    );
  }
  return id;
}
