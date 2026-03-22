import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-[#1A1D27]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Brand / Disclaimer */}
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold text-[#F1F5F9] mb-3">BuildingTruth</p>
            <p className="text-xs leading-relaxed text-[#94A3B8] max-w-xl">
              BuildingTruth aggregates publicly available government data. Scores
              represent a data-driven index, not a legal judgment. See our{" "}
              <Link href="/methodology" className="underline hover:text-[#F1F5F9] transition-colors">
                methodology
              </Link>{" "}
              for full details.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-sm font-semibold text-[#F1F5F9] mb-3">Links</p>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/methodology"
                  className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                >
                  Methodology
                </Link>
              </li>
              <li>
                <a
                  href="https://data.sfgov.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
                >
                  Data Sources&nbsp;&#8599;
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Data source credits */}
        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="text-xs text-[#94A3B8]">
            Data sourced from:{" "}
            <span className="text-[#F1F5F9]">
              SF Department of Building Inspection, SF Rent Board, SF 311, DataSF Open Data Portal
            </span>
          </p>
          <p className="mt-2 text-xs text-[#94A3B8]/60">
            &copy; {new Date().getFullYear()} BuildingTruth. Not affiliated with the City &amp; County of San Francisco.
          </p>
        </div>
      </div>
    </footer>
  );
}
