---
name: dead-letter
description: Capture a failed or blocked task before it disappears. Categorizes the failure mode, extracts what was learned, and generates either a retry packet with the root cause fixed or an escalation message with specific decision points. Use whenever an agent returns a blocker, error, or partial result.
triggers:
  - /dead-letter
  - /dl
---

# Dead Letter Skill

You are processing a **failed task** — one that returned an error, a blocker, a partial result, or a "couldn't proceed" message. Your job is to make sure nothing is lost, the failure mode is named, and the next action is unambiguous.

Failed tasks are information. The agent that failed learned something — what it tried, what broke, what it couldn't resolve. If that context isn't captured before the session ends, the next agent starts from zero and hits the same wall.

## What You Will Do

1. **Read the failed task output** — the full message, error, or partial result from the agent that couldn't complete.

2. **Classify the failure mode:**

| Code | Mode | Definition |
|------|------|------------|
| `BLOCKED-CRED` | Missing credential | Needs API key, token, or auth the agent doesn't have |
| `BLOCKED-PERM` | Permission gate | Action requires human approval or elevated access |
| `BLOCKED-DATA` | Missing data | Needs a file, DB record, or external state that doesn't exist yet |
| `BLOCKED-AMBIG` | Ambiguous objective | Task was underspecified and agent couldn't resolve the ambiguity |
| `BLOCKED-RATE` | Rate limited | API, platform, or service rejected the request temporarily |
| `FAILED-LOGIC` | Logic error | Agent produced output but it was wrong, incomplete, or broken |
| `FAILED-TOOL` | Tool failure | A dependency (CLI, library, MCP, subprocess) failed |
| `FAILED-SCOPE` | Out of scope | Task requires capability the assigned agent doesn't have |
| `PARTIAL` | Partial completion | Some steps done, some not — specific breakpoint identified |

3. **Write the dead letter record** to `.claude/dead-letter-<timestamp>.md`:

```markdown
# Dead Letter — <ISO timestamp>

## Task
[Original task, one sentence]

## Failure Mode
[CODE]: [one-line description]

## What was attempted
- [Step 1 tried]
- [Step 2 tried]
- [Where it broke and why]

## What was learned
- [Fact that wasn't in the original brief]
- [Constraint discovered during execution]
- [Any partial output or intermediate state that exists]

## Retry packet (if retryable)
**Fix required before retry:** [specific thing to change]
**Retry prompt:**
> [Revised task with root cause addressed]

## Escalation (if not retryable)
**Route to:** [Agent or human who can unblock]
**Decision needed:** [Specific question that must be answered]
**Deadline:** [When this blocks downstream work]

## Files written (partial output to preserve)
- `path/to/file` — [what's in it, what's missing]
```

4. **Output the failure mode code + summary** inline so you see it immediately without opening the file.

## Rules

- **Name the failure mode first.** "Something went wrong" is not a failure mode. `BLOCKED-CRED: missing STRIPE_API_KEY` is.
- **Preserve partial output.** If the agent wrote 60% of the files, list exactly which ones exist and which don't. Don't treat partial as total failure.
- **Retry vs escalate is a hard decision.** If the fix is mechanical (add a key, provide a file), generate a retry packet. If it requires a judgment call (change strategy, approve spend, re-scope), escalate.
- **Escalation routes to a specific agent.** "Escalate to Atlas" is better than "escalate to management." Name the code: ATL, PRO, WIL, etc.
- **Every escalation has a decision question.** Not "FYI this failed" but "Should we use Stripe or PayPal for this integration? Blocked on this."
- **Deadline is load-bearing.** If the failed task unblocks another agent or a scheduled job, write when.

## Failure Mode Quick Reference

```
BLOCKED-CRED  → add credential, retry same task
BLOCKED-PERM  → route to WIL with specific approval request
BLOCKED-DATA  → identify who generates the missing data, route there
BLOCKED-AMBIG → rewrite task with explicit constraints, retry
BLOCKED-RATE  → add delay, retry with backoff
FAILED-LOGIC  → add validation step, route to code-reviewer agent
FAILED-TOOL   → fix dependency, document in runbook
FAILED-SCOPE  → re-route to capable agent, update routing table
PARTIAL       → checkpoint what's done, hand off breakpoint to new agent
```

## When to Use

- Any time an agent returns "I can't proceed", "blocked on", "error:", or a partial result
- After an overnight batch job — run against every agent session that didn't produce expected output
- Before reporting a failure to the orchestrator — capture it in a dead letter first so the report includes the full failure context
- Any time a task is abandoned mid-session and needs to be picked up later

## Why This Exists

Failed tasks disappear. The agent session ends, the context is cleared, and the next agent that picks up the work re-discovers the same blocker from scratch. This is the multi-agent equivalent of not writing down an error message before closing the terminal.

The dead letter record turns failure into a durable asset: what was tried, what was learned, and exactly what the next agent needs to succeed where the last one didn't.

This skill is free. The full Atlas Starter Kit ($97) includes 12 more production skills — including the complete PAX protocol, systematic debugging frameworks, and the agent-handoff system that prevents most of these failures in the first place.

→ [Get the full kit](https://buy.stripe.com/14A7sNaZpcnXgaj3IVaZi09)
→ [Free skills repo](https://github.com/Wh0FF24/whoff-agents)
