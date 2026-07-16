# SeatSage — Market Research & Niche Decision

*Research date: July 2, 2026. Decision made same day; app launched same day.*

## Research question

Find a profitable App Store niche where (a) users demonstrably pay, (b) incumbents are
weak, (c) an MVP is buildable and launchable in under 48 hours, and (d) revenue can
plausibly start within days (constraint: $200 by July 7).

## Method

1. Category-level revenue/download analysis of the Apple App Store (secondary data).
2. Review-frustration analysis: which paid categories have the angriest users.
3. Competitor teardown of the chosen niche (pricing, review complaints).
4. Kill-test against the 5-day revenue constraint.

## Category-level findings

- App Store projected revenue is ~$161B for 2026; games take the majority, but
  **health/fitness ($6.3B, +24% YoY) and productivity/business ($4.8B)** are the
  strongest non-game paying categories.
  ([Business of Apps](https://www.businessofapps.com/data/app-data-report/),
  [ElectroIQ](https://electroiq.com/stats/app-store-revenue-statistics/),
  [AppTweak](https://www.apptweak.com/en/reports/app-market-size-by-app-category))
- Downloads ≠ revenue: utilities get installs but don't monetize; niche tools with a
  specific paying user do.
- Review-data analyses of profitable niches show the **highest user frustration** in:
  meditation (86.1% negative), diet tracking (64.8%), period tracking (60.7%),
  parenting (59.1%), productivity (56.8%)
  ([BigIdeasDB](https://bigideasdb.com/profitable-mobile-app-ideas-2026)) — and a
  recurring cross-category complaint: **subscription fatigue**. One-time pricing is
  itself a differentiator in 2026.
- Indie-viable niches generating $2–15k/month: condition-specific health, profession-
  specific productivity, event/occasion tools
  ([NichesHunter](https://nicheshunter.app/blog/profitable-app-niches-2026),
  [AppsInsight](https://appsinsight.co/profitable-mobile-app-niches-to-build/)).

## Candidates considered and killed

| Candidate | Why killed |
|---|---|
| ADHD daily planner | Real demand + subscription fatigue, but crowded with funded apps (Inflow, Liven); trust/distribution too slow for 5-day revenue |
| Diet/macro tracker | Huge frustration (MyFitnessPal paywall anger) but requires food DB + trust; crowded |
| Period tracker (privacy-first) | Strong angle, but health-data trust takes months to earn |
| Contractor invoice/estimate | Pays well but saturated with free tools (Wave etc.) |
| July-4th party planner | Perfectly timed but 2-day shelf life |
| **Wedding/event seating chart** | **Winner — see below** |

## Winner: wedding/event seating chart planner

**The problem.** The seating chart is one of the last, most stressful wedding tasks —
done 1–3 weeks before the event, under deadline, juggling guest list churn and family
politics. Venues demand a per-table list; couples want a floor plan.

**Evidence users pay (one-time, not subscription):**
- [PerfectTablePlan](https://www.perfecttableplan.com/): **$29.95+ one-time**, desktop-era software, still selling ([Capterra](https://www.capterra.com/p/74189/PerfectTablePlan/))
- [TopTablePlanner](https://www.toptableplanner.com/): from **$20**
- [tableplan.io](https://www.tableplan.io/): active web competitor — market is alive

**Evidence incumbents are weak (Apple App Store reviews):**
- [Seat Puzzle / Wedding Seating Chart Planner](https://apps.apple.com/us/app/wedding-seating-chart-planner/id1080012173): "deleted elements reappearing", "table layouts rearranging without user input"
- [Wedding Seating Planner](https://apps.apple.com/us/app/wedding-seating-planner/id965630641): **data loss after phone restore**
- [Seat Maker](https://apps.apple.com/us/app/seat-maker-seating-chart-app/id6748284141): best-in-class but users report lag; iOS-only
- Zola's free tool: requires an account, locks you into their ecosystem, upsells

**Why the timing is right:** early July is peak US wedding season. Buyers are in-market
*right now* with an urgent deadline — the only niche examined where day-one sales are
structurally plausible.

**The wedge (positioning):**
1. **Reliability** — autosave + one-tap backup files (attacks the #1 review complaint)
2. **No account, no subscription** — $14.99 one-time (attacks subscription fatigue; undercuts PerfectTablePlan 2×)
3. **Works on every device instantly** — web/PWA; incumbents are iOS-only or desktop-only
4. **Privacy** — guest list never leaves the device (zero-server architecture)

## Market size sanity check

~2.2–2.5M US weddings/year, heavily May–October. Add corporate events, galas,
banquets, classrooms (Seat Maker's expansion path). If 1 in 1,000 US weddings/year
bought a $14.99 tool, that's ~$35k/year — and the wedding niche supports far higher
attach rates for planning tools. $10k/month is reachable at ~22 sales/day, which is an
SEO + ASO + wedding-community distribution problem, not a demand problem.

## Decision

Build **SeatSage**: a drag-and-drop seating chart planner, free tier (3 tables / 25
guests), $14.99 one-time Pro unlock. Ship as a PWA immediately (launch before July 4),
wrap with Capacitor for the Apple App Store as phase 2 (see HANDOFF.md roadmap).
