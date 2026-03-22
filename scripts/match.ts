/**
 * match.ts - Matches ingested SF Open Data records to landlords
 * by normalizing addresses and comparing against landlord address sets.
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  normalizeAddressString,
  normalizeAddressComponents,
  normalizeAddress,
  type NormalizedAddress,
} from "./normalize.js";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "data", "raw");
const SEED_DIR = path.join(ROOT, "data", "seed");
const LANDLORDS_DIR = path.join(ROOT, "data", "landlords");

// ─── Types ───────────────────────────────────────────────────────────

interface LandlordSeed {
  id: string;
  name: string;
  slug: string;
  addresses: Array<{
    street_number: string;
    street_name: string;
    street_suffix: string;
    unit_count?: number;
  }>;
  total_units?: number;
}

interface LandlordOutput {
  id: string;
  name: string;
  slug: string;
  total_units: number;
  addresses: LandlordSeed["addresses"];
  dbi_complaints: Record<string, unknown>[];
  eviction_notices: Record<string, unknown>[];
  rent_board_petitions: Record<string, unknown>[];
  three_eleven_cases: Record<string, unknown>[];
  building_permits: Record<string, unknown>[];
}

type DatasetKey =
  | "dbi_complaints"
  | "eviction_notices"
  | "rent_board_petitions"
  | "three_eleven_cases"
  | "building_permits";

// ─── Helpers ─────────────────────────────────────────────────────────

/**
 * Find the latest raw file matching a slug prefix.
 */
async function findLatestRawFile(slug: string): Promise<string | null> {
  try {
    const files = await readdir(RAW_DIR);
    const matching = files
      .filter((f) => f.startsWith(slug) && f.endsWith(".json"))
      .sort()
      .reverse();

    if (matching.length === 0) return null;
    return path.join(RAW_DIR, matching[0]);
  } catch {
    return null;
  }
}

/**
 * Load and parse a JSON file, returning an empty array on failure.
 */
