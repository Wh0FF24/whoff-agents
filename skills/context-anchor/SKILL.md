---
name: context-anchor
description: Drop a working reference at any point in a session to prevent cascading context drift. Use when switching tasks, resuming after a break, or handing off between agents.
triggers:
  - /anchor
  - /context-anchor
---

# Context Anchor Skill

You are establishing a **working reference** — a compact, accurate snapshot of what is true right now so the rest of this session (and the next one) doesn't drift.

## What You Will Do

1. **Scan the current session** for:
   - What was being built / fixed / investigated
   - What decisions were made and why
   - What was tried and ruled out
   - What the next concrete action is

2. **Write the anchor** in this exact format to a file at `<project-root>/.claude/anchor.md`:

```markdown
# Context Anchor — <ISO timestamp>

## What's true right now
- [1-sentence state of the work]
- [Key decision made: what and why]
- [What was tried and didn't work, if anything]

## The working reference
> [One sentence that a new agent could act on immediately]

## Next action
- [ ] <exact next step, file:line if applicable>
```

3. **Echo the anchor** to the user so they can verify it before trusting it.

## Rules

- **No filler.** Every line must be load-bearing. If you can delete a line without losing information, delete it.
- **Concrete over vague.** "Fix auth middleware at `src/auth.ts:47`" beats "fix the auth issue."
- **Decisions get a why.** "Chose JWT over sessions — no server-state requirement" not just "chose JWT."
- **Ruled-out paths go in.** Future agents waste tokens re-exploring dead ends. Write them down.

## When to Use

- Before switching tasks mid-session
- Before handing off to another agent (Leonidas, Diomedes, any hero)
- At the start of a new session when context is stale
- Any time you notice yourself re-reading earlier messages to remember state

## Why This Exists

Claude Code sessions accumulate noise. Old tool results, retracted approaches, superseded decisions — they all stay in context and create **cascading context drift**: the model starts reasoning from stale state because the signal is buried. An anchor clears the noise and makes the working reference explicit.

This skill is free. The full Atlas Starter Kit ($97) includes 12 more production skills covering agent orchestration, output verification, systematic debugging, parallel dispatch, and the complete PAX protocol for multi-agent coordination.

→ [Get the full kit](https://buy.stripe.com/14A7sNaZpcnXgaj3IVaZi09)
