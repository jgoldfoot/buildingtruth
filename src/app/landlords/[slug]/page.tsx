import fs from "fs";
import path from "path";
import Link from "next/link";
import ScoreBadge from "@/components/ScoreBadge";
import TimelineChart from "@/components/charts/TimelineChart";
import CategoryBar from "@/components/charts/CategoryBar";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Address {
  street_number: string;
  street_name: string;
  street_suffix: string;
  units: number | null;
}

interface SeedLandlord {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
  principals: string[];
  known_llcs: string[];
  estimated_units: number | null;
  neighborhoods: string[];
  website: string | null;
  management_company: string | null;
  tier: number;
  addresses: Address[];
  address_coverage: string;
  notes: string;
}

interface Score {
  composite_score: number | null;
  insufficient_data: boolean;
  signals: {
    dbi_violations: { raw_value: number; percentile: number; weighted: number };
    eviction_rate: { raw_value: number; percentile: number; weighted: number };
    rent_board_petitions: {
      raw_value: number;
      percentile: number;
      weighted: number;
    };
    complaint_density: {
      raw_value: number;
      percentile: number;
      weighted: number;
    };
    permit_investment: {
      raw_value: number;
      percentile: number;
      weighted: number;
    };
  };
  record_counts: {
    dbi_complaints: number;
    eviction_notices: number;
    rent_board_petitions: number;
    three_eleven_cases: number;
    building_permits: number;
  };
  scored_at?: string;
}

interface LandlordData {
  id: string;
  name: string;
  slug: string;
  total_units: number;
  addresses: Address[];
  dbi_complaints: any[];
  eviction_notices: any[];
  rent_board_petitions: any[];
  three_eleven_cases: any[];
  building_permits: any[];
  score: Score;
}

// ---------------------------------------------------------------------------
// Data loading
// ---------------------------------------------------------------------------

const DATA_DIR = path.join(process.cwd(), "data", "landlords");
const SEED_PATH = path.join(process.cwd(), "data", "seed", "landlords.json");

function getSeedData(): SeedLandlord[] {
  return JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"));
}

function getLandlordData(slug: string): LandlordData | null {
  const filePath = path.join(DATA_DIR, `${slug}.json`);
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function getAllSlugs(): string[] {
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(".json", ""));
}

// ---------------------------------------------------------------------------
// Static params
// ---------------------------------------------------------------------------

export function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const seed = getSeedData().find((s) => s.slug === params.slug);
  const name = seed?.name ?? params.slug;
  return {
    title: `${name} - BuildingTruth`,
    description: `Public record dashboard for ${name}. View DBI complaints, evictions, rent board petitions, and more.`,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAddress(addr: Address): string {
  return `${addr.street_number} ${addr.street_name} ${addr.street_suffix}`;
}

const NO_FAULT_FIELDS = [
  "ellis_act_withdrawal",
  "owner_move_in",
  "demolition",
  "condo_conversion",
] as const;

function countNoFault(evictions: any[]): number {
  return evictions.filter((e) =>
    NO_FAULT_FIELDS.some((f) => e[f] === true)
  ).length;
}

function estimatedPermitInvestment(permits: any[]): string {
  const total = permits.reduce((sum: number, p: any) => {
    const cost = parseFloat(p.estimated_cost);
    return sum + (isNaN(cost) ? 0 : cost);
  }, 0);
  if (total >= 1_000_000) return `$${(total / 1_000_000).toFixed(1)}M`;
  if (total >= 1_000) return `$${(total / 1_000).toFixed(0)}K`;
  if (total > 0) return `$${total.toLocaleString()}`;
  return "N/A";
}

// ---------------------------------------------------------------------------
// Sub-components (server)
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="rounded-lg bg-[#1A1D27] p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
        {label}
      </p>
      <p
        className="mt-1 text-2xl font-bold"
        style={{ color: color ?? "#F1F5F9" }}
      >
        {value}
      </p>
    </div>
  );
}

