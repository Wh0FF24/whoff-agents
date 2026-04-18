> ⭐ **If this saves you time, star the repo** — it helps other developers find it.
> 
> 🚀 **Launching on Product Hunt — Tuesday April 21**. [Hunt us →](https://whoffagents.com/?ref=github-readme)
> 
> **Atlas Starter Kit — $47 launch (going to $97 on Apr 22)** · The production system behind this repo, packaged for your stack.
> [Get it at whoffagents.com/products →](https://whoffagents.com/products?ref=github-readme)

---

<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.png">
  <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.png">
  <img alt="Whoff Agents" src="assets/logo-dark.png" width="280">
</picture>

**Production skills for Claude Code. Built by an AI that runs a real business.**

[![License: MIT](https://img.shields.io/badge/License-MIT-silver.svg)](LICENSE)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-compatible-blue)](https://claude.ai/code)
[![Skills](https://img.shields.io/badge/skills-13%20production--tested-gold)](skills/)
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

---

## Full Kit: 13 Production Skills — $47 launch / $97 after Apr 22

These are the skills Atlas uses to run whoffagents.com across multi-hour sessions and multi-agent workflows without human intervention.

| Skill | Failure mode it fixes |
|-------|-----------------------|
| `context-anchor` | Stale state overrides fresh truth *(free — you have this)* |
| `systematic-debugging` | Random fixes before root cause is known |
| `verification-before-completion` | Assumed done vs. evidence-based done |
| `parallel-dispatch` | Unsafe concurrent agent execution |
| `output-verification` | Agent output you can't audit |
| `pax-protocol` | Inter-agent comms that leak state |
| `agent-handoff` | Context loss between sessions |
| `working-reference` | No shared truth across agents |
| `subagent-driven-dev` | Orchestrator patterns that don't scale |
| `test-driven-development` | Agentic loops without a safety net |
| `code-review` | Style fixes that miss logic bugs |
| `brainstorm` | Building before the problem is understood |
| `plan-writer` | Plans that agents misinterpret and derail |

One-time payment. No subscription. Yours permanently.

→ **[Get the Atlas Starter Kit — $47 launch (was $97)](https://buy.stripe.com/8x2bJ39VlgEd2jt2ERaZi0i)**

---

## Who builds this

Atlas is an AI agent running as a persistent process. It operates whoffagents.com: writes content, manages the store, deploys code, runs outreach — without human intervention.

These skills came out of production failure. Atlas needed them to function reliably. They're not theoretical patterns — they're what an AI agent uses to stay coherent across real work.

Will Weigeshoff (BYU M.S. ECE, Army Reserve) owns the strategy. Atlas handles execution.

→ [whoffagents.com](https://whoffagents.com) · [Follow the build](https://dev.to/atlas_whoffagents)

---

## Active development

| Date | Update |
|------|--------|
| Apr 14, 2026 | v1 shipped — 13-skill kit + free context-anchor |
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

---

## Used this? 

Star the repo and share what you built — [whoffagents.com](https://whoffagents.com) | [Atlas Starter Kit ($97)](https://buy.stripe.com/14A7sNaZpcnXgaj3IVaZi09)
