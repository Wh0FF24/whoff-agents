---
name: cost-cap-guard
description: Enforce per-session token budgets before dispatching agents. Calculates expected token cost, flags over-budget operations, and generates a trimmed prompt that fits within your limit — without losing the objective.
triggers:
  - /cost-cap
  - /cost-cap-guard
---

# Cost Cap Guard Skill

You are enforcing a **token budget** — calculating what this operation will actually cost, flagging if it exceeds the limit, and producing a trimmed prompt that delivers the same result for less.

Runaway agents are a real cost problem. A single verbose handoff packet, a bloated system prompt, or a multi-step task with no scoping can 3–5x the expected token count. This skill stops that before dispatch.

## What You Will Do

1. **Read the proposed prompt** — the full text being sent to the subagent, including system prompt, context, and task.

2. **Estimate token cost** using this rule of thumb:
   - 1 token ≈ 4 characters
   - Input tokens + estimated output tokens = total session tokens
   - Multiply by model rate (Opus: ~$15/M input, ~$75/M output; Sonnet: ~$3/M input, ~$15/M output; Haiku: ~$0.25/M input, ~$1.25/M output)

3. **Compare against the session budget** (default: 50k tokens unless specified):

```
STATUS: [WITHIN BUDGET / OVER BUDGET / WARNING]
Estimated input tokens:  X,XXX
Estimated output tokens: X,XXX
Total estimated tokens:  X,XXX
Budget:                  XX,XXX
Overage:                 +X,XXX (if applicable)
Estimated cost:          $X.XX
```

4. **If over budget**, produce a trimmed version of the prompt:
   - Strip filler phrases and pleasantries
   - Replace prose context with bullet facts
   - Remove re-stated constraints the subagent can derive from the codebase
   - Trim examples to the minimum needed (1 example beats 3 when they're identical in structure)
   - Cut "here's what I've already tried" to a 1-line ruled-out summary

5. **Write the result** to `.claude/cost-cap-<timestamp>.md`:

```markdown
# Cost Cap Report — <ISO timestamp>

## Budget Status
[WITHIN BUDGET / OVER BUDGET / WARNING — X% of budget used]

## Token Estimate
- Input: X,XXX tokens (~$X.XX)
- Output: X,XXX tokens (~$X.XX)
- Total: X,XXX tokens (~$X.XX)

## Original prompt (X,XXX tokens)
[paste]

## Trimmed prompt (X,XXX tokens — X% reduction)
[paste trimmed version]

## What was cut and why
- [item]: [reason it was redundant]
- [item]: [reason it was derivable from context]
```

## Rules

- **Never cut the objective.** The task must survive trimming intact.
- **Never cut hard constraints.** If the original prompt said "do not touch auth middleware," it stays.
- **Never cut ruled-out paths.** That context prevents the subagent from re-exploring dead ends.
- **Cut filler first.** "I want you to please make sure that you..." → delete entirely.
- **Cut repeated context.** If the same fact appears twice, keep the more precise version.
- **Prose to bullets.** A 200-word paragraph of context often compresses to 4 bullets without information loss.

## Default Budgets by Agent Tier

| Tier | Model | Suggested per-session budget |
|------|-------|------------------------------|
| Orchestrator | Opus | 100k tokens |
| God | Sonnet | 50k tokens |
| Hero | Haiku | 20k tokens |
| Batch job | Any | Set explicitly |

Override the default by stating your budget in the trigger: `/cost-cap 30k`.

## When to Use

- Before dispatching any Agent tool call with a prompt over 500 words
- Before overnight batch jobs where N agents run unattended
- Any time you're about to paste a long context block into a subagent prompt
- When your API bill for the day is higher than expected — run this retroactively to find the wasteful prompt

## Why This Exists

The #2 cause of runaway API costs (after infinite loops) is verbose prompting. Orchestrators write like they're explaining to a human colleague — with pleasantries, full context, examples, and re-stated constraints. Subagents don't need any of that. They need the objective, the constraints, and the ruled-out paths. Everything else is tokens you're paying for that produce zero intelligence.

This skill makes the cost visible before you pay it.

This skill is free. The full Atlas Starter Kit ($97) includes 12 more production skills — including the complete PAX protocol, parallel dispatch orchestration, and a systematic debugging framework built for multi-agent systems.

→ [Get the full kit](https://buy.stripe.com/14A7sNaZpcnXgaj3IVaZi09)
→ [Free skills repo](https://github.com/Wh0FF24/whoff-agents)
