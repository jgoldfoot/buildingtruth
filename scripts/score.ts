/**
 * score.ts - Scoring engine for BuildingTruth landlord accountability.
 *
 * Computes a composite 0-100 score from 5 weighted signals:
 *   1. DBI Violations          (30%) - complaints per unit per year, severity/recency weighted
 *   2. Eviction Filing Rate    (25%) - evictions per unit per year, no-fault multiplier
 *   3. Rent Board Petitions    (20%) - sustained petitions per unit per year
 *   4. 311 Complaint Density   (15%) - habitability 311s per unit per year
 *   5. Permit Investment       (10%) - POSITIVE signal, more = better
 */

import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const ROOT = process.cwd();
const LANDLORDS_DIR = path.join(ROOT, "data", "landlords");
const DATA_DIR = path.join(ROOT, "data");

// ─── Types ───────────────────────────────────────────────────────────

interface LandlordData {
  id: string;
  name: string;
  slug: string;
  total_units: number;
  addresses: Array<{
    street_number: string;
    street_name: string;
    street_suffix: string;
    unit_count?: number;
  }>;
  dbi_complaints: Record<string, unknown>[];
  eviction_notices: Record<string, unknown>[];
  rent_board_petitions: Record<string, unknown>[];
  three_eleven_cases: Record<string, unknown>[];
  building_permits: Record<string, unknown>[];
}

interface SignalScore {
  raw_value: number;
  percentile: number;
  weighted: number;
}

interface LandlordScore {
  id: string;
  name: string;
  slug: string;
  total_units: number;
  composite_score: number | null;
  insufficient_data: boolean;
  signals: {
    dbi_violations: SignalScore;
    eviction_rate: SignalScore;
    rent_board_petitions: SignalScore;
    complaint_density: SignalScore;
    permit_investment: SignalScore;
  };
  record_counts: {
    dbi_complaints: number;
    eviction_notices: number;
    rent_board_petitions: number;
    three_eleven_cases: number;
    building_permits: number;
  };
}

interface LeaderboardEntry extends LandlordScore {}

// ─── Signal Weights ──────────────────────────────────────────────────

const WEIGHTS = {
  dbi_violations: 0.3,
  eviction_rate: 0.25,
  rent_board_petitions: 0.2,
  complaint_density: 0.15,
  permit_investment: 0.1,
};

// ─── Date/Recency Helpers ────────────────────────────────────────────

const NOW = new Date();
const CURRENT_YEAR = NOW.getFullYear();

