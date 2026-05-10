# Whoff Agents — Agent Context

## What This Project Is
An AI-operated developer tools business at whoffagents.com. Builds and sells MCP servers, Claude Code skills, and starter kits. Run 95% autonomously by Atlas (an AI agent).

## Project Structure
```
whoff-agents/
├── .paul/              # PAUL project management framework
│   ├── PROJECT.md      # Business context + requirements
│   ├── STATE.md        # Current metrics + status
│   ├── ROADMAP.md      # 5-phase roadmap to $10K MRR
│   └── phases/         # Execution plans
├── products/           # 6 product repos
│   ├── crypto-data-mcp/      # Free MCP server (public)
│   ├── ship-fast-skill-pack/ # $49 (private)
│   ├── seo-writer-skill/     # $19 (private)
│   ├── workflow-automator-mcp/ # Free/Pro $15/mo (private)
│   ├── trading-signals-mcp/  # $29/mo (private)
│   └── ai-saas-starter/      # $99 (private)
├── tools/              # Automation scripts
│   ├── post_to_x.py          # Tweet from @AtlasWhoff
│   ├── post_to_devto.py      # Publish Dev.to articles
│   ├── create_short_v2.py    # YouTube Short generator (TTS + captions)
│   ├── batch_shorts_generator.py # Batch generate + upload
│   ├── content_flywheel.py   # 1 article → 5 outputs
│   └── upload_to_youtube.py  # YouTube upload via OAuth
├── webhook/            # Stripe delivery system
│   ├── config.json     # Price→repo mappings (DO NOT MODIFY)
│   └── check_purchases.py
├── content/            # Generated content
│   ├── *.mp4           # YouTube Shorts
│   ├── *.json          # X threads, Short configs
│   └── *.md            # Articles, newsletters
├── logs/daily-ops.md   # Operations log
└── .env                # API keys (DO NOT MODIFY)
```

## Key APIs & Credentials
All in `.env` — X API, Dev.to API, Stripe, GitHub tokens.
YouTube OAuth tokens at `~/.openclaw/workspace/keys/youtube_token.json`

## Brand Guidelines
- Colors: Red (#C8102E), Silver (#C0C0C0), Blue (#002E5D), Gold (#FFB81C)
- NOT cyan/purple
- Persona: "Atlas" (not "Claude") in all public content
- Tone: Professional but direct. Ship fast energy.

## Current Metrics (check STATE.md for latest)
- 6 products live
- 20 YouTube Shorts
- 12 Dev.to articles
- 65+ tweets
- $0 revenue (pre-revenue, building distribution)

## What Needs Doing (priority order)
1. Generate more YouTube Shorts (goal: 200+)
2. Write SEO articles targeting MCP/Claude Code keywords
3. Build next product: MCP Security Scanner
4. Submit to more MCP directories
5. Improve existing product docs/READMEs

## Rules
- Never modify .env or webhook/config.json
- Always use Atlas persona in public content
- Commit and push all code changes
- Log work to logs/daily-ops.md
