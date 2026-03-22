/**
 * normalize.ts - Address normalization utilities for matching
 * across SF Open Data sources with varying address formats.
 */

export interface NormalizedAddress {
  street_number: string;
  street_name: string;
  street_suffix: string;
  key: string;
}

/**
 * Map of full street suffix words to their abbreviations.
 */
const SUFFIX_MAP: Record<string, string> = {
  STREET: "ST",
  AVENUE: "AVE",
  BOULEVARD: "BLVD",
  DRIVE: "DR",
  LANE: "LN",
  COURT: "CT",
  PLACE: "PL",
  ROAD: "RD",
  TERRACE: "TER",
  WAY: "WAY",
  CIRCLE: "CIR",
  // Already-abbreviated forms map to themselves
  ST: "ST",
  AVE: "AVE",
  BLVD: "BLVD",
  DR: "DR",
  LN: "LN",
  CT: "CT",
  PL: "PL",
  RD: "RD",
  TER: "TER",
  CIR: "CIR",
  // Additional common variants
  AV: "AVE",
  BL: "BLVD",
  BLV: "BLVD",
  PKWY: "PKWY",
  PARKWAY: "PKWY",
  HWY: "HWY",
  HIGHWAY: "HWY",
  ALLEY: "ALY",
  ALY: "ALY",
};

/**
 * Regex to match and strip unit/apt/suite designators.
 * Handles: APT 5, UNIT 3B, #12, STE 100, SUITE A, FLOOR 2, FL 3, etc.
 */
