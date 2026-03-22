import Link from "next/link";
import ScoreBadge from "@/components/ScoreBadge";
import leaderboardData from "../../data/leaderboard.json";

interface LandlordEntry {
  id: string;
  name: string;
  slug: string;
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

function getTotalRecords(rc: LandlordEntry["record_counts"]): number {
  return (
    rc.dbi_complaints +
    rc.eviction_notices +
    rc.rent_board_petitions +
    rc.three_eleven_cases +
    rc.building_permits
  );
}

export default function HomePage() {
  const all = leaderboardData.leaderboard as LandlordEntry[];
  const scored = all.filter(
    (l) => l.composite_score !== null && !l.insufficient_data
  );

  const topRated = [...scored]
    .sort((a, b) => (b.composite_score ?? 0) - (a.composite_score ?? 0))
    .slice(0, 3);

  const mostComplaints = [...scored]
    .sort((a, b) => (a.composite_score ?? 0) - (b.composite_score ?? 0))
    .slice(0, 3);

  return (
    <main className="flex-1">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Gradient background decoration */}
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        >
          <div className="absolute -top-24 left-1/2 h-[480px] w-[720px] -translate-x-1/2 rounded-full bg-[#3B82F6]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-24 sm:px-6 sm:pt-32 lg:px-8 lg:pt-40">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#F1F5F9] sm:text-5xl lg:text-6xl">
              Know your landlord
              <br />
              <span className="text-[#3B82F6]">before you sign the lease.</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[#94A3B8]">
              BuildingTruth aggregates San Francisco public records &mdash; DBI
              complaints, eviction filings, rent board petitions, and more
              &mdash; into a single transparency score for the city&rsquo;s
              landlords.
            </p>

            {/* Search (static placeholder) */}
            <div className="mx-auto mt-10 max-w-xl">
              <div className="flex rounded-lg border border-white/10 bg-[#1A1D27] shadow-lg shadow-black/20 focus-within:border-[#3B82F6]/50 focus-within:ring-1 focus-within:ring-[#3B82F6]/50 transition-all">
                <div className="flex items-center pl-4 text-[#94A3B8]">
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by landlord name or address..."
                  className="w-full bg-transparent px-3 py-3.5 text-sm text-[#F1F5F9] placeholder:text-[#94A3B8]/60 outline-none"
                  readOnly
                />
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/landlords"
                className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#3B82F6]/20 hover:bg-[#2563EB] transition-colors"
              >
                Browse All Landlords
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Leaderboard ──────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Top Rated */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#F1F5F9]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#10B981]" />
              Top Rated
            </h2>
            <div className="space-y-3">
              {topRated.length === 0 && (
                <p className="text-sm text-[#94A3B8]">
                  Not enough data to display top-rated landlords yet.
                </p>
              )}
              {topRated.map((l) => (
                <Link
                  key={l.id}
                  href={`/landlords/${l.slug}`}
                  className="flex items-center gap-4 rounded-lg border border-[#10B981]/20 bg-[#1A1D27] px-4 py-4 hover:border-[#10B981]/40 hover:bg-[#10B981]/5 transition-all"
                >
                  <ScoreBadge score={l.composite_score} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#F1F5F9]">
                      {l.name}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {getTotalRecords(l.record_counts)} public records
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Most Complaints */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#F1F5F9]">
              <span className="inline-block h-2 w-2 rounded-full bg-[#EF4444]" />
              Most Complaints
            </h2>
            <div className="space-y-3">
              {mostComplaints.length === 0 && (
                <p className="text-sm text-[#94A3B8]">
                  Not enough data to display complaint rankings yet.
                </p>
              )}
              {mostComplaints.map((l) => (
                <Link
                  key={l.id}
                  href={`/landlords/${l.slug}`}
                  className="flex items-center gap-4 rounded-lg border border-[#EF4444]/20 bg-[#1A1D27] px-4 py-4 hover:border-[#EF4444]/40 hover:bg-[#EF4444]/5 transition-all"
                >
                  <ScoreBadge score={l.composite_score} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#F1F5F9]">
                      {l.name}
                    </p>
                    <p className="text-xs text-[#94A3B8]">
                      {getTotalRecords(l.record_counts)} public records
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────── */}
      <section className="border-t border-white/5 bg-[#1A1D27]/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold text-[#F1F5F9]">
            How It Works
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-center text-sm text-[#94A3B8]">
            Four steps from raw city data to actionable landlord insights.
          </p>

          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: (
                  <svg className="h-8 w-8 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                  </svg>
                ),
                title: "We pull public data",
                desc: "DBI complaints, eviction notices, rent board petitions, 311 cases, and building permits from DataSF.",
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.114-9.114 1.757-1.757a4.5 4.5 0 0 1 6.364 6.364l-4.5 4.5a4.5 4.5 0 0 1-7.244-1.242" />
                  </svg>
                ),
                title: "Match to landlord portfolios",
                desc: "Records are linked to property owners across their full portfolio of addresses.",
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                  </svg>
                ),
                title: "Calculate transparency scores",
                desc: "A weighted composite of violation rates, evictions, complaints, and permit investment.",
              },
              {
                icon: (
                  <svg className="h-8 w-8 text-[#3B82F6]" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                ),
                title: "You make informed decisions",
                desc: "Review scores, drill into details, and know your landlord before signing.",
              },
            ].map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center rounded-lg border border-white/5 bg-[#1A1D27] p-6 text-center"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#3B82F6]/10">
                  {step.icon}
                </div>
                <p className="text-sm font-semibold text-[#F1F5F9]">
                  {step.title}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-[#94A3B8]">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/methodology"
              className="text-sm font-medium text-[#3B82F6] hover:text-[#60A5FA] transition-colors"
            >
              Learn more about our methodology &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Data Sources ─────────────────────────────────────── */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <h2 className="text-center text-2xl font-bold text-[#F1F5F9]">
          Data Sources
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-center text-sm text-[#94A3B8]">
          All data sourced from San Francisco Open Data Portal. No
          user-submitted reviews.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              name: "SF DBI",
              desc: "Building complaints & violations",
              href: "https://data.sfgov.org",
            },
            {
              name: "SF Rent Board",
              desc: "Rent petitions & mediations",
              href: "https://data.sfgov.org",
            },
            {
              name: "SF 311",
              desc: "Resident service requests",
              href: "https://data.sfgov.org",
            },
            {
              name: "DataSF",
              desc: "Open Data Portal aggregator",
              href: "https://data.sfgov.org",
            },
          ].map((source) => (
            <a
              key={source.name}
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col items-center rounded-lg border border-white/5 bg-[#1A1D27] p-5 text-center hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 transition-all"
            >
              <p className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#3B82F6] transition-colors">
                {source.name}
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">{source.desc}</p>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}