function yearsSince(dateStr: string | undefined | null): number {
  if (!dateStr) return 10; // default to old if unknown
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 10;
    return Math.max(0, (NOW.getTime() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  } catch {
    return 10;
  }
}

function recencyWeight(years: number): number {
  if (years <= 3) return 1.0;
  if (years <= 5) return 0.5;
  return 0.25;
}

/**
 * Estimate the number of active years a landlord has data for,
 * based on the date range of their records.
 */
function estimateActiveYears(records: Record<string, unknown>[], dateFields: string[]): number {
  let earliest = Infinity;
  let latest = -Infinity;

  for (const rec of records) {
    for (const field of dateFields) {
      const val = rec[field];
      if (typeof val === "string" && val) {
        const d = new Date(val);
        if (!isNaN(d.getTime())) {
          const t = d.getTime();
          if (t < earliest) earliest = t;
          if (t > latest) latest = t;
        }
      }
    }
  }

  if (earliest === Infinity || latest === -Infinity) {
    return 5; // default assumption
  }

  const years = (latest - earliest) / (365.25 * 24 * 60 * 60 * 1000);
  return Math.max(1, years);
}

// ─── No-fault eviction types ─────────────────────────────────────────

const NO_FAULT_TYPES = new Set([
  "ellis_act_withdrawal",
  "owner_move_in",
  "demolition",
  "condo_conversion",
  // Handle variations in field naming
  "ellis act withdrawal",
  "owner move-in",
  "owner move in",
  "condo conversion",
]);

function isNoFaultEviction(record: Record<string, unknown>): boolean {
  // Check common field names for eviction reason
  const reason = String(
    record.eviction_type ||
    record.reason ||
    record.eviction_reason ||
    record.constraints ||
    ""
  ).toLowerCase().trim();

  // Check individual boolean columns that the SF data uses
  const boolFields = [
    "ellis_act_withdrawal",
    "owner_move_in",
    "demolition",
    "condo_conversion",
  ];
  for (const field of boolFields) {
    if (record[field] === true || record[field] === "true") {
      return true;
    }
  }

  return NO_FAULT_TYPES.has(reason);
}

// ─── Signal Calculators ──────────────────────────────────────────────

/**
 * Signal 1: DBI Violations - complaints per unit per year, severity/recency weighted
 */
function calcDbiScore(data: LandlordData): number {
  const complaints = data.dbi_complaints;
  if (complaints.length === 0 || data.total_units === 0) return 0;

  let weightedSum = 0;
  for (const c of complaints) {
    const dateStr = String(
      c.date_filed || c.filed_date || c.complaint_date || c.date || ""
    );
    const years = yearsSince(dateStr);
    const decay = recencyWeight(years);

    // Severity: if status indicates a violation was found, weight higher
    const status = String(c.status || c.complaint_status || "").toLowerCase();
    const severityMult =
      status.includes("violation") || status.includes("abated")
        ? 1.5
        : 1.0;

    weightedSum += decay * severityMult;
  }

  const activeYears = estimateActiveYears(complaints, [
    "date_filed",
    "filed_date",
    "complaint_date",
    "date",
  ]);

  return weightedSum / data.total_units / activeYears;
}

/**
 * Signal 2: Eviction Filing Rate - evictions per unit per year, no-fault 2x
 */
function calcEvictionScore(data: LandlordData): number {
  const evictions = data.eviction_notices;
  if (evictions.length === 0 || data.total_units === 0) return 0;

  let weightedSum = 0;
  for (const e of evictions) {
    const mult = isNoFaultEviction(e) ? 2.0 : 1.0;
    weightedSum += mult;
  }

  const activeYears = estimateActiveYears(evictions, [
    "file_date",
    "filed_date",
    "date",
  ]);

  return weightedSum / data.total_units / activeYears;
}

/**
 * Signal 3: Rent Board Petitions - sustained petitions per unit per year
 */
function calcRentBoardScore(data: LandlordData): number {
  const petitions = data.rent_board_petitions;
  if (petitions.length === 0 || data.total_units === 0) return 0;

  let weightedSum = 0;
  for (const p of petitions) {
    const disposition = String(
      p.disposition || p.status || p.outcome || ""
    ).toLowerCase();

    if (
      disposition.includes("sustained") ||
      disposition.includes("granted") ||
      disposition.includes("approved")
    ) {
      weightedSum += 2.0; // sustained = 2x weight
    } else if (
      disposition.includes("dismissed") ||
      disposition.includes("denied") ||
      disposition.includes("withdrawn")
    ) {
      weightedSum += 0.5; // dismissed still counts but less
    } else {
      weightedSum += 1.0; // pending or unknown
    }
  }

  const activeYears = estimateActiveYears(petitions, [
    "file_date",
    "filed_date",
    "date",
    "petition_date",
  ]);

  return weightedSum / data.total_units / activeYears;
}

/**
 * Signal 4: 311 Complaint Density - habitability 311 per unit per year
 */
function calc311Score(data: LandlordData): number {
  const cases = data.three_eleven_cases;
  if (cases.length === 0 || data.total_units === 0) return 0;

  const activeYears = estimateActiveYears(cases, [
    "opened",
    "requested_datetime",
    "created_date",
    "date",
  ]);

  return cases.length / data.total_units / activeYears;
}

/**
 * Signal 5: Permit Investment - POSITIVE signal
 */
function calcPermitScore(data: LandlordData): number {
  const permits = data.building_permits;
  if (permits.length === 0 || data.total_units === 0) return 0;

  const activeYears = estimateActiveYears(permits, [
    "filed_date",
    "issued_date",
    "date",
    "permit_creation_date",
  ]);

  return permits.length / data.total_units / activeYears;
}

// ─── Percentile Ranking ──────────────────────────────────────────────

/**
 * Compute percentile ranks for an array of values.
 * Returns array of percentiles (0-100) in the same order.
 */
function percentileRank(values: number[]): number[] {
  if (values.length === 0) return [];
  if (values.length === 1) return [50];

  // Create indexed values and sort
  const indexed = values.map((v, i) => ({ value: v, index: i }));
  indexed.sort((a, b) => a.value - b.value);

  // Assign percentile based on position
  const percentiles = new Array<number>(values.length);
  for (let rank = 0; rank < indexed.length; rank++) {
    // Percentile = (rank / (n - 1)) * 100
    percentiles[indexed[rank].index] =
      values.length === 1
        ? 50
        : (rank / (values.length - 1)) * 100;
  }

  return percentiles;
}

// ─── Main Scoring Logic ──────────────────────────────────────────────

export async function score(): Promise<void> {
  console.log("\n=== SCORE: Computing landlord accountability scores ===\n");

  // Load all landlord data files
  let files: string[];
  try {
    files = (await readdir(LANDLORDS_DIR)).filter((f) =>
      f.endsWith(".json")
    );
  } catch {
    console.error(`No landlord data found in ${LANDLORDS_DIR}. Run match first.`);
    return;
  }

  if (files.length === 0) {
    console.error("No landlord JSON files found. Run match first.");
    return;
  }

  console.log(`Found ${files.length} landlord files.\n`);

  // Load all landlord data
  const allData: LandlordData[] = [];
  for (const file of files) {
    const raw = await readFile(path.join(LANDLORDS_DIR, file), "utf-8");
    allData.push(JSON.parse(raw));
  }

  // Calculate raw signal values
  console.log("Calculating raw signal values...");
  const rawSignals = allData.map((data) => {
    const totalRecords =
      data.dbi_complaints.length +
      data.eviction_notices.length +
      data.rent_board_petitions.length +
      data.three_eleven_cases.length +
      data.building_permits.length;

    const hasData = totalRecords > 0 && data.total_units > 0;

    return {
      dbi: hasData ? calcDbiScore(data) : 0,
      eviction: hasData ? calcEvictionScore(data) : 0,
      rentBoard: hasData ? calcRentBoardScore(data) : 0,
      threeEleven: hasData ? calc311Score(data) : 0,
      permit: hasData ? calcPermitScore(data) : 0,
      hasData,
    };
  });

  // Filter to landlords with data for percentile calculation
  const withDataIndices = rawSignals
    .map((s, i) => (s.hasData ? i : -1))
    .filter((i) => i >= 0);

  console.log(
    `${withDataIndices.length} landlords have sufficient data for scoring.\n`
  );

  // Compute percentile ranks for each signal (only among landlords with data)
  const dbiValues = withDataIndices.map((i) => rawSignals[i].dbi);
  const evictionValues = withDataIndices.map((i) => rawSignals[i].eviction);
  const rentBoardValues = withDataIndices.map((i) => rawSignals[i].rentBoard);
  const threeElevenValues = withDataIndices.map((i) => rawSignals[i].threeEleven);
  const permitValues = withDataIndices.map((i) => rawSignals[i].permit);

  const dbiPercentiles = percentileRank(dbiValues);
  const evictionPercentiles = percentileRank(evictionValues);
  const rentBoardPercentiles = percentileRank(rentBoardValues);
  const threeElevenPercentiles = percentileRank(threeElevenValues);
  const permitPercentiles = percentileRank(permitValues);

  // Build scores
  const scores: LandlordScore[] = allData.map((data, globalIdx) => {
    const raw = rawSignals[globalIdx];
    const totalRecords =
      data.dbi_complaints.length +
      data.eviction_notices.length +
      data.rent_board_petitions.length +
      data.three_eleven_cases.length +
      data.building_permits.length;

    if (!raw.hasData) {
      // Insufficient data
      return {
        id: data.id,
        name: data.name,
        slug: data.slug,
        total_units: data.total_units,
        composite_score: null,
        insufficient_data: true,
        signals: {
          dbi_violations: { raw_value: 0, percentile: 0, weighted: 0 },
          eviction_rate: { raw_value: 0, percentile: 0, weighted: 0 },
          rent_board_petitions: { raw_value: 0, percentile: 0, weighted: 0 },
          complaint_density: { raw_value: 0, percentile: 0, weighted: 0 },
          permit_investment: { raw_value: 0, percentile: 0, weighted: 0 },
        },
        record_counts: {
          dbi_complaints: data.dbi_complaints.length,
          eviction_notices: data.eviction_notices.length,
          rent_board_petitions: data.rent_board_petitions.length,
          three_eleven_cases: data.three_eleven_cases.length,
          building_permits: data.building_permits.length,
        },
      };
    }

    // Find this landlord's position in the withDataIndices array
    const dataIdx = withDataIndices.indexOf(globalIdx);

    // Percentiles for negative signals are INVERTED:
    // Higher complaint rate => higher percentile in raw => LOWER score (worse)
    // So: inverted_percentile = 100 - raw_percentile
    const dbiPct = 100 - dbiPercentiles[dataIdx]; // invert (negative signal)
    const evictionPct = 100 - evictionPercentiles[dataIdx]; // invert
    const rentBoardPct = 100 - rentBoardPercentiles[dataIdx]; // invert
    const threeElevenPct = 100 - threeElevenPercentiles[dataIdx]; // invert
    const permitPct = permitPercentiles[dataIdx]; // DON'T invert (positive signal)

    const signals = {
      dbi_violations: {
        raw_value: round(raw.dbi, 4),
        percentile: round(dbiPct, 1),
        weighted: round(dbiPct * WEIGHTS.dbi_violations, 2),
      },
      eviction_rate: {
        raw_value: round(raw.eviction, 4),
        percentile: round(evictionPct, 1),
        weighted: round(evictionPct * WEIGHTS.eviction_rate, 2),
      },
      rent_board_petitions: {
        raw_value: round(raw.rentBoard, 4),
        percentile: round(rentBoardPct, 1),
        weighted: round(rentBoardPct * WEIGHTS.rent_board_petitions, 2),
      },
      complaint_density: {
        raw_value: round(raw.threeEleven, 4),
        percentile: round(threeElevenPct, 1),
        weighted: round(threeElevenPct * WEIGHTS.complaint_density, 2),
      },
      permit_investment: {
        raw_value: round(raw.permit, 4),
        percentile: round(permitPct, 1),
        weighted: round(permitPct * WEIGHTS.permit_investment, 2),
      },
    };

    const compositeScore = round(
      signals.dbi_violations.weighted +
        signals.eviction_rate.weighted +
        signals.rent_board_petitions.weighted +
        signals.complaint_density.weighted +
        signals.permit_investment.weighted,
      1
    );

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      total_units: data.total_units,
      composite_score: compositeScore,
      insufficient_data: false,
      signals,
      record_counts: {
        dbi_complaints: data.dbi_complaints.length,
        eviction_notices: data.eviction_notices.length,
        rent_board_petitions: data.rent_board_petitions.length,
        three_eleven_cases: data.three_eleven_cases.length,
        building_permits: data.building_permits.length,
      },
    };
  });

  // Sort leaderboard: scored landlords first (by composite_score ascending = worst first),
  // then insufficient_data landlords
  const leaderboard: LeaderboardEntry[] = [...scores].sort((a, b) => {
    if (a.insufficient_data && !b.insufficient_data) return 1;
    if (!a.insufficient_data && b.insufficient_data) return -1;
    if (a.composite_score === null && b.composite_score === null) return 0;
    if (a.composite_score === null) return 1;
    if (b.composite_score === null) return -1;
    return a.composite_score - b.composite_score;
  });

  // Write leaderboard
  const leaderboardPath = path.join(DATA_DIR, "leaderboard.json");
  await writeFile(
    leaderboardPath,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        total_landlords: scores.length,
        scored_landlords: scores.filter((s) => !s.insufficient_data).length,
        weights: WEIGHTS,
        leaderboard,
      },
      null,
      2
    ),
    "utf-8"
  );
  console.log(`Leaderboard written to ${leaderboardPath}`);

  // Update each landlord file with score data
  console.log("\nUpdating landlord files with scores...");
  for (const s of scores) {
    const filepath = path.join(LANDLORDS_DIR, `${s.slug}.json`);
    try {
      const raw = await readFile(filepath, "utf-8");
      const landlordData = JSON.parse(raw);

      landlordData.score = {
        composite_score: s.composite_score,
        insufficient_data: s.insufficient_data,
        signals: s.signals,
        record_counts: s.record_counts,
        scored_at: new Date().toISOString(),
      };

      await writeFile(filepath, JSON.stringify(landlordData, null, 2), "utf-8");
      const scoreStr =
        s.composite_score !== null
          ? s.composite_score.toFixed(1)
          : "N/A";
      console.log(`  ${s.name}: score=${scoreStr}`);
    } catch (err) {
      console.warn(
        `  Warning: Could not update ${s.slug}.json:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  console.log("\nScoring complete.");
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

// Run directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("score.ts")
) {
  score().catch((err) => {
    console.error("Score failed:", err);
    process.exit(1);
  });
}
