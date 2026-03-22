"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import ScoreBadge from "@/components/ScoreBadge";
import leaderboardData from "../../../data/leaderboard.json";
import seedLandlords from "../../../data/seed/landlords.json";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LeaderboardEntry {
  id: string;
  name: string;
  slug: string;
  total_units: number;
  composite_score: number | null;
  insufficient_data: boolean;
  record_counts: {
    dbi_complaints: number;
    eviction_notices: number;
    rent_board_petitions: number;
    three_eleven_cases: number;
    building_permits: number;
  };
}

interface SeedLandlord {
  id: string;
  name: string;
  slug: string;
  aliases: string[];
  estimated_units: number | null;
  neighborhoods: string[];
  tier: number;
}

type ScoreFilter = "all" | "good" | "fair" | "poor";
type TierFilter = "all" | 1 | 2 | 3 | 4;
type ViewMode = "card" | "table";
type SortKey =
  | "name"
  | "score"
  | "units"
  | "dbi"
  | "evictions"
  | "petitions"
  | "three11";
type SortDir = "asc" | "desc";

// ---------------------------------------------------------------------------
// Merge leaderboard + seed data
// ---------------------------------------------------------------------------

const seedMap = new Map(
  (seedLandlords as SeedLandlord[]).map((s) => [s.id, s])
);

interface MergedLandlord extends LeaderboardEntry {
  estimated_units: number | null;
  neighborhoods: string[];
  tier: number;
}

