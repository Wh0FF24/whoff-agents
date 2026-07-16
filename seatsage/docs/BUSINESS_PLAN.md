# SeatSage — Business Plan

*Written July 2, 2026. Targets: $200 by July 7 · $10k by July 31.*

## Product

SeatSage — seating chart planner for weddings & events.
Live at **https://sunny-shore-765.higgsfield.app** (launched July 2, 2026).

- **Free tier**: 3 tables / 25 guests, drag-and-drop floor plan, print, autosave+backup.
  Free printing carries a small "Made with SeatSage" footer line.
- **Pro, $14.99 one-time**: unlimited tables/guests, PNG floor-plan export, CSV export,
  watermark-free printing. Delivered as an unlock code after purchase.

Zero marginal cost per user (static PWA, no servers storing user data), so gross
margin ≈ payment-processor fees only (~97% on Stripe Payment Links).

## Why one-time pricing

- The buyer uses the product intensively for 2–6 weeks, then never again —
  subscriptions churn instantly and generate refund anger (see incumbents' reviews).
- $14.99 undercuts PerfectTablePlan ($29.95) and matches impulse-purchase range for a
  wedding budget (average US wedding spend > $30k).
- "No subscription, ever" is a marketing line in 2026, not just a price.

## Revenue math

| Goal | Sales needed @ $14.99 | Path |
|---|---|---|
| $200 by Jul 7 | 14 sales (~3/day) | Peak wedding season + direct outreach in wedding communities + Product Hunt launch |
| $10k by Jul 31 | ~670 sales (~23/day) | Requires compounding channels: App Store listing (Capacitor wrap), SEO pages, TikTok/Reels wedding content, affiliate deals with wedding planners |

Honest assessment: $200/week 1 is aggressive but plausible in-season; $10k/month 1 is
a stretch goal that depends on the App Store release and short-form video hitting.
The floor scenario (organic only, no viral hit) is $300–1,500 in July. Levers that
most change the outcome, in order: (1) App Store listing live by ~Jul 10,
(2) 3+ TikToks/day posted during peak season, (3) SEO pages indexed by mid-July.

## Cost structure

| Item | Cost |
|---|---|
| Hosting (current) | $0 (Higgsfield deploy) / GitHub Pages fallback $0 |
| Custom domain (recommended: seatsage.app) | ~$15/yr |
| Stripe fees | 2.9% + $0.30 per sale |
| Apple Developer (phase 2, App Store) | $99/yr |
| **Total to operate week 1** | **≈ $0** |

## The ONE thing requiring the founder (15 minutes)

I cannot create payment accounts on your behalf. To turn on revenue:

1. Create a **Stripe Payment Link** (or Gumroad product) for "SeatSage Pro — $14.99".
2. In the post-purchase confirmation, paste unlock codes (100 pre-generated codes were
   delivered to you privately as pro_codes_PRIVATE.txt; Gumroad can auto-issue one license per sale, Stripe
   Payment Links show a static confirmation message — rotate codes weekly or use
   Stripe's "after payment" custom message with one shared weekly code to start).
3. Paste the payment URL into `seatsage/js/config.js` → `PAYMENT_URL`, push, redeploy.

Until then the Upgrade button opens a dead link — every hour without it costs sales.

## Moat & expansion

- **Data-network moat: none.** This wins on execution speed, price honesty, and SEO.
- Expansion: corporate events, banquets, classrooms (teacher seating charts — Aug/Sep
  back-to-school is the next seasonal window), venue/planner B2B licenses ($99/yr per
  planner, white-label charts).
- App Store wrap (Capacitor) unlocks the actual App Store demand researched — the
  incumbent apps with 3–4 stars are beatable on reliability alone.

## Risks

| Risk | Mitigation |
|---|---|
| Traffic doesn't materialize in 5 days | Playbook front-loads community channels with same-day feedback loops (Reddit, FB groups) |
| Free tier too generous / too stingy | 3 tables ≈ 24 seats — enough to feel the magic, not enough for a real wedding (~10-20 tables). Tunable in config.js without code changes |
| Unlock-code sharing | Honor-level DRM is fine at this price; revisit only if revenue justifies it |
| Higgsfield subdomain looks unbranded | Buy seatsage.app and point it (playbook, day 1) |
