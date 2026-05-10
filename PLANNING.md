# Whoff Agents

> AI-operated developer tools studio — MCP servers, skills, and starter kits sold at whoffagents.com, run 95% autonomously by Atlas.

**Created:** 2026-04-02
**Type:** Application
**Stack:** Static HTML + Tailwind CDN (storefront) | Python (tools/scripts) | MCP SDK (products) | AWS Amplify (deploy) | Stripe (payments) | Beehiiv (newsletter)
**Skill Loadout:** PAUL (build management), AEGIS (security audit post-build)
**Quality Gates:** Product functionality, security scan, Stripe integration test, live deploy verification

---

## Problem Statement

The MCP ecosystem has 17,000+ servers but <5% are monetized. 350,000 Claude Code skills published in 5 months. Developers need high-quality, production-ready tools — but most are free, undocumented, and unmaintained.

Whoff Agents fills the gap: a curated catalog of premium MCP servers, skills, and starter kits built and maintained by Atlas (an autonomous AI agent). Revenue funds future development and feeds back into Will's other projects (Polymarket trading bot, etc).

**Who it's for:** Developers using Claude Code, Cursor, Windsurf, or any MCP-compatible AI tool.

**Why build vs buy:** Nothing like this exists. The market is pre-monetization. First movers with quality products win.

---

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Storefront | Static HTML + Tailwind CDN | Zero-build deploy via Amplify. Fast, simple, no framework overhead for a catalog site. |
| MCP Products | Python + MCP SDK | Standard MCP server implementation. Python is the most common MCP language. |
| Posting/Automation | Python + tweepy + Beehiiv API | Scripts for X posting and newsletter publishing. |
| Payments | Stripe (payment links + products) | Already connected. Payment links work with static sites — no backend needed. |
| Newsletter | Beehiiv | Free tier to 2,500 subs. Built-in Boosts for growth. No revenue share on paid subs. |
| Deployment | AWS Amplify (site) + GitHub (distribution) | Existing pipeline. MCP servers distributed via GitHub + npm/pip. |
| Domain/DNS | AWS Route 53 → Amplify | Already configured. |

### Research Needed
- MCP SDK best practices for hosted vs installable servers
- Lemon Squeezy vs Stripe for digital product delivery (license keys, download links)
- Beehiiv API for programmatic newsletter publishing

---

## Data Model

Minimal — this is a product catalog, not a SaaS with user accounts.

### Entities

| Entity | Key Fields | Relationships |
|--------|-----------|---------------|
| Product | id, name, description, type (mcp/skill/kit), price, stripe_price_id, status | has many Versions |
| Version | id, product_id, version_number, changelog, download_url, release_date | belongs to Product |
| Subscriber | email, source, utm_tags | managed by Beehiiv |
| Revenue | date, amount, source (stripe/ads), product_id | tracked in Stripe |

### Notes
- No database needed initially. Product catalog is hardcoded in HTML.
- Stripe is the source of truth for purchases and revenue.
- Beehiiv is the source of truth for subscribers.
- Add a database (SQLite or Supabase) only when we need dynamic features (user accounts, license management).

---

## API Surface

### Auth Strategy
No API auth for the storefront. Stripe handles payment auth. Beehiiv handles newsletter auth. X API uses OAuth 1.0a for posting.

### Route Groups
Static site — no server-side routes. All "API" interactions are:

| Integration | Method | Auth | Purpose |
|-------------|--------|------|---------|
| Stripe Payment Links | GET (redirect) | None (Stripe hosted) | Purchase products |
| Beehiiv Subscribe | POST (form submit) | None (Beehiiv hosted) | Newsletter signup |
| X API | POST | OAuth 1.0a | Automated posting |
| Beehiiv API | POST | API key | Programmatic newsletter publish |

### MCP Server API
Each MCP server product exposes its own tool surface per the MCP spec. Documented per-product.

---

## Deployment Strategy

### Local Development
- Site: `python -m http.server 8000` in `whoffagents-site/`
- MCP servers: each has its own dev setup in `products/{name}/`
- Scripts: `python tools/post_to_x.py --dry-run "test"`

### Production
- **Site:** Push to `main` on GitHub → Amplify auto-deploys
- **MCP servers:** Published to GitHub repos + PyPI/npm as appropriate
- **Payment links:** Generated in Stripe, hardcoded in product pages
- **Newsletter:** Published via Beehiiv dashboard or API

---

## Security Considerations

- **No user data stored:** We don't have accounts or a database. Stripe and Beehiiv handle PII.
- **API keys:** Stored in `projects/whoff-agents/.env` (gitignored). Never committed.
- **Stripe:** Payment links are hosted by Stripe — no card data touches our site.
- **MCP server security:** Each server must follow MCP security best practices (input validation, no arbitrary code execution, sandboxed operations). 82% of MCP servers have vulnerabilities — security-first is our differentiator.
- **X API:** OAuth tokens stored locally. Never exposed in client-side code.
- **Rate limiting:** X API has built-in rate limits. Beehiiv has sending limits on free tier.

---

## UI/UX Needs

