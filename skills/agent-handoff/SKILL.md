---
name: agent-handoff
description: Generate a structured context packet before dispatching any subagent. Prevents the #1 cause of subagent failure: the agent acts on a wrong assumption that was never stated. Use before every Agent tool call, tmux dispatch, or session delegation.
triggers:
  - /handoff
  - /agent-handoff
---

# Agent Handoff Skill

You are preparing a **handoff packet** — the minimum context a subagent needs to execute correctly without asking clarifying questions, re-exploring dead ends, or hallucinating constraints.

Subagents fail for one reason: they receive a goal but not its shape. They don't know what you already tried, what's off-limits, what "done" looks like, or which files actually matter. This skill makes that implicit context explicit.

## What You Will Do

1. **Extract from the current session:**
   - The exact task to delegate (one sentence, actionable)
   - Decisions already made that the subagent must not re-litigate
   - Approaches tried and ruled out (with reasons)
   - Files/paths the subagent needs to touch (concrete, not vague)
   - The success criterion — how the subagent knows it's done
   - Hard constraints — what it must not do

2. **Write the handoff packet** to `.claude/handoff-<timestamp>.md`:

```markdown
# Agent Handoff — <ISO timestamp>

## Objective
[One sentence. Starts with a verb. Specific enough that no clarifying question is needed.]

## Context the subagent needs
- [Key fact 1 — architectural decision, API behavior, business rule]
- [Key fact 2]
- [Add only what would not be obvious from reading the files]

## Already tried — do not re-attempt
- [Approach]: [Why it failed or was ruled out]
- [Approach]: [Why it failed or was ruled out]

## Files to touch
- `path/to/file.ts` — [what to do here, optionally line number]
- `path/to/other.ts` — [what to do here]

## Hard constraints
- [MUST NOT]: [What the subagent must not change, call, or assume]
- [MUST NOT]: [...]

## Success criterion
- [ ] [Concrete, verifiable output — test passes, file exists, API returns X]
- [ ] [Second criterion if needed]

## If blocked
[What the subagent should do if it hits an unexpected blocker — escalate, write a findings file, skip and note, etc.]
```

3. **Echo the packet** so you can verify it before dispatching.

4. **Copy the packet content** into your Agent tool prompt or tmux dispatch command so the subagent has it inline.

## Rules

- **One objective per handoff.** Compound tasks produce confused agents. Split them.
- **Ruled-out paths are mandatory.** If you tried something that failed, write it down. Subagents re-explore dead ends by default — they don't know better unless you tell them.
- **Constraints are not optional.** "Don't touch the auth middleware" said once in conversation does not propagate to a subagent. Write it explicitly every time.
- **Success criterion must be verifiable.** "It works" is not a success criterion. "The test at `tests/auth.test.ts` passes" is.
- **No filler in context facts.** Only write what the subagent would not know from reading the codebase. Architecture docs, past decisions, runtime behavior — yes. Basic syntax — no.
- **If-blocked is load-bearing.** An unblocked subagent that can't proceed will hallucinate a workaround. Give it an explicit fallback.

## When to Use

- Before every `Agent` tool call where you're delegating real work
- Before spawning a tmux agent session (any god, hero, or worker)
- Before resuming a session that has been idle > 30 minutes (use as a self-handoff)
- Any time your prompt to a subagent exceeds 3 sentences — that's a sign implicit context is leaking in and needs to be made explicit

## Why This Exists

Subagent failure is almost never a model capability problem. It's a context problem. The orchestrator knows what was tried, what's fragile, what matters — and none of that gets transmitted. The subagent operates from a clean slate with a thin goal statement, fills in the blanks with plausible-sounding assumptions, and produces output that looks right but breaks something the orchestrator would never have broken.

The handoff packet is the fix. It externalizes the orchestrator's working model so the subagent starts from the same state, not a hallucinated one.

This skill is free. The full Atlas Starter Kit ($97) includes 12 more production skills — including the complete PAX protocol for structured inter-agent communication that scales this pattern across a full Pantheon of persistent agents.

→ [Get the full kit](https://buy.stripe.com/14A7sNaZpcnXgaj3IVaZi09)