function SignalBar({
  label,
  percentile,
  weighted,
  maxWeighted,
}: {
  label: string;
  percentile: number;
  weighted: number;
  maxWeighted: number;
}) {
  // percentile is 0-100 where higher is BETTER
  const barColor =
    percentile >= 70
      ? "#10B981"
      : percentile >= 40
        ? "#F59E0B"
        : "#EF4444";
  const widthPct = maxWeighted > 0 ? (weighted / maxWeighted) * 100 : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 text-sm text-[#94A3B8]">{label}</span>
      <div className="h-3 flex-1 rounded-full bg-[#0F1117]">
        <div
          className="h-3 rounded-full transition-all duration-700"
          style={{
            width: `${Math.max(widthPct, 2)}%`,
            backgroundColor: barColor,
          }}
        />
      </div>
      <span className="w-12 shrink-0 text-right text-sm font-semibold text-[#F1F5F9]">
        {weighted.toFixed(1)}
      </span>
    </div>
  );
}

function SectionDivider({ title }: { title: string }) {
  return (
    <div className="mb-6 mt-12 flex items-center gap-4">
      <h2 className="text-xl font-bold text-[#F1F5F9]">{title}</h2>
      <div className="h-px flex-1 bg-[#2D3348]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LandlordDashboardPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = getLandlordData(params.slug);
  const seedAll = getSeedData();
  const seed = seedAll.find((s) => s.slug === params.slug);

  if (!data || !seed) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-[#F1F5F9]">
          Landlord Not Found
        </h1>
        <p className="mt-4 text-[#94A3B8]">
          No data available for this landlord.
        </p>
        <Link
          href="/landlords"
          className="mt-6 inline-block text-[#3B82F6] hover:underline"
        >
          Back to directory
        </Link>
      </main>
    );
  }

  const score = data.score;
  const rc = score.record_counts;
  const signals = score.signals;

  const noFaultCount = countNoFault(data.eviction_notices);
  const totalRecords =
    rc.dbi_complaints +
    rc.eviction_notices +
    rc.rent_board_petitions +
    rc.three_eleven_cases +
    rc.building_permits;
  const displayUnits = seed.estimated_units ?? data.total_units ?? 0;

  // Collect unique neighborhoods from seed + data addresses
  const neighborhoods = new Set<string>(seed.neighborhoods);
  for (const c of data.dbi_complaints) {
    if (c.neighborhoods_analysis_boundaries)
      neighborhoods.add(c.neighborhoods_analysis_boundaries);
  }

  // Max weighted for signal bar scaling
  const maxWeighted = Math.max(
    signals.dbi_violations.weighted,
    signals.eviction_rate.weighted,
    signals.rent_board_petitions.weighted,
    signals.complaint_density.weighted,
    signals.permit_investment.weighted,
    30 // at least 30 for a reasonable bar
  );

  // All known addresses (seed + data)
  const allAddresses = seed.addresses.length > 0 ? seed.addresses : data.addresses;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-[#64748B]">
        <Link href="/landlords" className="hover:text-[#3B82F6]">
          Landlords
        </Link>
        <span className="mx-2">/</span>
        <span className="text-[#94A3B8]">{seed.name}</span>
      </nav>

      {/* ----------------------------------------------------------------- */}
      {/* Header */}
      {/* ----------------------------------------------------------------- */}
      <div className="mb-8 rounded-xl border border-[#2D3348] bg-[#1A1D27] p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          {/* Left: name + meta */}
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold text-[#F1F5F9]">{seed.name}</h1>

            {/* Aliases / LLCs */}
            {seed.aliases.length > 0 && (
              <p className="mt-2 text-sm text-[#94A3B8]">
                <span className="font-semibold text-[#64748B]">
                  Also known as:{" "}
                </span>
                {seed.aliases.join(", ")}
              </p>
            )}
            {seed.known_llcs.length > 0 && (
              <p className="mt-1 text-sm text-[#94A3B8]">
                <span className="font-semibold text-[#64748B]">LLCs: </span>
                {seed.known_llcs.join(", ")}
              </p>
            )}
            {seed.management_company && (
              <p className="mt-1 text-sm text-[#94A3B8]">
                <span className="font-semibold text-[#64748B]">
                  Management:{" "}
                </span>
                {seed.management_company}
              </p>
            )}
            {seed.notes && (
              <p className="mt-3 text-sm leading-relaxed text-[#94A3B8]">
                {seed.notes}
              </p>
            )}
          </div>

          {/* Right: score badge */}
          <div className="flex-shrink-0">
            <ScoreBadge score={score.composite_score} size="lg" />
          </div>
        </div>

        {/* Insufficient data notice */}
        {score.insufficient_data && (
          <div className="mt-4 rounded-lg border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-3 text-sm text-[#F59E0B]">
            Insufficient data to generate a score. This landlord&apos;s property
            portfolio may not yet be fully mapped.
          </div>
        )}

        {/* Key stats row */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard
            label="Est. Units"
            value={displayUnits ? `~${displayUnits.toLocaleString()}` : "N/A"}
          />
          <StatCard
            label="Known Properties"
            value={allAddresses.length}
          />
          <StatCard
            label="Neighborhoods"
            value={neighborhoods.size}
          />
          <StatCard label="Total Records" value={totalRecords} />
        </div>

        {/* Score breakdown bars */}
        {!score.insufficient_data && (
          <div className="mt-6 space-y-2">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
              Score Breakdown
            </h3>
            <SignalBar
              label="DBI Violations"
              percentile={signals.dbi_violations.percentile}
              weighted={signals.dbi_violations.weighted}
              maxWeighted={maxWeighted}
            />
            <SignalBar
              label="Eviction Rate"
              percentile={signals.eviction_rate.percentile}
              weighted={signals.eviction_rate.weighted}
              maxWeighted={maxWeighted}
            />
            <SignalBar
              label="Rent Board"
              percentile={signals.rent_board_petitions.percentile}
              weighted={signals.rent_board_petitions.weighted}
              maxWeighted={maxWeighted}
            />
            <SignalBar
              label="311 Complaints"
              percentile={signals.complaint_density.percentile}
              weighted={signals.complaint_density.weighted}
              maxWeighted={maxWeighted}
            />
            <SignalBar
              label="Permit Investment"
              percentile={signals.permit_investment.percentile}
              weighted={signals.permit_investment.weighted}
              maxWeighted={maxWeighted}
            />
          </div>
        )}
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* DBI Complaints */}
      {/* ----------------------------------------------------------------- */}
      <SectionDivider title="DBI Complaints" />
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Total Complaints"
          value={rc.dbi_complaints}
          color={rc.dbi_complaints > 10 ? "#EF4444" : "#F1F5F9"}
        />
        <StatCard
          label="Per Unit"
          value={
            displayUnits > 0
              ? (rc.dbi_complaints / displayUnits).toFixed(2)
              : "N/A"
          }
        />
      </div>
      {data.dbi_complaints.length > 0 && (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <TimelineChart
            data={data.dbi_complaints}
            dateField="date_filed"
            title="DBI Complaints Over Time"
            color="#EF4444"
          />
          <CategoryBar
            data={data.dbi_complaints}
            categoryField="nov_category_description"
            title="Complaints by Category"
            color="#EF4444"
          />
        </div>
      )}
      {data.dbi_complaints.length === 0 && (
        <p className="mt-2 text-sm text-[#64748B]">
          No DBI complaints on file.
        </p>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Eviction Filings */}
      {/* ----------------------------------------------------------------- */}
      <SectionDivider title="Eviction Filings" />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Evictions"
          value={rc.eviction_notices}
          color={rc.eviction_notices > 5 ? "#EF4444" : "#F1F5F9"}
        />
        <StatCard
          label="No-Fault Evictions"
          value={noFaultCount}
          color={noFaultCount > 0 ? "#F59E0B" : "#F1F5F9"}
        />
        <StatCard
          label="Per Unit"
          value={
            displayUnits > 0
              ? (rc.eviction_notices / displayUnits).toFixed(2)
              : "N/A"
          }
        />
      </div>
      {data.eviction_notices.length > 0 && (
        <div className="mt-4">
          <TimelineChart
            data={data.eviction_notices}
            dateField="file_date"
            title="Eviction Filings Over Time"
            color="#F59E0B"
          />
        </div>
      )}
      {data.eviction_notices.length === 0 && (
        <p className="mt-2 text-sm text-[#64748B]">
          No eviction filings on record.
        </p>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Rent Board Petitions */}
      {/* ----------------------------------------------------------------- */}
      <SectionDivider title="Rent Board Petitions" />
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Total Petitions"
          value={rc.rent_board_petitions}
          color={rc.rent_board_petitions > 5 ? "#F59E0B" : "#F1F5F9"}
        />
        <StatCard
          label="Per Unit"
          value={
            displayUnits > 0
              ? (rc.rent_board_petitions / displayUnits).toFixed(2)
              : "N/A"
          }
        />
      </div>
      {data.rent_board_petitions.length > 0 && (
        <div className="mt-4">
          <TimelineChart
            data={data.rent_board_petitions}
            dateField="date_filed"
            title="Rent Board Petitions Over Time"
            color="#8B5CF6"
          />
        </div>
      )}
      {data.rent_board_petitions.length === 0 && (
        <p className="mt-2 text-sm text-[#64748B]">
          No rent board petitions on file.
        </p>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* 311 Complaints */}
      {/* ----------------------------------------------------------------- */}
      <SectionDivider title="311 Complaints" />
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard label="Total 311 Cases" value={rc.three_eleven_cases} />
        <StatCard
          label="Per Unit"
          value={
            displayUnits > 0
              ? (rc.three_eleven_cases / displayUnits).toFixed(2)
              : "N/A"
          }
        />
      </div>
      {data.three_eleven_cases.length > 0 && (
        <div className="mt-4">
          <TimelineChart
            data={data.three_eleven_cases}
            dateField="opened"
            title="311 Complaints Over Time"
            color="#3B82F6"
          />
        </div>
      )}
      {data.three_eleven_cases.length === 0 && (
        <p className="mt-2 text-sm text-[#64748B]">No 311 cases on file.</p>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Permit Activity */}
      {/* ----------------------------------------------------------------- */}
      <SectionDivider title="Permit Activity" />
      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard
          label="Total Permits"
          value={rc.building_permits}
          color="#10B981"
        />
        <StatCard
          label="Est. Investment"
          value={estimatedPermitInvestment(data.building_permits)}
          color="#10B981"
        />
      </div>
      {data.building_permits.length > 0 && (
        <div className="mt-4">
          <TimelineChart
            data={data.building_permits}
            dateField="filed_date"
            title="Permits Filed Over Time"
            color="#10B981"
          />
        </div>
      )}
      {data.building_permits.length === 0 && (
        <p className="mt-2 text-sm text-[#64748B]">
          No building permits on file.
        </p>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Known Properties */}
      {/* ----------------------------------------------------------------- */}
      {allAddresses.length > 0 && (
        <>
          <SectionDivider title="Known Properties" />
          <div className="overflow-x-auto rounded-xl border border-[#2D3348]">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#2D3348] bg-[#1A1D27]">
                  <th className="px-4 py-3 font-semibold text-[#94A3B8]">
                    Address
                  </th>
                  <th className="px-4 py-3 font-semibold text-[#94A3B8]">
                    Units
                  </th>
                </tr>
              </thead>
              <tbody>
                {allAddresses.map((addr, i) => (
                  <tr
                    key={i}
                    className="border-b border-[#2D3348]/50 transition-colors hover:bg-[#1A1D27]"
                  >
                    <td className="px-4 py-3 text-[#F1F5F9]">
                      {formatAddress(addr)}
                    </td>
                    <td className="px-4 py-3 text-[#94A3B8]">
                      {addr.units ?? "--"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ----------------------------------------------------------------- */}
      {/* Footer */}
      {/* ----------------------------------------------------------------- */}
      <footer className="mt-16 border-t border-[#2D3348] pt-6 text-sm text-[#64748B]">
        <p>
          Data last updated:{" "}
          {score.scored_at
            ? new Date(score.scored_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Unknown"}
          . All data sourced from SF Open Data.
        </p>
        {seed.address_coverage === "partial" && (
          <p className="mt-1">
            This landlord&apos;s property portfolio is partially mapped.
            Additional addresses may exist.
          </p>
        )}
      </footer>
    </main>
  );
}
