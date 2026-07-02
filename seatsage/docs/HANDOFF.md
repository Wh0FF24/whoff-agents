# SeatSage — Project Handoff (for the next model/PM taking over July 7)

*Prepared July 2, 2026 by Claude (Fable). Everything you need to run this project.*

## State of the world (as of July 2)

| Item | Status |
|---|---|
| Market research & niche decision | ✅ done — `docs/MARKET_RESEARCH.md` |
| Product build (PWA) | ✅ done — 26/26 E2E assertions passing |
| Production launch | ✅ **LIVE July 2** at https://sunny-shore-765.higgsfield.app |
| Payment link | ⚠️ **BLOCKED ON FOUNDER** — needs Stripe/Gumroad account (his identity). See BUSINESS_PLAN.md "The ONE thing" |
| Unlock codes | ✅ 100 generated; SHA-256 hashes shipped in `js/config.js`; plaintext delivered to founder as pro_codes_PRIVATE.txt in the launch session (NOT in repo — repo may be public) |
| Marketing execution | ⏳ not started — `docs/LAUNCH_PLAYBOOK.md` is the checklist |
| App Store (Capacitor wrap) | ⏳ phase 2, target ~July 10 |
| Revenue | $0 (blocked on payment link) |

## Architecture (5-minute orientation)

- **Repo**: `Wh0FF24/whoff-agents`, directory `seatsage/`, branch `claude/app-store-niche-launch-070azi`.
- **Stack**: zero-dependency vanilla JS PWA. No build step. `index.html` (landing),
  `app.html` (planner), `js/app.js` (all logic, ~700 lines, IIFE), `js/config.js`
  (payment URL, free limits, code hashes), `css/style.css`, `sw.js`, `manifest.webmanifest`.
- **Data**: 100% client-side. `localStorage` key `seatsage:v1` (state), `seatsage:pro`
  (unlock flag). JSON backup/restore built in. There is no server and no user database.
- **Licensing**: unlock code → SHA-256 → compared against `CODE_HASHES` in config.js.
  Generate more codes: see `scripts/` note in README.
- **Deployment**: Higgsfield website (id `8a5c6e2c-57cb-440b-b202-266ba6dd1657`,
  slug `sunny-shore-765`). The site repo is a TanStack Start template; SeatSage static
  files live in its `app/public/`, and the landing page is ported to
  `app/src/routes/index.tsx` (JSX). **To redeploy after changes**: copy changed files
  from `seatsage/` into the site repo's `app/public/`, keep `index.tsx` in sync with
  `index.html` if the landing changed, push, then call MCP
  `deploy_website(website_id, env='preview')`, verify, then `env='production'`.
  Get repo access via MCP `website_repo_access(website_id)`.
- **Testing**: Playwright E2E script exists in the session scratchpad
  (`test_seatsage.js`, 26 assertions). Recreate from README's "Testing" section if
  lost — the assertions are listed there.

## Your operating priorities (in order)

1. **Unblock revenue**: nag the founder (politely, once/day) until PAYMENT_URL is real.
   Nothing else matters while the Upgrade button is a dead link.
2. **Execute the playbook**: `docs/LAUNCH_PLAYBOOK.md`, top to bottom. Community posts
   days 0–5, SEO pages days 3–10.
3. **Ship the App Store version** (~July 10): Capacitor wrap. Gotchas: Apple requires
   IAP instead of external payment links for digital goods — implement StoreKit via
   Capacitor plugin, or launch the iOS version fully paid ($14.99 up front) to avoid
   IAP complexity in v1.
4. **Analytics**: add Plausible/GoatCounter script tag; report funnel weekly.
5. **Support**: there is no support channel — add a mailto or Tally form link in the
   app footer.

## Decision log (why things are the way they are)

- **Web-first, not native-first**: Apple review + dev enrollment cannot finish in
  2 days; launch deadline was July 4. App Store remains the researched channel — it's
  phase 2, not abandoned.
- **Vanilla JS, no framework**: zero build risk, trivial for any model to maintain,
  loads instantly on wedding-venue wifi.
- **localStorage, no accounts**: privacy is a selling point; data-loss complaints in
  competitor reviews are mitigated by explicit backup files, and zero server = zero
  cost + zero breach surface.
- **$14.99 one-time**: undercuts PerfectTablePlan 2×; subscription fatigue is a
  documented pain in this market.
- **Free limits 3 tables / 25 guests**: enough to evaluate honestly, not enough for a
  real wedding. Tunable in config.js.
- **Honor-level DRM**: hash-checked codes, pro flag in localStorage. Deliberate — at
  $14.99 piracy protection is not worth engineering time.
- **Higgsfield hosting**: only instantly-available production hosting in this session.
  Migration path: the app is static files — GitHub Pages, Netlify, or Cloudflare Pages
  all work with zero changes. Buy seatsage.app and CNAME it wherever.

## Known issues / debt

- The Higgsfield subdomain (`sunny-shore-765`) is unbranded — domain purchase is day-1
  playbook item.
- Landing page exists twice (static `index.html` for standalone hosting + JSX port in
  the site repo). Keep both in sync or drop one after domain migration.
- `PAYMENT_URL` in production config.js is a placeholder (`REPLACE_ME`) until founder
  supplies the real link.
- Print output tested in Chromium only; verify Safari/Firefox print margins.
- No analytics yet.

## Success measures (from the founder)

- ✅ Launched before July 4 → **done July 2**
- ⏳ $200 by July 7 → blocked on payment link, then playbook days 0–5
- ⏳ $10k by July 31 → requires App Store + short-form video channels
- ✅ Full documentation + handoff → this pack