async function loadJson<T = unknown>(filepath: string): Promise<T[]> {
  try {
    const raw = await readFile(filepath, "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.warn(`  Warning: Could not load ${filepath}:`, err instanceof Error ? err.message : err);
    return [];
  }
}

/**
 * Extract a normalized address key from a raw record based on dataset type.
 */
function extractAddressKey(
  record: Record<string, unknown>,
  dataset: DatasetKey
): string | null {
  let normalized: NormalizedAddress | null = null;

  switch (dataset) {
    case "dbi_complaints":
    case "building_permits": {
      // These have separate street_number, street_name, street_suffix fields
      const num = String(record.street_number || record.block || "").trim();
      const name = String(record.street_name || "").trim();
      const suffix = String(record.street_suffix || record.street_type || "").trim();

      if (num && name) {
        normalized = normalizeAddressComponents(num, name, suffix);
      }
      break;
    }

    case "eviction_notices": {
      // Evictions have an address field as a string (e.g. "200 Block Of New Street")
      const addr = record.address;
      if (addr && typeof addr === "string") {
        normalized = normalizeAddressString(addr);
      }
      break;
    }

    case "rent_board_petitions": {
      // Rent board may have address or separate components
      if (record.street_number && record.street_name) {
        normalized = normalizeAddressComponents(
          String(record.street_number),
          String(record.street_name),
          String(record.street_suffix || "")
        );
      } else if (record.address) {
        normalized = normalizeAddressString(String(record.address));
      }
      break;
    }

    case "three_eleven_cases": {
      // 311 cases typically have an address field or street_address
      const addr =
        (record.address as string) ||
        (record.street_address as string) ||
        (record.point_address as string) ||
        "";
      if (addr) {
        normalized = normalizeAddressString(addr);
      }
      break;
    }
  }

  return normalized?.key || null;
}

// ─── Main Match Logic ────────────────────────────────────────────────

export async function match(): Promise<void> {
  console.log("\n=== MATCH: Linking records to landlords ===\n");

  await mkdir(LANDLORDS_DIR, { recursive: true });

  // Load seed landlords
  const seedPath = path.join(SEED_DIR, "landlords.json");
  let landlords: LandlordSeed[];
  try {
    const raw = await readFile(seedPath, "utf-8");
    landlords = JSON.parse(raw);
    if (!Array.isArray(landlords)) {
      console.error("landlords.json must be an array. Aborting match.");
      return;
    }
  } catch (err) {
    console.error(
      `Could not load seed data from ${seedPath}:`,
      err instanceof Error ? err.message : err
    );
    console.error(
      "Create data/seed/landlords.json with landlord address data first."
    );
    return;
  }

  console.log(`Loaded ${landlords.length} landlords from seed data.\n`);

  // Build address key -> landlord index mapping
  const addressToLandlords = new Map<string, Set<number>>();

  for (let i = 0; i < landlords.length; i++) {
    const ll = landlords[i];
    if (!ll.addresses || !Array.isArray(ll.addresses)) continue;

    for (const addr of ll.addresses) {
      const normalized = normalizeAddressComponents(
        addr.street_number || "",
        addr.street_name || "",
        addr.street_suffix || ""
      );
      if (normalized.key && normalized.street_number) {
        if (!addressToLandlords.has(normalized.key)) {
          addressToLandlords.set(normalized.key, new Set());
        }
        addressToLandlords.get(normalized.key)!.add(i);
      }
    }
  }

  console.log(
    `Built address index: ${addressToLandlords.size} unique address keys.\n`
  );

  // Initialize output structures
  const outputs: LandlordOutput[] = landlords.map((ll) => ({
    id: ll.slug || ll.id,
    name: ll.name,
    slug: ll.slug || ll.id,
    total_units: ll.total_units || ll.addresses?.reduce((sum, a) => sum + (a.unit_count || 1), 0) || 0,
    addresses: ll.addresses || [],
    dbi_complaints: [],
    eviction_notices: [],
    rent_board_petitions: [],
    three_eleven_cases: [],
    building_permits: [],
  }));

  // Process each dataset
  const datasets: Array<{ slug: string; key: DatasetKey }> = [
    { slug: "dbi-complaints", key: "dbi_complaints" },
    { slug: "eviction-notices", key: "eviction_notices" },
    { slug: "rent-board-petitions", key: "rent_board_petitions" },
    { slug: "311-cases", key: "three_eleven_cases" },
    { slug: "building-permits", key: "building_permits" },
  ];

  for (const { slug, key } of datasets) {
    const filepath = await findLatestRawFile(slug);
    if (!filepath) {
      console.log(`  [${slug}] No raw data file found. Skipping.`);
      continue;
    }

    console.log(`  [${slug}] Loading ${path.basename(filepath)}...`);
    const records = await loadJson<Record<string, unknown>>(filepath);
    console.log(`  [${slug}] ${records.length.toLocaleString()} records loaded.`);

    let matched = 0;
    for (const record of records) {
      const addrKey = extractAddressKey(record, key);
      if (!addrKey) continue;

      const landlordIndices = addressToLandlords.get(addrKey);
      if (!landlordIndices) continue;

      for (const idx of landlordIndices) {
        outputs[idx][key].push(record);
        matched++;
      }
    }

    console.log(
      `  [${slug}] ${matched.toLocaleString()} records matched to landlords.\n`
    );
  }

  // Write per-landlord output files
  console.log("Writing per-landlord files...");
  for (const output of outputs) {
    const filepath = path.join(LANDLORDS_DIR, `${output.slug}.json`);
    await writeFile(filepath, JSON.stringify(output, null, 2), "utf-8");

    const totalRecords =
      output.dbi_complaints.length +
      output.eviction_notices.length +
      output.rent_board_petitions.length +
      output.three_eleven_cases.length +
      output.building_permits.length;

    console.log(
      `  ${output.name}: ${totalRecords.toLocaleString()} total matched records -> ${output.slug}.json`
    );
  }

  console.log("\nMatch complete.");
}

// Run directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("match.ts")
) {
  match().catch((err) => {
    console.error("Match failed:", err);
    process.exit(1);
  });
}
