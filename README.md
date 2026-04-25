<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.png">
  <img alt="Whoff Agents" src="assets/logo-dark.png" width="280">
</picture>

**Production skills for Claude Code. Built by an AI that runs a real business.**

[![License: MIT](https://img.shields.io/badge/License-MIT-silver.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-blue)](https://claude.ai/code)
[![Skills](https://img.shields.io/badge/skills-4%20published-gold)](skills/)
[![PAX Dataset](https://img.shields.io/badge/🤗%20dataset-PAX%20Protocol-yellow)](https://huggingface.co/datasets/WH0FF/pax-protocol)
[![Built by Atlas](https://img.shields.io/badge/built%20by-Atlas%20AI-red)](https://whoffagents.com)

</div>

---

## What this looks like

```bash
/anchor
```

```
# Context Anchor — 2026-04-14T14:32:00

## What's true right now
- Auth rewrite 80% done. JWT chosen, stateful approach ruled out at src/auth.ts:47
- Next action: src/app.ts:23 — attach jwtMiddleware to protected routes

## Working reference
> One connection point left. No blockers.
```

*Three seconds. No context drift. Works mid-task, on resume, before any agent handoff.*

---

## The problem

You use Claude Code every day. You know the failure modes:

1. **Context drift** — stale tool results override what's actually true now. Model reasons from bad state.
2. **Resume tax** — you pause, come back, spend 10 minutes reconstructing what you were doing.
3. **Handoff loss** — you dispatch a subagent, it does the wrong thing, because what it received was ambiguous.

These aren't model problems. They're workflow problems. Skills fix them.

---

## Free: Context Anchor skill

```bash
git clone https://github.com/Wh0FF24/whoff-agents.git
cp -r whoff-agents/skills/context-anchor ~/.claude/skills/
```

Type `/anchor` in any Claude Code session.

**What it does:**
1. Scans the session for what's true right now — decisions made, approaches ruled out, next action
2. Writes a compact anchor to `.claude/anchor.md`
3. Echoes it so you verify before trusting it

Full skill: [`skills/context-anchor/SKILL.md`](skills/context-anchor/SKILL.md)

> ⭐ If this saves you time, star the repo — it helps other developers find it.

---

## Starter Kit: 4 Production Skills

These are the skills Atlas uses to run whoffagents.com across multi-hour sessions and multi-agent workflows without human intervention.

| Skill | Failure mode it fixes |
|-------|-----------------------|
| `context-anchor` | Stale state overrides fresh truth *(free — you have this)* |
| `agent-handoff` | Context loss between sessions |
| `cost-cap-guard` | Runaway agent token costs before dispatch |
| `dead-letter` | Failed tasks that vanish without a retry path |

One-time payment. No subscription. Yours permanently.

→ **[Get the Atlas Starter Kit — $97](https://buy.stripe.com/8x2bJ39VlgEd2jt2ERaZi0i)**

---

## This system runs in production

Atlas publishes a live ops feed every 15 minutes — real Stripe data, GitHub activity, Beehiiv subscribers, PostHog events. No dashboards. No human in the loop.

→ [whoffagents.com/atlas/ops](https://github.com/Wh0FF24/atlas-ops) — public JSON feed, updated automatically

Read the war story: [My Stripe auto-delivery script marked a customer as delivered — it never sent the email](https://dev.to/whoffagents/my-stripe-auto-delivery-script-marked-a-customer-as-delivered-it-never-sent-the-email-3opg)

---

## Roadmap

9 more skills Atlas is hardening internally — not yet published:

`systematic-debugging` · `verification-before-completion` · `parallel-dispatch` · `output-verification` · `pax-protocol` · `working-reference` · `subagent-driven-dev` · `test-driven-development` · `plan-writer`

These will be added to the kit as they clear internal testing. Star the repo to get notified.

---

## Who builds this

Atlas is an AI agent running as a persistent process. It operates whoffagents.com: writes content, manages the store, deploys code, runs outreach — without human intervention.

These skills came out of production failure. Atlas needed them to function reliably across real sessions, real customers, and real incidents. They're not theoretical patterns.

Will (BYU M.S. ECE, Army Reserve) owns the strategy. Atlas handles execution.

→ [whoffagents.com](https://whoffagents.com) · [Follow the build on dev.to](https://dev.to/atlas_whoffagents)

---

## Active development

| Date | Update |
|------|--------|
| Apr 2026 | Paperclip multi-agent org — 6 agents, live orchestration |
| Apr 14, 2026 | v1 shipped — 4-skill starter kit + free context-anchor |
| Apr 14, 2026 | PAX Protocol added — inter-agent token-efficient comms |
| Apr 14, 2026 | Crash tolerance patterns documented |

---

## Plays well with

These skills drop in alongside other agentic-AI tooling. Notable peer:

- **[OpenSpace](https://github.com/HKUDS/OpenSpace)** — open-source skill-evolution engine. Captures winning workflows from agent execution and auto-improves them. Skills authored by these patterns drop directly into OpenSpace's skill registry and benefit from its auto-fix + sharing layer.

If you ship something built on top of these patterns, drop a link — happy to feature it.

---

## Contributing

Open an issue for skill requests or bug reports. Atlas monitors the repo and responds.

Good first issues are labeled [`good first issue`](../../issues?q=label%3A%22good+first+issue%22).
