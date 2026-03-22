/**
 * ingest.ts - Pulls raw data from SF Open Data SODA API endpoints
 * and saves timestamped JSON files to /data/raw/
 */

import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const RAW_DIR = path.join(ROOT, "data", "raw");

interface DataSource {
  slug: string;
  label: string;
  url: string;
}

const SOURCES: DataSource[] = [
  {
    slug: "dbi-complaints",
    label: "DBI Complaints",
    url: "https://data.sfgov.org/resource/nbtm-fbw5.json?$limit=100000",
  },
  {
    slug: "eviction-notices",
    label: "Eviction Notices",
    url: "https://data.sfgov.org/resource/5cei-gny5.json?$limit=100000",
  },
  {
    slug: "rent-board-petitions",
    label: "Rent Board Petitions",
    url: "https://data.sfgov.org/resource/6swy-cmkq.json?$limit=100000",
  },
  {
    slug: "311-cases",
    label: "311 Cases (Building/Property)",
    url: `https://data.sfgov.org/resource/vw6y-z8j6.json?$where=${encodeURIComponent("service_name='Damaged Property' OR service_name='Sewer Issues' OR service_name='Street and Sidewalk Cleaning'")}&$limit=100000`,
  },
  {
    slug: "building-permits",
    label: "Building Permits",
    url: "https://data.sfgov.org/resource/i98e-djp9.json?$limit=100000",
  },
];

function today(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function fetchSource(source: DataSource, dateStr: string): Promise<void> {
  const startTime = Date.now();
  console.log(`  [${source.slug}] Fetching from SODA API...`);

  try {
    const response = await fetch(source.url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    const data = await response.json();
    const recordCount = Array.isArray(data) ? data.length : 0;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    const filename = `${source.slug}-${dateStr}.json`;
    const filepath = path.join(RAW_DIR, filename);
    await writeFile(filepath, JSON.stringify(data, null, 2), "utf-8");

    console.log(
      `  [${source.slug}] Saved ${recordCount.toLocaleString()} records to ${filename} (${elapsed}s)`
    );
  } catch (err) {
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      `  [${source.slug}] FAILED after ${elapsed}s: ${message}`
    );
    throw err;
  }
}

export async function ingest(): Promise<void> {
  console.log("\n=== INGEST: Pulling SF Open Data ===\n");

  await mkdir(RAW_DIR, { recursive: true });

  const dateStr = today();
  console.log(`Date stamp: ${dateStr}`);
  console.log(`Output directory: ${RAW_DIR}\n`);

  const results = await Promise.allSettled(
    SOURCES.map((source) => fetchSource(source, dateStr))
  );

  const succeeded = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  console.log(
    `\nIngest complete: ${succeeded} succeeded, ${failed} failed out of ${SOURCES.length} sources.`
  );

  if (failed > 0) {
    console.warn("Some sources failed. Check errors above.");
  }
}

// Run directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("ingest.ts")) {
  ingest().catch((err) => {
    console.error("Ingest failed:", err);
    process.exit(1);
  });
}
