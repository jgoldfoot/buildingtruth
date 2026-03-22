import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Methodology — BuildingTruth",
  description:
    "How BuildingTruth calculates landlord transparency scores using SF public data sources.",
};

const dataSources = [
  {
    name: "DBI Complaints & Violations",
    dataset: "nbtm-fbw5",
    description:
      "Building code violations and housing inspection records from the SF Department of Building Inspection. Covers structural, plumbing, electrical, and habitability violations.",
    url: "https://data.sfgov.org/Housing-and-Buildings/Department-of-Building-Inspection-Complaints/nbtm-fbw5",
  },
  {
    name: "Eviction Notices",
    dataset: "5cei-gny5",
    description:
      "All eviction filings in San Francisco, including fault-based and no-fault evictions such as owner move-in, Ellis Act, and capital improvement evictions.",
    url: "https://data.sfgov.org/Housing-and-Buildings/Eviction-Notices/5cei-gny5",
  },
  {
    name: "Rent Board Petitions",
    dataset: "6swy-cmkq",
    description:
      "Tenant and landlord petitions filed with the SF Rent Board. Includes rent increase disputes, decrease petitions, and habitability reduction claims.",
    url: "https://data.sfgov.org/Housing-and-Buildings/Rent-Board-Petitions/6swy-cmkq",
  },
  {
    name: "311 Cases",
    dataset: "vw6y-z8j6",
    description:
      "Habitability-related city service requests filed through SF 311. Filtered to housing and building categories relevant to tenant living conditions.",
    url: "https://data.sfgov.org/City-Infrastructure/311-Cases/vw6y-z8j6",
  },
  {
    name: "Building Permits",
    dataset: "i98e-djp9",
    description:
      "Renovation and improvement permits filed with DBI. Used as a positive signal indicating landlord investment in property maintenance and upgrades.",
    url: "https://data.sfgov.org/Housing-and-Buildings/Building-Permits/i98e-djp9",
  },
];

const scoringSignals = [
  {
    signal: "DBI Violations",
    weight: "30%",
    measures: "Code violations per unit per year",
  },
  {
    signal: "Eviction Rate",
    weight: "25%",
    measures: "Evictions per unit per year (2x weight for no-fault)",
  },
  {
    signal: "Rent Board Petitions",
    weight: "20%",
    measures: "Sustained tenant petitions per unit per year",
  },
  {
    signal: "311 Complaints",
    weight: "15%",
    measures: "Habitability complaints per unit per year",
  },
  {
    signal: "Permit Investment",
    weight: "10%",
    measures: "Permits per unit per year (positive signal)",
  },
];

const scoreRanges = [
  {
    range: "70 \u2013 100",
    label: "Good",
    color: "#22C55E",
    bg: "bg-green-500/10 border-green-500/20",
    description:
      "Below-average complaint and eviction rates. Evidence of property investment through permits. Indicates a landlord who generally maintains properties and follows regulations.",
  },
  {
    range: "40 \u2013 69",
    label: "Fair",
    color: "#F59E0B",
    bg: "bg-amber-500/10 border-amber-500/20",
    description:
      "Moderate complaint or eviction rates. May have some history of violations but not consistently problematic. Worth investigating specific records before signing a lease.",
  },
  {
    range: "0 \u2013 39",
    label: "Poor",
    color: "#EF4444",
    bg: "bg-red-500/10 border-red-500/20",
    description:
      "High rates of violations, evictions, or habitability complaints relative to portfolio size. Elevated use of no-fault evictions or sustained Rent Board petitions against them.",
  },
];

const limitations = [
  "Address coverage is partial for many landlords. We may not have mapped all properties in a landlord's portfolio.",
  "Not all complaints are equally severe. A minor code violation and a major habitability failure are weighted the same in the current model.",
  "The score does not capture tenant harassment, informal intimidation tactics, or rent gouging that falls below legal thresholds.",
  "Positive permit activity may include demolition permits or permits that displace tenants, which are not inherently beneficial.",
  "Data reflects complaints filed, not complaints verified or sustained. Some complaints may be unfounded.",
  "This is a transparency index, not a legal judgment. A low score is not proof of wrongdoing, and a high score does not guarantee a good landlord.",
];