const merged: MergedLandlord[] = (
  leaderboardData.leaderboard as LeaderboardEntry[]
).map((lb) => {
  const seed = seedMap.get(lb.id);
  return {
    ...lb,
    estimated_units: seed?.estimated_units ?? null,
    neighborhoods: seed?.neighborhoods ?? [],
    tier: seed?.tier ?? 4,
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function tierLabel(tier: number): string {
  switch (tier) {
    case 1:
      return "Mega";
    case 2:
      return "Major";
    case 3:
      return "Notable";
    default:
      return "Other";
  }
}

function matchesScoreFilter(
  score: number | null,
  filter: ScoreFilter
): boolean {
  if (filter === "all") return true;
  if (score === null) return filter === "poor"; // show nulls in poor
  if (filter === "good") return score >= 70;
  if (filter === "fair") return score >= 40 && score < 70;
  if (filter === "poor") return score < 40;
  return true;
}

function totalRecords(rc: LeaderboardEntry["record_counts"]): number {
  return (
    rc.dbi_complaints +
    rc.eviction_notices +
    rc.rent_board_petitions +
    rc.three_eleven_cases +
    rc.building_permits
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function LandlordsDirectoryPage() {
  const [search, setSearch] = useState("");
  const [scoreFilter, setScoreFilter] = useState<ScoreFilter>("all");
  const [tierFilter, setTierFilter] = useState<TierFilter>("all");
  const [view, setView] = useState<ViewMode>("card");
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(() => {
    let list = merged.filter((l) => {
      const nameMatch = l.name.toLowerCase().includes(search.toLowerCase());
      const scoreMatch = matchesScoreFilter(l.composite_score, scoreFilter);
      const tierMatch = tierFilter === "all" || l.tier === tierFilter;
      return nameMatch && scoreMatch && tierMatch;
    });

    list.sort((a, b) => {
      let av: number, bv: number;
      switch (sortKey) {
        case "name":
          return sortDir === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        case "score":
          av = a.composite_score ?? -1;
          bv = b.composite_score ?? -1;
          break;
        case "units":
          av = a.estimated_units ?? a.total_units ?? 0;
          bv = b.estimated_units ?? b.total_units ?? 0;
          break;
        case "dbi":
          av = a.record_counts.dbi_complaints;
          bv = b.record_counts.dbi_complaints;
          break;
        case "evictions":
          av = a.record_counts.eviction_notices;
          bv = b.record_counts.eviction_notices;
          break;
        case "petitions":
          av = a.record_counts.rent_board_petitions;
          bv = b.record_counts.rent_board_petitions;
          break;
        case "three11":
          av = a.record_counts.three_eleven_cases;
          bv = b.record_counts.three_eleven_cases;
          break;
        default:
          av = 0;
          bv = 0;
      }
      return sortDir === "asc" ? av - bv : bv - av;
    });

    return list;
  }, [search, scoreFilter, tierFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  const sortArrow = (key: SortKey) =>
    sortKey === key ? (sortDir === "asc" ? " \u25B2" : " \u25BC") : "";

  // -------------------------------------------------------------------------
  // Filter button helper
  // -------------------------------------------------------------------------
  function FilterBtn({
    active,
    onClick,
    children,
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) {
    return (
      <button
        onClick={onClick}
        className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
          active
            ? "bg-[#3B82F6] text-white"
            : "bg-[#1A1D27] text-[#94A3B8] hover:bg-[#252836] hover:text-[#F1F5F9]"
        }`}
      >
        {children}
      </button>
    );
  }

  // -------------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------------
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#F1F5F9]">
          SF Landlord Directory
        </h1>
        <p className="mt-2 text-[#94A3B8]">
          Browse and compare San Francisco&apos;s largest landlords by public
          record data.
        </p>
      </div>

      {/* Controls row */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Search */}
        <div className="relative max-w-md flex-1">
          <input
            type="text"
            placeholder="Search landlords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-[#2D3348] bg-[#1A1D27] px-4 py-2.5 pl-10 text-[#F1F5F9] placeholder-[#64748B] outline-none ring-[#3B82F6] transition-colors focus:border-[#3B82F6] focus:ring-1"
          />
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
            />
          </svg>
        </div>

        {/* View toggle */}
        <div className="flex gap-1 rounded-lg bg-[#1A1D27] p-1">
          <button
            onClick={() => setView("card")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "card"
                ? "bg-[#3B82F6] text-white"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            }`}
          >
            Cards
          </button>
          <button
            onClick={() => setView("table")}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              view === "table"
                ? "bg-[#3B82F6] text-white"
                : "text-[#94A3B8] hover:text-[#F1F5F9]"
            }`}
          >
            Table
          </button>
        </div>
      </div>

      {/* Filters row */}
      <div className="mb-6 flex flex-wrap gap-6">
        {/* Score filter */}
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Score
          </span>
          <div className="flex gap-1">
            {(["all", "good", "fair", "poor"] as ScoreFilter[]).map((f) => (
              <FilterBtn
                key={f}
                active={scoreFilter === f}
                onClick={() => setScoreFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </FilterBtn>
            ))}
          </div>
        </div>

        {/* Tier filter */}
        <div>
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#64748B]">
            Tier
          </span>
          <div className="flex gap-1">
            <FilterBtn
              active={tierFilter === "all"}
              onClick={() => setTierFilter("all")}
            >
              All
            </FilterBtn>
            {([1, 2, 3, 4] as const).map((t) => (
              <FilterBtn
                key={t}
                active={tierFilter === t}
                onClick={() => setTierFilter(t)}
              >
                {tierLabel(t)}
              </FilterBtn>
            ))}
          </div>
        </div>
      </div>

      {/* Result count */}
      <p className="mb-4 text-sm text-[#64748B]">
        {filtered.length} landlord{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Card view */}
      {view === "card" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <Link
              key={l.id}
              href={`/landlords/${l.slug}`}
              className="group rounded-xl border border-[#2D3348] bg-[#1A1D27] p-5 transition-all hover:border-[#3B82F6]/40 hover:shadow-lg hover:shadow-[#3B82F6]/5"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-[#F1F5F9] group-hover:text-[#3B82F6]">
                    {l.name}
                  </h2>
                  <span className="text-xs text-[#64748B]">
                    {tierLabel(l.tier)} Landlord
                  </span>
                </div>
                <div className="ml-3 flex-shrink-0">
                  <ScoreBadge score={l.composite_score} size="sm" />
                </div>
              </div>

              {/* Units */}
              <p className="mb-2 text-sm text-[#94A3B8]">
                {l.estimated_units
                  ? `~${l.estimated_units.toLocaleString()} units`
                  : l.total_units
                    ? `${l.total_units} mapped unit${l.total_units !== 1 ? "s" : ""}`
                    : "Units unknown"}
              </p>

              {/* Neighborhoods */}
              {l.neighborhoods.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1">
                  {l.neighborhoods.slice(0, 4).map((n) => (
                    <span
                      key={n}
                      className="rounded-full bg-[#0F1117] px-2 py-0.5 text-[10px] text-[#94A3B8]"
                    >
                      {n}
                    </span>
                  ))}
                  {l.neighborhoods.length > 4 && (
                    <span className="rounded-full bg-[#0F1117] px-2 py-0.5 text-[10px] text-[#64748B]">
                      +{l.neighborhoods.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Record counts */}
              <div className="flex gap-3 border-t border-[#2D3348] pt-3 text-xs text-[#64748B]">
                <span>{totalRecords(l.record_counts)} records</span>
                {l.record_counts.dbi_complaints > 0 && (
                  <span>{l.record_counts.dbi_complaints} DBI</span>
                )}
                {l.record_counts.eviction_notices > 0 && (
                  <span>{l.record_counts.eviction_notices} evict.</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Table view */}
      {view === "table" && (
        <div className="overflow-x-auto rounded-xl border border-[#2D3348]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#2D3348] bg-[#1A1D27]">
                {(
                  [
                    ["name", "Name"],
                    ["score", "Score"],
                    ["units", "Units"],
                    ["dbi", "DBI"],
                    ["evictions", "Evictions"],
                    ["petitions", "Petitions"],
                    ["three11", "311"],
                  ] as [SortKey, string][]
                ).map(([key, label]) => (
                  <th
                    key={key}
                    onClick={() => toggleSort(key)}
                    className="cursor-pointer px-4 py-3 font-semibold text-[#94A3B8] transition-colors select-none hover:text-[#F1F5F9]"
                  >
                    {label}
                    {sortArrow(key)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className="border-b border-[#2D3348]/50 transition-colors hover:bg-[#1A1D27]"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/landlords/${l.slug}`}
                      className="font-medium text-[#F1F5F9] hover:text-[#3B82F6]"
                    >
                      {l.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <ScoreBadge score={l.composite_score} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {l.estimated_units
                      ? `~${l.estimated_units.toLocaleString()}`
                      : l.total_units || "--"}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {l.record_counts.dbi_complaints || "--"}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {l.record_counts.eviction_notices || "--"}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {l.record_counts.rent_board_petitions || "--"}
                  </td>
                  <td className="px-4 py-3 text-[#94A3B8]">
                    {l.record_counts.three_eleven_cases || "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-lg text-[#64748B]">
            No landlords match your filters.
          </p>
        </div>
      )}
    </main>
  );
}
