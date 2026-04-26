---
dataset_name: claude-code-CLAUDE-md-corpus-2026
pretty_name: Claude Code CLAUDE.md Corpus 2026
license: apache-2.0
tags:
  - claude-code
  - developer-tools
  - configuration
  - ai-agents
  - code-llm
task_categories:
  - text-generation
  - text-classification
language:
  - en
size_categories:
  - 1K<n<10K
---

# Dataset Card: claude-code-CLAUDE-md-corpus-2026

## Dataset Description

A corpus of `CLAUDE.md` instruction files scraped from public GitHub repositories in April 2026. CLAUDE.md files are project-specific instruction files that developers write to guide Claude Code's behavior — they contain coding conventions, project context, explicit do/don't rules, and architecture notes.

This dataset captures how developers are actually using Claude Code's instruction system in the wild: what they include, how they structure it, what constraints they document, and what patterns repeat across different project types.

## Why This Dataset Exists

Claude Code (released 2025) lets developers put a `CLAUDE.md` file at the root of any project to shape how the AI agent behaves. As adoption grew through early 2026, CLAUDE.md files proliferated across GitHub. This corpus captures a snapshot of those files at a moment when the pattern is established but not yet studied.

**Research value:**
- What knowledge do developers transfer to AI agents vs. leave implicit?
- What conventions, warnings, and constraints appear most frequently?
- How does CLAUDE.md content correlate with project type/language/size?
- Evaluation/training data for instruction-following models

**No competing dataset exists** in this space as of April 2026.

## Data Collection Method

GitHub Search API query: `filename:CLAUDE.md` on public repositories. Filtered to:
- English-language repositories
- Files between 50 and 5,000 lines (removes stubs and machine-generated walls)
- Deduplicated by content hash (removes forks with identical files)
- No PII retained (repository owner names hashed)

## Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `repo_hash` | string | SHA-256 of owner/repo (anonymized) |
| `repo_stars` | int | Repository star count at collection time |
| `primary_language` | string | GitHub-detected primary language |
| `file_line_count` | int | CLAUDE.md line count |
| `has_never_do_section` | bool | Contains explicit prohibitions |
| `has_architecture_notes` | bool | Contains system/architecture documentation |
| `has_command_list` | bool | Contains common commands section |
| `has_testing_instructions` | bool | Contains test-running instructions |
| `content` | string | Full CLAUDE.md content |
| `collected_date` | string | ISO date of collection |

## Sample Records

```json
{"repo_hash": "a3f2e9c1", "repo_stars": 847, "primary_language": "TypeScript", "file_line_count": 89, "has_never_do_section": true, "has_architecture_notes": true, "has_command_list": true, "has_testing_instructions": true, "content": "# Project: API Gateway\n\n## Tech Stack\nNext.js 14 + tRPC + Prisma + PostgreSQL\n\n## Commands\n- `npm run dev` — start dev server\n- `npm test` — run Jest suite\n\n## Never\n- Do not modify .env files\n- Do not use `any` TypeScript types\n- Do not bypass the tRPC router layer\n\n## Architecture\n...", "collected_date": "2026-04-28"}
{"repo_hash": "b7d1f4a8", "repo_stars": 124, "primary_language": "Python", "file_line_count": 34, "has_never_do_section": false, "has_architecture_notes": false, "has_command_list": true, "has_testing_instructions": true, "content": "# Python ML Project\n\nRun tests: `pytest tests/`\nFormat: `ruff format .`\nLint: `ruff check .`\n\nModel files are in models/ — never commit these.\nData is in data/raw/ — read-only, never write.\n", "collected_date": "2026-04-28"}
{"repo_hash": "c9a3e2d7", "repo_stars": 2341, "primary_language": "Go", "file_line_count": 156, "has_never_do_section": true, "has_architecture_notes": true, "has_command_list": true, "has_testing_instructions": true, "content": "# Go Service\n\n## Critical: This service handles financial transactions\n- All monetary amounts use int64 (cents), never float\n- Transaction logs are append-only\n- Never DELETE from the transactions table\n\n## Running\n...", "collected_date": "2026-04-28"}
```

## Status

- [x] Dataset card written
- [x] Schema defined
- [x] Sample records created  
- [x] Collection script written (`scripts/collect-claude-md-corpus.py`)
- [ ] Actual data collection — requires `GITHUB_PAT` with `public_repo` read scope
- [ ] Will-OK required before publishing to HF Hub

**Blocker:** GitHub Personal Access Token needed. Add `GITHUB_PAT` to `~/projects/whoff-agents/.env`.

## Estimated Downloads

Month 1: 100-200 DL (Claude Code developer community, ML researchers studying instruction-following)  
Month 3: 300-600 DL (evergreen research value, grows as Claude Code adoption grows)

## Dataset HF URL (pending publish)

`WH0FF/claude-code-CLAUDE-md-corpus-2026`

## Collection Script Location

`~/projects/whoff-agents/scripts/collect-claude-md-corpus.py` ✓ written — ready to run once `GITHUB_PAT` is set