export default function MethodologyPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-white/10 bg-[#1A1D27]">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6] mb-3">
              Methodology
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
              How Scores Are Calculated
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#94A3B8] max-w-2xl">
              BuildingTruth combines five public data sources into a single
              transparency score. Every metric, weight, and normalization step is
              documented here so you can evaluate our methodology yourself.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
          {/* Data Sources */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
              Data Sources
            </h2>
            <p className="text-[#94A3B8] mb-6">
              All data comes from{" "}
              <a
                href="https://data.sfgov.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3B82F6] hover:underline"
              >
                data.sfgov.org
              </a>
              , the City of San Francisco&apos;s open data portal. Datasets are
              updated regularly by city agencies. No API key is required to
              access any of these sources.
            </p>
            <div className="space-y-4">
              {dataSources.map((source) => (
                <div
                  key={source.dataset}
                  className="rounded-lg border border-white/10 bg-[#1A1D27] p-5"
                >
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-2">
                    <h3 className="text-base font-semibold text-[#F1F5F9]">
                      {source.name}
                    </h3>
                    <code className="text-xs text-[#3B82F6] bg-[#3B82F6]/10 px-2 py-0.5 rounded">
                      {source.dataset}
                    </code>
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed mb-3">
                    {source.description}
                  </p>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#3B82F6] hover:underline"
                  >
                    View on DataSF
                    <span aria-hidden="true">&#8599;</span>
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Address Matching */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
              Address Matching
            </h2>
            <div className="rounded-lg border border-white/10 bg-[#1A1D27] p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">
                  Normalization
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  All addresses are normalized to a canonical format:
                  uppercased, with standardized street suffixes (ST, AVE, BLVD),
                  unit numbers stripped or normalized, and common abbreviations
                  expanded. This allows matching across datasets that may format
                  addresses differently.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">
                  Landlord-to-Address Mapping
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Addresses are matched against a curated mapping of landlords
                  to their known properties. This mapping is built from public
                  property records, DBI filings, and Rent Board data.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">
                  Entity Resolution
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Many landlords operate under multiple LLCs, trusts, or
                  management companies. Connecting these entities to a single
                  landlord profile is a manual and ongoing process. Coverage
                  varies by landlord and may be incomplete.
                </p>
              </div>
            </div>
          </section>

          {/* Scoring Formula */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
              Scoring Formula
            </h2>
            <p className="text-[#94A3B8] mb-6">
              Each landlord receives a composite score from 0 to 100, where
              higher scores indicate a better track record. The score is a
              weighted sum of five normalized signals.
            </p>
            <div className="overflow-x-auto rounded-lg border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#1A1D27] text-left">
                    <th className="px-5 py-3 font-semibold text-[#F1F5F9]">
                      Signal
                    </th>
                    <th className="px-5 py-3 font-semibold text-[#F1F5F9] text-center">
                      Weight
                    </th>
                    <th className="px-5 py-3 font-semibold text-[#F1F5F9]">
                      What It Measures
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {scoringSignals.map((row) => (
                    <tr
                      key={row.signal}
                      className="bg-[#0F1117] hover:bg-[#1A1D27]/60 transition-colors"
                    >
                      <td className="px-5 py-3 font-medium text-[#F1F5F9] whitespace-nowrap">
                        {row.signal}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-block rounded-full bg-[#3B82F6]/10 px-3 py-0.5 text-xs font-semibold text-[#3B82F6]">
                          {row.weight}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-[#94A3B8]">
                        {row.measures}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Normalization */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
              Normalization
            </h2>
            <div className="rounded-lg border border-white/10 bg-[#1A1D27] p-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">
                  Per-Unit-Per-Year
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  All metrics are calculated per unit per year. A landlord with
                  100 units and 10 complaints is treated differently than one
                  with 5 units and 10 complaints. This ensures fair comparison
                  across portfolios of different sizes.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">
                  Recency Weighting
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Recent activity is weighted more heavily than older records.
                  Events within the last 3 years receive 100% weight. Events
                  from 3&ndash;5 years ago receive 50% weight. Events older than
                  5 years receive 25% weight. This reflects improvement or
                  deterioration over time.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">
                  Percentile Ranking
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  Each signal is converted to a percentile rank across all
                  tracked landlords. A landlord at the 80th percentile for DBI
                  violations has fewer violations per unit than 80% of all
                  landlords in the system.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[#F1F5F9] mb-1">
                  Signal Inversion
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  For negative signals (violations, evictions, complaints,
                  petitions), the percentile is inverted so that fewer incidents
                  produce a higher score. For permit investment (a positive
                  signal), more permits produce a higher score directly.
                </p>
              </div>
            </div>
          </section>

          {/* Score Ranges */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">
              Score Ranges
            </h2>
            <div className="space-y-4">
              {scoreRanges.map((range) => (
                <div
                  key={range.label}
                  className={`rounded-lg border p-5 ${range.bg}`}
                >
                  <div className="flex items-baseline gap-3 mb-2">
                    <span
                      className="text-2xl font-bold"
                      style={{ color: range.color }}
                    >
                      {range.range}
                    </span>
                    <span
                      className="text-sm font-semibold uppercase tracking-wide"
                      style={{ color: range.color }}
                    >
                      {range.label}
                    </span>
                  </div>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {range.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Limitations */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-2">
              Known Limitations
            </h2>
            <p className="text-[#94A3B8] mb-6">
              No scoring model is perfect. We believe transparency about our own
              limitations is as important as the data we present.
            </p>
            <div className="rounded-lg border border-white/10 bg-[#1A1D27] p-6">
              <ul className="space-y-3">
                {limitations.map((item, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                    <span className="text-[#94A3B8] leading-relaxed">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Data Links */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-6">
              Data Links
            </h2>
            <div className="rounded-lg border border-white/10 bg-[#1A1D27] p-6">
              <p className="text-sm text-[#94A3B8] mb-4">
                All datasets are freely accessible on the San Francisco Open
                Data Portal. You can verify any of our data by querying these
                sources directly.
              </p>
              <ul className="space-y-2">
                {dataSources.map((source) => (
                  <li key={source.dataset}>
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-[#3B82F6] hover:underline"
                    >
                      <span>{source.name}</span>
                      <code className="text-xs text-[#94A3B8]">
                        ({source.dataset})
                      </code>
                      <span aria-hidden="true">&#8599;</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* Back link */}
          <div className="pt-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#3B82F6] hover:underline"
            >
              <span aria-hidden="true">&larr;</span>
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
