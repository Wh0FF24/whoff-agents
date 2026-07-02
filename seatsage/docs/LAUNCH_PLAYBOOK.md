# SeatSage — Launch Playbook

*Status: app is LIVE at https://sunny-shore-765.higgsfield.app (since July 2, 2026).*
*This is the do-this-next checklist to turn a live app into revenue.*

## Day 0 — founder actions (≈30 min total, unblock revenue)

- [ ] **Stripe Payment Link** (or Gumroad): product "SeatSage Pro", $14.99 one-time.
      Add unlock-code delivery in the post-purchase message (codes are in the Gmail
      draft titled "SeatSage Pro unlock codes"). Gumroad alternative: upload the codes
      as license keys, one per sale.
- [ ] Paste the link into `seatsage/js/config.js` → `PAYMENT_URL`, commit, redeploy
      (see README "Deploy" section — one command + one MCP call).
- [ ] **Buy seatsage.app** (or .com) ~$15 and point it at the deployment. A branded
      domain roughly doubles conversion from social posts.

## Days 0–5 — community channels (goal: $200 by Jul 7)

Post where couples actively ask for seating chart help. Rules: be useful first,
disclose you built it, never spam.

- [ ] **r/weddingplanning** (~1M members): answer existing seating-chart threads
      (search "seating chart" weekly threads); one standalone "I built a free
      no-account seating chart tool" post in the weekly self-promo/tools thread.
- [ ] **r/Weddingsunder10k, r/WeddingPlanning subreddits' tool threads** — same.
- [ ] **Facebook wedding groups** (search "wedding planning 2026"): 5–10 large groups;
      post a 30-sec screen recording of pasting a guest list → chart done.
- [ ] **Product Hunt launch** (Thu/Fri are quieter = easier top-10): tagline
      "Seating charts without the spreadsheet — or the subscription."
- [ ] **TikTok/Reels/Shorts** (highest upside): 15–30s screen captures.
      Hooks that fit the format: "POV: your wedding is in 2 weeks and you haven't done
      the seating chart", "Things nobody tells you about wedding planning #7".
      2–3/day during peak season. (Higgsfield video tools can generate b-roll.)
- [ ] **Pinterest** (wedding planning's biggest quiet channel): pin the printable
      chart output + floor plan images linking to the site.

## Days 3–10 — durable channels

- [ ] **SEO pages** (static, add to the site): "wedding seating chart template",
      "how to make a wedding seating chart", "seating chart for 100 guests",
      "PerfectTablePlan alternative", "free seating chart maker". Each is a page with
      the tool embedded + 600 words. These terms convert and the competition is weak
      content farms.
- [ ] **App Store (phase 2, the researched channel)**: wrap with Capacitor
      (`npx cap init` — the app is already a PWA, 1–2 days including review),
      Apple Developer account $99. ASO keywords: "seating chart", "wedding seating",
      "table plan", "wedding planner". Incumbents have 3–4 stars and known
      data-loss complaints — lead with "never loses your chart" in the listing.
      In-app purchase replaces the payment link on iOS (Apple requires IAP).
- [ ] **Wedding planner outreach**: 20 emails/day to independent planners — free Pro
      codes for them + their clients; planners are a distribution flywheel.
- [ ] **Zapier/venue partnerships** (later): venues that email "please send us your
      seating chart" are a referral source.

## Marketing copy (ready to paste)

**One-liner:** Your seating chart, done in minutes — not evenings.

**Reddit/FB post:**
> The seating chart was the task my partner and I kept putting off, so I built a tool
> that makes it painless: paste your guest list, drag tables around, tap to seat
> people, print the per-table chart your venue asks for. No account, no subscription,
> works on your phone, and your guest list never leaves your device. Free for small
> events: https://sunny-shore-765.higgsfield.app — would love feedback from anyone
> mid-planning!

**Product Hunt tagline:** Seating charts without the spreadsheet — or the subscription.

## Metrics to watch (all free)

- Add Plausible or GoatCounter (privacy-friendly, no cookie banner) — 1 script tag.
- Funnel: landing → /app opens → upgrade modal opens → payment link clicks → sales.
- The upgrade modal fires when users hit free limits — if modal-opens are high and
  clicks are low, price is wrong; if modal-opens are low, limits are too generous.

## What NOT to do this week

- No paid ads until organic proves the funnel (wedding CPCs are $3–8).
- No feature work beyond bug fixes — distribution is the bottleneck, not features.
- No subscriptions, ever. It's the brand.