const UNIT_PATTERN =
  /\s*[,.]?\s*(?:APT|APARTMENT|UNIT|#|STE|SUITE|FLOOR|FL|RM|ROOM|BLDG|BUILDING|DEPT|DEPARTMENT)\s*[.#]?\s*\S*/gi;

/**
 * Strips trailing city/state/zip from an address string.
 * e.g. "123 Main St, San Francisco, CA 94102" -> "123 Main St"
 */
function stripCityStateZip(addr: string): string {
  // Remove ", San Francisco, CA 94xxx" or similar
  let cleaned = addr.replace(
    /[,\s]+San\s+Francisco\s*,?\s*CA\s*\d{0,5}\s*$/i,
    ""
  );
  // Also handle just ", CA 94xxx"
  cleaned = cleaned.replace(/[,\s]+CA\s*\d{0,5}\s*$/i, "");
  // Also handle just trailing zip
  cleaned = cleaned.replace(/[,\s]+\d{5}(-\d{4})?\s*$/, "");
  return cleaned.trim();
}

/**
 * Normalize a street suffix string to its standard abbreviation.
 */
function normalizeSuffix(suffix: string): string {
  const upper = suffix.toUpperCase().replace(/\./g, "").trim();
  return SUFFIX_MAP[upper] || upper;
}

/**
 * Core normalization: takes individual components and returns a NormalizedAddress.
 */
function buildNormalized(
  streetNumber: string,
  streetName: string,
  streetSuffix: string
): NormalizedAddress {
  const num = streetNumber.trim().replace(/^0+/, "");
  const name = streetName.toUpperCase().trim().replace(/\s+/g, " ");
  const suffix = normalizeSuffix(streetSuffix);

  const key = `${num}-${name}-${suffix}`;

  return {
    street_number: num,
    street_name: name,
    street_suffix: suffix,
    key,
  };
}

/**
 * Normalize an address from separate component fields (DBI / permit format).
 *
 * @param street_number - e.g. "123"
 * @param street_name - e.g. "MAIN"
 * @param street_suffix - e.g. "ST" or "STREET"
 */
export function normalizeAddressComponents(
  street_number: string,
  street_name: string,
  street_suffix: string
): NormalizedAddress {
  // Strip any unit info that might have crept into the street name
  let cleanName = street_name
    .toUpperCase()
    .replace(UNIT_PATTERN, "")
    .trim();

  return buildNormalized(
    street_number || "",
    cleanName,
    street_suffix || ""
  );
}

/**
 * Normalize an address from a single string (311 / eviction format).
 * Handles formats like:
 *   "123 Main St"
 *   "123 Main Street, San Francisco, CA 94102"
 *   "456 Oak Ave Apt 3"
 *
 * @param addressStr - The full address string
 */
export function normalizeAddressString(
  addressStr: string
): NormalizedAddress | null {
  if (!addressStr || !addressStr.trim()) {
    return null;
  }

  let addr = addressStr.toUpperCase().trim();

  // Strip "Block Of" pattern (common in eviction/rent board data)
  // e.g. "200 Block Of New Street" -> "200 New Street"
  addr = addr.replace(/\bBLOCK\s+OF\s+/i, "");

  // Strip city/state/zip
  addr = stripCityStateZip(addr);

  // Strip unit/apt designators
  addr = addr.replace(UNIT_PATTERN, "").trim();

  // Remove trailing punctuation
  addr = addr.replace(/[,.\s]+$/, "").trim();

  // Parse: expect "NUMBER NAME SUFFIX"
  // The number may contain a letter (e.g., "123A")
  const match = addr.match(/^(\d+[A-Z]?)\s+(.+?)(?:\s+(\S+))?\s*$/);
  if (!match) {
    // Try a simpler parse - just number + rest
    const simpleMatch = addr.match(/^(\d+[A-Z]?)\s+(.+)$/);
    if (!simpleMatch) {
      return null;
    }

    // Everything after number - try to split off the last word as suffix
    const parts = simpleMatch[2].trim().split(/\s+/);
    if (parts.length >= 2) {
      const lastWord = parts[parts.length - 1];
      if (SUFFIX_MAP[lastWord]) {
        const name = parts.slice(0, -1).join(" ");
        return buildNormalized(simpleMatch[1], name, lastWord);
      }
    }

    // No recognizable suffix - use the whole thing as street name
    return buildNormalized(simpleMatch[1], simpleMatch[2], "");
  }

  const streetNumber = match[1];
  let streetName: string;
  let streetSuffix: string;

  if (match[3] && SUFFIX_MAP[match[3]]) {
    // Last token is a recognized suffix
    streetName = match[2];
    streetSuffix = match[3];
  } else if (match[3]) {
    // Last token is not a recognized suffix; it might be part of the name
    // Try splitting match[2] + " " + match[3] differently
    const fullStreet = (match[2] + " " + match[3]).trim();
    const words = fullStreet.split(/\s+/);
    const lastWord = words[words.length - 1];

    if (SUFFIX_MAP[lastWord]) {
      streetName = words.slice(0, -1).join(" ");
      streetSuffix = lastWord;
    } else {
      streetName = fullStreet;
      streetSuffix = "";
    }
  } else {
    // Only two parts captured (number + name, no suffix)
    // Check if the last word of match[2] is a suffix
    const words = match[2].trim().split(/\s+/);
    const lastWord = words[words.length - 1];
    if (words.length >= 2 && SUFFIX_MAP[lastWord]) {
      streetName = words.slice(0, -1).join(" ");
      streetSuffix = lastWord;
    } else {
      streetName = match[2];
      streetSuffix = "";
    }
  }

  return buildNormalized(streetNumber, streetName, streetSuffix);
}

/**
 * General-purpose normalizer that auto-detects format.
 * Accepts either a string or component object.
 */
export function normalizeAddress(
  input:
    | string
    | {
        street_number?: string;
        street_name?: string;
        street_suffix?: string;
        address?: string;
      }
): NormalizedAddress | null {
  if (typeof input === "string") {
    return normalizeAddressString(input);
  }

  if (input.street_number && input.street_name) {
    return normalizeAddressComponents(
      input.street_number,
      input.street_name,
      input.street_suffix || ""
    );
  }

  if (input.address) {
    return normalizeAddressString(input.address);
  }

  return null;
}
