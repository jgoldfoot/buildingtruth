# SF Landlord Transparency Index — Initial Research
## Curated Landlord Roster & Public Data Sources

*Compiled March 22, 2026*

---

## 1. DATA SOURCES (All Free, No API Key Required)

### SF Open Data SODA API Endpoints

| Dataset | ID | API Endpoint | Key Fields |
|---|---|---|---|
| DBI Complaints & Violations | `nbtm-fbw5` | `https://data.sfgov.org/resource/nbtm-fbw5.json` | complaint_number, date_filed, block, lot, street_number, street_name, nov_category_description, status |
| Eviction Notices | `5cei-gny5` | `https://data.sfgov.org/resource/5cei-gny5.json` | eviction_id, address, file_date, constraints (breach, nuisance, Ellis Act, owner_move_in, etc.) |
| Rent Board Petitions | `6swy-cmkq` | `https://data.sfgov.org/resource/6swy-cmkq.json` | petition_id, address, filing_grounds (decrease in services, illegal increase, failure to repair, etc.) |
| 311 Cases | `vw6y-z8j6` | `https://data.sfgov.org/resource/vw6y-z8j6.json` | service_request_id, service_name, service_details, address, status |
| Building Permits | `i98e-djp9` | `https://data.sfgov.org/resource/i98e-djp9.json` | permit_number, permit_type, status, address, description |

**API Notes:**
- No API key required for SODA 2.0 endpoints
- Default limit is 1000 rows; append `?$limit=99999` for full datasets
- SoQL queries supported (WHERE, GROUP BY, ORDER BY, etc.)
- All data keyed to ADDRESS (block/lot), not landlord entity — entity resolution is manual

### Additional Public Sources (Manual/Scraped)

| Source | URL | What It Provides |
|---|---|---|
| Anti-Eviction Mapping Project / Evictorbook | `antievictionmap.com/evictors` | Landlord profiles, LLC networks, eviction histories, oral histories |
| Worst Evictors Bay Area | `worstevictorsbayarea.org/list/` | Curated list of worst evictors since 2017 with property portfolios and LLC aliases |
| SF Assessor-Recorder | `sfassessor.org` | Property ownership records (NOTE: system upgrade delayed updates until 2025) |
| SF Property Information Map (PIM) | `sfplanninggis.org/pim/` | Parcel data, zoning, permits, complaints per address |
| SF Chronicle Property Map | Via Regrid data | Owner name, mailing address, property details (2024 data) |
| Yelp Business Reviews | `yelp.com/biz/[company]` | Tenant reviews of property management companies |
| SF City Attorney Press Releases | `sfcityattorney.org` | Lawsuits and enforcement actions against landlords |
| SF Superior Court | `sfsuperiorcourt.org` | Unlawful detainer filings, civil lawsuits |

---

## 2. INITIAL LANDLORD ROSTER

### Tier 1: Mega-Landlords (1,000+ SF units)

