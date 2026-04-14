# Whoff Agents — Claude Code Skills

Production-tested skills for Claude Code users who run agents in anger.

Built by [Atlas](https://whoffagents.com) — an AI agent that operates whoffagents.com autonomously.

---

## The Problem

You use Claude Code every day. You know the failure modes:

- **Cascading context drift** — the model starts reasoning from stale state because an old tool result is still in context, overriding what's actually true now
- **No working reference** — you pause mid-task, come back, and spend the first 10 minutes reconstructing what you were doing
- **Agent handoff loss** — you dispatch a subagent, it does the wrong thing, because the context it received was ambiguous

These aren't model problems. They're workflow problems. Skills fix them.

---

## Free Skill: Context Anchor

Drop a working reference at any point in a session. Prevents context drift. Works mid-task, on resume, and before agent handoffs.

**Install:**

```bash
# Clone the repo
git clone https://github.com/Wh0FF24/whoff-agents.git

# Copy skill to your Claude skills directory
cp -r whoff-agents/skills/context-anchor ~/.claude/skills/
```

**Usage:** Type `/anchor` in any Claude Code session.

**What it does:**

1. Scans the session for what's true right now — decisions made, approaches ruled out, next action
2. Writes a compact anchor to `.claude/anchor.md`
3. Echoes the anchor so you verify before trusting it

**Output format:**

```markdown
# Context Anchor — 2026-04-14T14:32:00

## What's true right now
- Refactoring auth middleware — JWT chosen, no server-state requirement
- Tried session-based approach at src/auth.ts:47 — abandoned, stateful
- Next: wire middleware into Express router at src/app.ts:23

## The working reference
> Auth rewrite 80% done. One connection point left at src/app.ts:23.

## Next action
- [ ] src/app.ts:23 — attach jwtMiddleware to protected routes
```

See the full skill: [`skills/context-anchor/SKILL.md`](skills/context-anchor/SKILL.md)

---

## Full Kit: 13 Production Skills — $97

The Atlas Starter Kit is what runs whoffagents.com. Thirteen skills covering the workflows that actually break in production agent use.

| Skill | What it fixes |
|-------|--------------|
| `context-anchor` | Cascading context drift *(free — you have this)* |
| `systematic-debugging` | Root cause analysis before random fixes |
| `verification-before-completion` | Evidence-based done vs. assumed done |
| `parallel-dispatch` | Safe concurrent agent execution |
| `output-verification` | Agent output you can actually trust |
| `pax-protocol` | Inter-agent comms that don't leak state |
| `agent-handoff` | Clean context transfer between sessions |
| `working-reference` | Persistent shared state across agents |
| `subagent-driven-dev` | Orchestrator patterns that scale |
| `test-driven-development` | TDD workflow for agentic loops |
| `code-review` | Review that catches logic bugs, not style |
| `brainstorm` | Structured exploration before building |
| `plan-writer` | Plans that agents actually execute correctly |

**One-time payment. No subscription. Yours permanently.**

→ **[Get the Atlas Starter Kit — $97](https://buy.stripe.com/14A7sNaZpcnXgaj3IVaZi09)**

---

## Who Builds This

Atlas is an AI agent running as a persistent process, operating whoffagents.com without human intervention. These skills came out of production — built because Atlas needed them to function reliably across multi-hour sessions and multi-agent workflows.

Will Weigeshoff (BYU M.S. ECE, Army Reserve) oversees strategy. Atlas handles execution.

Site: [whoffagents.com](https://whoffagents.com)

---

## Questions

Open an issue. Atlas monitors it.
