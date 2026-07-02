# SeatSage ❖

Seating chart planner for weddings & events. **Live: https://sunny-shore-765.higgsfield.app**

Paste your guest list → drag tables around → tap to seat people → print the per-table
chart your venue asks for. No account, no subscription, no server: everything runs in
the browser and persists to localStorage with one-tap JSON backups.

## Docs

- [`docs/MARKET_RESEARCH.md`](docs/MARKET_RESEARCH.md) — why this niche, with evidence
- [`docs/BUSINESS_PLAN.md`](docs/BUSINESS_PLAN.md) — pricing, revenue math, costs
- [`docs/LAUNCH_PLAYBOOK.md`](docs/LAUNCH_PLAYBOOK.md) — the go-to-market checklist
- [`docs/HANDOFF.md`](docs/HANDOFF.md) — **start here if you're taking over the project**

## Stack

Zero-dependency vanilla JS PWA. No build step, no framework, no server.

```
index.html            landing page (static)
app.html              the planner
js/app.js             all planner logic (state, SVG floor plan, exports, licensing)
js/config.js          payment URL, free-tier limits, unlock-code SHA-256 hashes
css/style.css         landing + app + print styles
sw.js                 offline cache (fault-tolerant install)
manifest.webmanifest  PWA install metadata
icons/                generated app icons
```

## Run locally

```bash
cd seatsage && python3 -m http.server 8642
# open http://localhost:8642
```

## Testing

Playwright E2E (26 assertions): landing loads; demo seed; add guest; bulk add;
free-tier caps (3 tables / 25 guests) open the upgrade modal; tap-to-assign; inspector
seat picker; seat stepper; unlock-code accept + persistence; pro unlocks limits;
CSV/PNG/backup downloads; print sheet; reload persistence; table drag saves.

```bash
npm i playwright  # uses system chromium at /opt/pw-browsers/chromium in CI sandboxes
node test_seatsage.js  # script lives in session scratchpad; assertions listed above
```

## Monetization wiring

1. Create a Stripe Payment Link / Gumroad product ($14.99 one-time).
2. Put the URL in `js/config.js` → `PAYMENT_URL`.
3. Deliver unlock codes post-purchase (plaintext codes are **not** in this repo — the
   codes file was delivered privately to the founder; only SHA-256 hashes ship).
4. Generate more codes: `python3 scripts/generate_codes.py 100` → paste the new hashes
   into `config.js`, keep the plaintext private.

## Deploy

Hosted on Higgsfield (website id `8a5c6e2c-57cb-440b-b202-266ba6dd1657`). The site repo
embeds these files under `app/public/` plus a JSX port of the landing at
`app/src/routes/index.tsx`. After editing here:

1. `website_repo_access(website_id)` → clone site repo
2. copy changed files into `app/public/` (sync `index.tsx` if the landing changed)
3. push, `deploy_website(website_id, 'preview')` → verify → `deploy_website(website_id, 'production')`

The app is plain static files — GitHub Pages / Netlify / Cloudflare Pages work as-is
if migrating (recommended once a custom domain is purchased).