#### 1. Veritas Investments / GreenTree Property Management / RentSFNow
- **Principal:** Yat-Pang Au (CEO/Founder)
- **Scale:** ~250+ buildings, thousands of units (SF's largest residential landlord)
- **Known LLCs:** 100+ LLCs registered to Veritas offices; many investor LLCs registered to Au
- **Neighborhoods:** Citywide, heavy in Nob Hill, Russian Hill, Pacific Heights, Tenderloin, NoPa
- **Notable:** Facing foreclosure on 66 buildings ($551M debt, March 2024). Sold 76-building portfolio to PCCP LLC for $540M. Sold 20 buildings to Prado Group ($124M). Organized tenant resistance via Veritas Tenants Association. Marketed furnished units via RentSFNow to evade rent control.
- **Status:** Actively downsizing/restructuring. Some properties now under third-party management.

#### 2. Mosser Companies / Mosser Capital / Mosser Living
- **Principal:** Neveo Mosser (CEO), founded by Charles Mosser (1955, deceased 2007)
- **Scale:** 61 SF buildings, 3,500+ units across SF/Oakland/LA
- **Known Addresses:** Heavy in Tenderloin, Western Addition, Nob Hill, Pacific Heights, SoMa, Hayes Valley, Mission
- **Notable:** 14 buildings placed in receivership (2025) — 428 units at risk. Defaulted on $88M loan (early 2024), lost 12 buildings/459 units. Family succession battle (Deborah Mosser vs. Neveo Mosser). JP Morgan Chase seeking foreclosure on 13 properties. Milinda Kendrick is current property manager at 952 Sutter.
- **Status:** Distressed. Actively losing properties to lenders.

#### 3. Equity Residential (REIT)
- **Principal:** Publicly traded (EQR)
- **Scale:** ~6,382 units, 23 properties in SF
- **Neighborhoods:** Along/near major thoroughfares, I-80 and I-280 corridors
- **Notable:** Chicago-based institutional REIT. Top apartment owner in SF by unit count. Primarily newer/luxury stock.
- **Status:** Stable institutional owner.

#### 4. Essex Property Trust (REIT)
- **Principal:** Publicly traded (ESS), founded by George Marcus
- **Scale:** ~4,810 units, 14 properties in SF
- **Notable Properties:** Mosso (463 units, LEED Gold), Hillsdale Garden (697 units)
- **Status:** Stable institutional owner.

#### 5. Maximus Real Estate Partners
- **Principal:** Robert Rosania
- **Scale:** ~4,140 units, 4 properties in SF
- **Notable Properties:** Parkmerced (3,221 units on 144 acres — purchased 2014 for $1.4B)
- **Notable:** Plans for $6B, 20-year transformation of Parkmerced. Managed by Sutro Management Group. Has faced eviction actions at Parkmerced.
- **Status:** Active.

#### 6. Lembi Group / CitiApartments / Skyline Realty / Trophy Properties / Ritz Apartments
- **Principal:** Frank Lembi (founder), Walter Lembi (deceased 2010), Taylor Lembi
- **Scale:** At peak: 307 buildings, 6,500+ units, 7,000+ residents (2006-07). Largest owner at the time.
- **Neighborhoods:** Heavy in Tenderloin and Nob Hill
- **Notable:** Sued by SF City Attorney (2006) for "egregious pattern of illegal business practices" — intimidation, armed guards, utility shutoffs, retaliatory evictions, illegal construction. Filed Chapter 11 (Feb 2020). Lost 51+ properties to foreclosure (2009). Many former Lembi properties now controlled by Veritas.
- **Status:** Largely defunct/restructured. Properties dispersed to other owners.

#### 7. Related Companies
- **Scale:** 4,222 SF multifamily units (862 fully affordable)
- **Notable:** NYC-based firm, $30B+ in assets globally.
- **Status:** Active institutional owner.

#### 8. Trinity Properties / Trinity Management
- **Scale:** 3,100+ units, 13 communities in SF
- **Neighborhoods:** Eastern SF, Market Street, NE SF
- **Notable Properties:** 33 8th Street at Trinity Place (540 units, under construction), 1000 Chestnut
- **Notable:** Surveillance concerns — 1177 Market Street uses extensive camera network via G4S.
- **Status:** Active developer/owner.

### Tier 2: Major Landlords (100-999 units)

#### 9. Prado Group / Prado Holdings
- **Principal:** Connected to Prometheus Real Estate (Jackie Diller Safier)
- **Scale:** 80+ properties developed since 2003, $1.38B value
- **Notable:** Recently absorbed 20 buildings (316 units) from Veritas for $124M. History of evictions in residential buildings.
- **LLCs:** Tpg Mgr LLC, Agpm Bridge11 GP LLC, Prado T9 LLC, Ag-prado SF Mf II LLC

#### 10. Prometheus Real Estate Group
- **Principal:** Jackie Diller Safier (Diller family)
- **Scale:** 13,000+ apartments Bay Area-wide (SF, Seattle, Portland), $2B company
- **Notable:** Largest private multifamily owner in the Bay Area. Based in San Mateo.

#### 11. Flynn Development Group
- **Principal:** Dennis P. Flynn (Russell Flynn, deceased 2020, was co-founder)
- **Scale:** 3,000+ residential and commercial units, Bay Area
- **Notable:** History of evictions to push rents, manipulation of Costa-Hawkins Act. Spent ~$870K to defeat tenant-protective Proposition 10.

#### 12. Robert Imhoff / Landmark Realty
- **Scale:** Hundreds of properties across SF + Kansas City holdings
- **Neighborhoods:** Heavy in Mission District
- **Notable:** Ellis Act evictions at 3301-3311 Cesar Chavez (12 units, targeting Latino families + 1969 tenant). Buyout/Ellis at 1136 Guerrero (5 units). Active in short-term rentals — 144 Airbnb listings. Fire code violations at 641 O'Farrell (21+ since 1989).
- **LLCs:** Various

#### 13. Sergio Iantorno / Golden Properties / Peninsula Realty / Realty West
- **Scale:** ~70 properties in SF
- **Neighborhoods:** Mission, Guerrero corridor, Folsom, Arguello
- **Notable:** Notorious for TIC conversions via OMI/Ellis evictions, Capital Improvement evictions. Harassment tactics. Attempted eviction of renowned artist Rene Yañez from 35-year Mission home. Sold 5 buildings to SF Community Land Trust / MEDA through Small Sites Program ($8.15M).
- **LLCs:** 130 Albion LLC, 421 Arguello Blvd HOA, 615 Minna Street LLC, Acme Studios LLC, 1053 Bush LLC, 101 Sanchez Associates LLC, 200 Arguello Associates LLC, 2323 Franklin Apartments LLC

#### 14. Sophie & Jeffrey Lau family
- **Scale:** 10 buildings, ~70 units
- **Neighborhoods:** Inner Richmond, Nob Hill, North Beach, Presidio Heights, Ingleside, West Portal
- **Notable:** 460+ DBI complaints across properties. 100+ lawsuits (1986-2023). Sued tenants ~60 times. Chronic issues: leaking ceilings, broken appliances, mold, no heat. Raised tenant rent from $1,800 to $8,000 (Columbus Ave, 2016). Failed to pay vacancy tax. Called SF's "most hated landlord" (SF Standard, March 2025).
- **Status:** Still operating.

#### 15. Anne Kihagi / Ana Swain / Xelan Properties / Renka Prop LLC
- **Scale:** At peak: ~11 buildings, ~50 units in SF
- **Neighborhoods:** Mission, Castro, Noe Valley, North Beach, Guerrero
- **Notable:** Dubbed "SF's cruelest landlord." $2.4M+ fine from City Attorney (2017). $2.7M tenant judgment upheld on appeal. $7M+ total liability. All properties placed in receivership. Jailed in West Hollywood for Ellis Act violations. Tactics: utility shutoffs, armed guards, surveillance cameras, fraudulent OMI evictions, targeting elderly/disabled tenants. Properties sold by receiver.
- **Status:** No longer a SF landlord. Legal cases ongoing.
- **LLCs:** Xelan Prop 1 LLC, Renka Prop LLC, Aquat 009 LLC + family members (Julia Mwangi, Christine Mwangi, Mary Kihagi)

#### 16. Kaushik Dattani / Dattani & Company
- **Neighborhoods:** Mission (22nd Street corridor), Capp Street, Valencia
- **Notable Properties:** 3305-3321 20th St (9 units), 3465-3469 19th St (3 units), 3224-3248 22nd St (13 units)
- **LLCs:** Diva Investments, Haveli Inc., 363 Valencia LLC, CA1Investment Company, Jake's Steaks LLC
- **Notable:** Multiple Rent Board petitions filed against properties.

#### 17. Benny Chetcuti Jr. / Chetcuti & Associates / Jomorson Properties
- **Scale:** Numerous properties
- **Notable:** Ellis Acted at least 48 units in SF. Convicted of fraud — Ponzi scheme, $28M+ aggregate losses across 114 victims. State Desist & Refrain Order (2011). Forged documents. Collaboration with Gerald W. Filice.
- **Status:** Under legal restrictions.

#### 18. Thomas Aquilina / Aquilina Family Trust
- **Scale:** At least 8 properties (6 units at 3150-3160 26th Street)
- **Neighborhoods:** Mission (26th and Lucky)
- **Notable:** Colluded with property manager German Maldonado to evict 20+ tenants. Rent theft by manager. Served informal eviction notices without legal process.

#### 19. David Bellings
- **Scale:** 20 properties in SF
- **Notable:** Listed as serial evictor by Anti-Eviction Mapping Project.

#### 20. Paul and Peter Berger
- **Scale:** Multiple properties
- **Notable:** Evicted 13 units in SF. Listed by Anti-Eviction Mapping Project.

### Tier 3: Nonprofit / Affordable Housing Operators (Include for completeness — these may score well)

#### 21. TNDC (Tenderloin Neighborhood Development Corp)
- **Scale:** 25 communities, 3,351 units (2,734 low-cost), 22 fully affordable
- **Neighborhoods:** Primarily Tenderloin
- **Notable:** Non-profit. Largest fully affordable housing provider on this list. However, some controversy: laid off half their staff (alleged union busting per SF Homeless Tenants Union).

#### 22. Mercy Housing
- **Scale:** 34 communities in SF
- **Notable:** Non-profit, low-income focused. Supportive services included.

### Tier 4: Notable Individual Evictors & Speculators (Smaller but significant)

| Name | Known Properties | Notable |
|---|---|---|
| Elba Borgen | Multiple | Serial evictor and speculator |
| Helene de Baubigny & John Golob | Multiple | Listed by Anti-Eviction Mapping Project |
| Brian & Sam Hunt | 306-308B Bartlett, 1964 Larkin | Flipping, converting multi-unit to luxury single-unit |
| Emily Benkert | Multiple | STR "host" with many listings |
| Behnam Halali | Multiple | Filed 8 eviction lawsuits against single tenant (2022-2024), all dismissed |
| PAMA Management / Mike Nijjar | Multiple (primarily South Bay/Hunters Point) | CA AG lawsuit filed June 2025 for habitability violations and deceptive leasing |

---

## 3. KNOWN LLC NETWORKS

The biggest challenge for this project is mapping LLCs to parent entities. Here are the documented networks:

### Veritas Network
Veritas Group Inc., Veritas Spark Inc., GreenTree Property Management, RentSFNow, 200+ investor LLCs registered to CEO Yat-Pang Au. Goldman Sachs and JP Morgan Chase provided financing.

### Mosser Network  
Mosser Companies Inc., Mosser Capital Management, Mosser Living. Institutional partners include sovereign wealth funds, hedge funds, global insurers. JP Morgan Chase ($73.8M), Lone Oak Fund LLC ($9.8M).

### Lembi / CitiApartments Network
Skyline Realty Inc. (parent), CitiApartments Inc. (subsidiary), Trophy Properties, Ritz Apartments, numerous family LLCs (Frank Lembi, Walter Lembi, Taylor Lembi, David Raynal/COO/nephew).

### Kihagi Network
Xelan Prop 1 LLC, Renka Prop LLC, Aquat 009 LLC, plus aliases: Anne Kihagi, Ana Swain, Anna Swain, Ann K Swain. Family: Julia Mwangi, Christine Mwangi, Mary Kihagi.

### Iantorno Network
Peninsula Realty LLC, Realty West LLC, Golden Properties LLC, SF Developers LLC, 130 Albion LLC, 421 Arguello Blvd HOA, 615 Minna Street LLC, Acme Studios LLC, 1053 Bush LLC, 101 Sanchez Associates LLC, 200 Arguello Associates LLC, 2323 Franklin Apartments LLC.

### Prado / Prometheus Network
Tpg Mgr LLC, Agpm Bridge11 GP LLC, Prado T9 LLC, Ag-prado SF Mf II LLC, Ichi Nuts LLC, Mai Mai Inc, Mee Shing Inc, North Beach Native Inc.

---

## 4. EXISTING TOOLS & PRIOR ART

| Project | URL | What They Did |
|---|---|---|
| Evictorbook | `evictorbook.com` | Neo4j graph database mapping corporate ownership webs to evictions. Created by Anti-Eviction Mapping Project. |
| Worst Evictors Bay Area | `worstevictorsbayarea.org` | Curated list + profiles. Uses Evictorbook data + qualitative research with SF Anti-Displacement Coalition. |
| Anti-Eviction Mapping Project | `antievictionmap.com` | Data visualization, counter-cartography. Dirty Dozens evictor profiles. |
| SF Chronicle Property Map | Via Regrid (2024 data) | Search any address → owner name, mailing address, other properties by same entity. |
| SF Property Information Map (PIM) | `sfplanninggis.org/pim/` | Official city tool — parcel data, zoning, permits, complaints, appeals per address. |
| JustFix NYC / Who Owns What | `whoownswhat.justfix.org` | NYC model for this exact concept. Inspired the Bay Area version. |

---

## 5. RECOMMENDED PHASE 1 SCOPE

**Launch with 25-30 landlords** from the curated list above, focusing on:
- All Tier 1 mega-landlords (8 entities)
- Top Tier 2 landlords with documented issues (10-12 entities)  
- 2-3 Tier 3 nonprofits (as positive examples / contrast)
- 5-8 Tier 4 notable individual evictors

**For each, manually curate:**
1. Entity name + all known aliases/LLCs
2. Known property addresses (start with what's documented in research above)
3. Contact/management company info
4. Key neighborhoods
5. Estimated unit count

**The SODA API data will auto-populate:**
- DBI complaints per address → rolled up to landlord
- Eviction notices per address → rolled up to landlord  
- Rent Board petitions per address → rolled up to landlord
- 311 complaints per address → rolled up to landlord
- Building permits per address → rolled up to landlord (positive signal)

---

## 6. SCORING MODEL (Proposed)

### Composite Score: 0-100 (higher = better landlord)

| Signal | Weight | Source | Calculation |
|---|---|---|---|
| DBI Violations | 30% | `nbtm-fbw5` | Open/unresolved complaints per unit, severity-weighted, recency-weighted (3yr decay) |
| Eviction Filing Rate | 25% | `5cei-gny5` | Total notices per unit, with 2x weight on no-fault (Ellis Act, OMI) |
| Rent Board Petition Outcomes | 20% | `6swy-cmkq` | Tenant petitions for decrease in services, illegal increase, failure to repair. Weight sustained findings higher. |
| 311 Complaint Density | 15% | `vw6y-z8j6` | Habitability-related 311 calls (pest, mold, plumbing, heat) per unit |
| Permit & Maintenance Investment | 10% | `i98e-djp9` | Positive signal — permits for improvements/maintenance show investment |

### Normalization
- All metrics normalized per unit (not per building) to account for portfolio size
- Recency weighting: last 3 years = full weight, 3-5 years = 50%, 5+ years = 25%
- Score inverted: fewer complaints = higher score

---

## 7. KEY REFERENCE URLS

- Anti-Eviction Mapping Project Evictors: https://antievictionmap.com/evictors
- Worst Evictors Bay Area: https://worstevictorsbayarea.org/list/
- Worst Evictors methodology: https://worstevictorsbayarea.org/about/
- SF DataSF Open Data Portal: https://data.sfgov.org
- DBI Complaints dataset: https://data.sfgov.org/d/nbtm-fbw5
- Eviction Notices dataset: https://data.sfgov.org/d/5cei-gny5
- Rent Board Petitions dataset: https://data.sfgov.org/d/6swy-cmkq
- SF PIM: https://sfplanninggis.org/pim/
- JustFix NYC (model project): https://whoownswhat.justfix.org
- Mosser Companies Yelp (238 reviews): https://www.yelp.com/biz/mosser-companies-san-francisco
- Veritas Investments Yelp: https://www.yelp.com/biz/veritas-investments-san-francisco
- Tobener Ravenscroft (tenant law firm): https://www.tobenerlaw.com/
- Wolford Wayne LLP (tenant law firm): https://wolford-wayne.com/
- SF Tenants Union: https://sftu.org
- Housing Rights Committee of SF: https://www.hrcsf.org
