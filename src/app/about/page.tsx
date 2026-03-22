import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About — BuildingTruth",
  description:
    "About BuildingTruth: a public data project making SF landlord track records transparent for renters.",
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-white/10 bg-[#1A1D27]">
          <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
            <p className="text-sm font-medium uppercase tracking-widest text-[#3B82F6] mb-3">
              About
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#F1F5F9] sm:text-4xl">
              What Is BuildingTruth?
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-[#94A3B8] max-w-2xl">
              A public data aggregation project that makes landlord track
              records visible to San Francisco renters — entirely powered by
              city government data, with no user-submitted reviews.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
          {/* What It Is */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-4">
              What BuildingTruth Does
            </h2>
            <div className="rounded-lg border border-white/10 bg-[#1A1D27] p-6 space-y-4">
              <div className="flex gap-3">
                <span className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  <span className="font-medium text-[#F1F5F9]">
                    Aggregates five SF public data sources
                  </span>{" "}
                  — building violations, eviction notices, Rent Board petitions,
                  311 complaints, and building permits — into a single
                  transparency score for each landlord.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  <span className="font-medium text-[#F1F5F9]">
                    Connects LLC networks to real landlords
                  </span>{" "}
                  — many landlords operate under multiple LLCs, trusts, and
                  management companies. BuildingTruth resolves these entities so
                  you can see the full picture.
                </p>
              </div>
              <div className="flex gap-3">
                <span className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  <span className="font-medium text-[#F1F5F9]">
                    Purely data-driven
                  </span>{" "}
                  — no user-submitted reviews, no opinions, no crowdsourced
                  ratings. Every data point comes from official city records that
                  anyone can verify.
                </p>
              </div>
            </div>
          </section>

          {/* Why It Exists */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-4">
              Why It Exists
            </h2>
            <div className="rounded-lg border border-white/10 bg-[#1A1D27] p-6 space-y-4">
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                <span className="font-medium text-[#F1F5F9]">
                  Renters deserve to know their landlord&apos;s track record
                  before signing a lease.
                </span>{" "}
                When you buy a car, you can check its accident history. When you
                hire a contractor, you can check their license status. But when
                you sign a lease — often the largest financial commitment in your
                life — there is no easy way to check your landlord&apos;s
                history of violations, evictions, or complaints.
              </p>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                The data exists. The SF Department of Building Inspection, Rent
                Board, and 311 all publish detailed records. But this
                information is scattered across multiple city databases with
                different formats, search interfaces, and address conventions.
                No one has time to manually cross-reference five different
                portals for every apartment they consider.
              </p>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                LLC networks make the problem worse. A landlord with a history
                of violations can create a new LLC for each building, making it
                nearly impossible for renters to connect the dots.
              </p>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                BuildingTruth was inspired by projects like JustFix&apos;s{" "}
                <a
                  href="https://whoownswhat.justfix.org/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B82F6] hover:underline"
                >
                  Who Owns What
                </a>{" "}
                in New York City and research by the{" "}
                <a
                  href="https://antievictionmap.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B82F6] hover:underline"
                >
                  Anti-Eviction Mapping Project
                </a>
                .
              </p>
            </div>
          </section>

          {/* What It Is Not */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-4">
              What BuildingTruth Is Not
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "Not Legal Advice",
                  text: "Scores and data are informational only. For legal questions about your tenancy, consult a tenant rights organization or attorney.",
                },
                {
                  title: "Not a Review Site",
                  text: "There are no user-submitted reviews or ratings. Every data point comes from official city government records.",
                },
                {
                  title: "Not a Government Agency",
                  text: "BuildingTruth is not affiliated with, endorsed by, or operated by the City & County of San Francisco or any government agency.",
                },
                {
                  title: "Not a Verdict",
                  text: "Transparency scores are a data-driven index, not a judgment. Landlords with low scores may have legitimate explanations.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-lg border border-white/10 bg-[#1A1D27] p-5"
                >
                  <h3 className="text-sm font-semibold text-[#F1F5F9] mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Data Sources */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-4">
              Data Sources
            </h2>
            <div className="rounded-lg border border-white/10 bg-[#1A1D27] p-6">
              <ul className="space-y-3">
                {[
                  {
                    name: "SF Department of Building Inspection",
                    desc: "Complaints, violations, and permit records",
                  },
                  {
                    name: "SF Rent Board",
                    desc: "Tenant and landlord petition filings",
                  },
                  {
                    name: "SF 311",
                    desc: "City service requests related to housing habitability",
                  },
                  {
                    name: "DataSF Open Data Portal",
                    desc: "The city\u2019s central hub for public datasets",
                  },
                ].map((source) => (
                  <li key={source.name} className="flex gap-3 text-sm">
                    <span className="mt-1 flex-shrink-0 h-1.5 w-1.5 rounded-full bg-[#3B82F6]" />
                    <span className="text-[#94A3B8] leading-relaxed">
                      <span className="font-medium text-[#F1F5F9]">
                        {source.name}
                      </span>{" "}
                      — {source.desc}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-[#94A3B8]">
                Our approach builds on research by the{" "}
                <a
                  href="https://antievictionmap.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#3B82F6] hover:underline"
                >
                  Anti-Eviction Mapping Project
                </a>
                . For a full breakdown of how each dataset is used, see our{" "}
                <Link
                  href="/methodology"
                  className="text-[#3B82F6] hover:underline"
                >
                  methodology
                </Link>
                .
              </p>
            </div>
          </section>

          {/* Legal Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-4">
              Legal Disclaimer
            </h2>
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-6">
              <div className="flex gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  BuildingTruth aggregates publicly available government data
                  from the San Francisco Open Data Portal. The transparency
                  scores presented represent a data-driven index based on
                  official city records and do not constitute legal advice, a
                  legal judgment, or an accusation. Landlords with low scores
                  may have legitimate explanations for elevated complaint or
                  eviction rates. Users should conduct their own due diligence
                  and consult appropriate legal counsel for any housing-related
                  decisions.
                </p>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-[#F1F5F9] mb-4">
              Contact
            </h2>
            <div className="rounded-lg border border-white/10 bg-[#1A1D27] p-6">
              <p className="text-sm text-[#94A3B8] leading-relaxed mb-4">
                Questions, corrections, or data issues? We welcome feedback.
              </p>
              <a
                href="https://github.com/buildingtruth/buildingtruth/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-4 py-2.5 text-sm font-medium text-[#3B82F6] hover:bg-[#3B82F6]/20 transition-colors"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Open an issue on GitHub
              </a>
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