### Design System
Tailwind CDN with custom brand colors (cyan #00d4ff, purple #7c3aed). Dark theme. Minimal, developer-focused aesthetic.

### Key Views / Pages

| View | Purpose | Status |
|------|---------|--------|
| Homepage | Hero + featured tools + newsletter signup + story | Live |
| Products | Filterable catalog with all tools | Live |
| Blog | SEO content + build logs | Live (1 post) |
| Product Detail (future) | Per-product page with docs, pricing, buy button | Phase 2 |

### Responsive Needs
Mobile-responsive (Tailwind handles this). Desktop-first audience (developers).

---

## Integration Points

| Integration | Type | Purpose | Auth | Status |
|------------|------|---------|------|--------|
| Stripe | Payment Links | Product purchases | API key | Connected |
| Beehiiv | Form + API | Newsletter | API key | Connected |
| X/Twitter | OAuth 1.0a API | Automated posting | OAuth tokens | Keys generated |
| AWS Amplify | CI/CD | Site deployment | GitHub OAuth | Connected |
| GitHub | Git push | Code hosting + deploy trigger | SSH key | Connected |
| Glama.ai | Directory listing | MCP server discovery | None (public) | Pending |
| mcpmarket.com | Directory listing | MCP server discovery | None (public) | Pending |

---

## Phase Breakdown

### Phase 1: Foundation (Week 1-2) — CURRENT
- **Build:** Site storefront, X posting utility, Stripe product catalog, first blog post
- **Testable:** Site loads, newsletter signup works, X posting works, Stripe products exist
- **Outcome:** whoffagents.com is live with catalog, newsletter captures emails, @AtlasWhoff posts

### Phase 2: First Product (Week 3-4)
- **Build:** Crypto Data MCP server (free tier), product detail page, 3 more blog posts
- **Testable:** MCP server installs and returns data, product page has buy button, SEO content indexed
- **Outcome:** First real product available for download/purchase

### Phase 3: Product Expansion (Month 2)
- **Build:** Ship Fast Skill Pack, SEO Writer Skill, Workflow Automator MCP
- **Testable:** Each product works end-to-end, Stripe purchases complete
- **Outcome:** 4 products in catalog, revenue starts flowing

### Phase 4: Growth Engine (Month 2-3)
- **Build:** Paid newsletter tier, Beehiiv Boosts activation, AI SaaS Starter Kit
- **Testable:** Paid subs convert, Boosts drive subscriber growth, kit scaffolds a working app
- **Outcome:** Two revenue streams (products + newsletter), growing subscriber base

### Phase 5: Scale (Month 3-6)
- **Build:** Trading Signals MCP, 5+ additional products based on demand data, MCP directory listings
- **Testable:** Products rank in directories, organic traffic grows, MRR trends up
- **Outcome:** 10+ products, $5K-$12K MRR target

---

## Skill Loadout & Quality Gates

### Skills Used During Build

| Skill | When It Fires | Purpose |
|-------|--------------|---------|
| PAUL | Each phase | Structured milestone and phase management |
| AEGIS | End of Phase 2+ | Security audit on MCP server products |
| frontend:design-review | After UI changes | Visual quality check |
| engineering:testing-strategy | Each MCP server | Test coverage for products |

### Quality Gates

| Gate | Threshold | When |
|------|-----------|------|
| MCP server functionality | All tools work correctly | Each product release |
| Security scan | No critical vulnerabilities | Each MCP server |
| Stripe integration | Purchases complete end-to-end | Each priced product |
| Site performance | LCP < 2s | Each deploy |
| X posting | Tweets post successfully | Before launch |

---

## Design Decisions

1. **Static HTML over Next.js:** No build step, zero-config Amplify deploy, faster iteration. Move to a framework only if we need dynamic features (user accounts, dashboards).
2. **Stripe Payment Links over checkout integration:** Works with static sites. No backend needed. Swap to embedded checkout when we need custom flows.
3. **Python for MCP servers:** Most common MCP implementation language. Largest ecosystem of data/crypto libraries.
4. **Beehiiv over Substack:** No revenue share on paid tier. Built-in Boosts for cross-promotion. Better for a business (not just a personal brand).
5. **Atlas persona over generic branding:** Unique identity differentiates from "another AI tool." Memorable, character-driven brand.
6. **Freemium MCP servers:** Free tier builds trust and adoption. Pro tier captures value from power users. Proven model (21st.dev did $10K MRR this way).

---

## Open Questions

1. ~~Beehiiv vs Substack~~ → Decided: Beehiiv
2. ~~X/Twitter API access~~ → Decided: Developer API, pay-per-use, keys generated
3. License key delivery — how to gate pro tier MCP server features? Options: hosted server with auth, or npm/pip package with license check.
4. When to add a database — trigger point for moving beyond static site.
5. Pricing optimization — track conversion data and adjust after month 1.

---

## Next Actions

- [x] Deploy storefront at whoffagents.com
- [x] Set up Beehiiv newsletter
- [x] Connect Stripe
- [x] Generate X API keys
- [x] Write first blog post
- [x] Atlas rebrand across all copy
- [ ] Build X posting utility
- [ ] Set up Stripe product catalog
- [ ] Build Crypto Data MCP server (Phase 2 product)
- [ ] Write first newsletter issue
- [ ] Post launch thread from @AtlasWhoff
- [ ] List products on MCP directories (Glama.ai, mcpmarket.com)

---

## References

- Research analysis: `projects/whoff-agents/RESEARCH-ANALYSIS.md`
- API credentials: `projects/whoff-agents/.env`
- Site repo: `github.com/Wh0FF24/whoffagents-site`
- X account: `@AtlasWhoff`
- Newsletter: `whoffagents.beehiiv.com`

---

*Last updated: 2026-04-02*
