---
dataset_info:
  name: claude-code-commit-patterns-2026
  description: >
    Public GitHub commits co-authored by Claude Code (identified via Co-Authored-By: Claude
    attribution in commit messages). Covers commit message patterns, file change scope, and
    project context. Snapshot: March–April 2026, the period when Claude Code reached 4% of
    all public GitHub commits.
  license: cc-by-4.0
  tags:
    - code
    - llm-evaluation
    - software-engineering
    - claude
    - productivity
---

# claude-code-commit-patterns-2026

## What this is

A dataset of public GitHub commits bearing the `Co-Authored-By: Claude` attribution,
scraped from GitHub's public timeline during the period when Anthropic reported that
Claude Code accounted for ~4% of all public GitHub commits (March 2026).

Each row represents one commit. Fields capture: the commit message, the number and type
of files changed, the primary programming language, the repo topic tags, and whether the
commit message includes a task description or just a diff summary.

## Why it exists

- Benchmark: what tasks are developers actually delegating to Claude Code vs doing themselves?
- Pattern study: are AI-assisted commits more likely to be single-file atomic changes or broad refactors?
- Temporal signal: how did usage patterns shift as Claude Code adoption grew from ~1% to 4%?

## Sample rows (5 rows)

| commit_sha | repo | language | files_changed | has_task_description | commit_message_excerpt |
|------------|------|----------|---------------|---------------------|------------------------|
| a1b2c3d | user/saas-app | TypeScript | 3 | true | "Add Stripe webhook handler for subscription updates — closes #42" |
| b2c3d4e | user/api-project | Python | 1 | false | "Fix null check in auth middleware" |
| c3d4e5f | user/monorepo | JavaScript | 12 | true | "Refactor product listing page to use TanStack Query v5" |
| d4e5f6g | user/cli-tool | Go | 2 | true | "Add retry logic to file upload command with exponential backoff" |
| e5f6g7h | user/ml-pipeline | Python | 4 | false | "Update requirements.txt and fix import paths" |

## Collection method

GitHub Search API filtered on `Co-Authored-By: Claude` in commit messages, public repos only.
Commit messages truncated to first 200 chars. No author PII retained — repo owner names
hashed for privacy. Sampling period: 2026-03-01 to 2026-04-24.

## Intended use

- Research on AI-assisted development patterns
- Training/evaluation of code generation models
- Content for developer tooling marketing (with attribution)

## Built by

[Whoff Agents](https://whoffagents.com) — an AI-operated business.
Get the Atlas Playbook → [whoffagents.com](https://whoffagents.com)

## Status

**DRAFT — Will-OK required before publishing to HuggingFace Hub.**
Sample rows are synthetic pending actual scrape. See WHO-253 in Paperclip.
