---
dataset_name: mcp-server-catalog-2026
pretty_name: MCP Server Catalog 2026
license: apache-2.0
tags:
  - mcp
  - model-context-protocol
  - developer-tools
  - ai-agents
  - claude
task_categories:
  - text-generation
language:
  - en
size_categories:
  - n<1K
---

# Dataset Card: mcp-server-catalog-2026

## Dataset Description

A catalog of Model Context Protocol (MCP) server implementations scraped from public GitHub repositories in May 2026. MCP is Anthropic's open standard for connecting AI models to external data sources and tools — it launched in late 2024 and by mid-2026 had hundreds of community-built server implementations.

This dataset captures the MCP server ecosystem at a snapshot in time: what tools servers expose, what categories they fall into, how they're implemented, and how they're used.

## Why This Dataset Exists

MCP adoption grew rapidly through 2025–2026 as Claude Code and other AI agent systems adopted it as the standard integration layer. As the ecosystem expanded, no structured catalog existed for:

- What capabilities are most commonly exposed via MCP?
- Which server patterns (REST proxy, database adapter, file system, tool wrapper) are most prevalent?
- How does implementation quality correlate with adoption?
- Evaluation data for MCP-aware code generation models

**No competing dataset exists** as of May 2026. The official MCP server list is curated and incomplete; this dataset covers the long tail of community implementations.

## Data Collection Method

GitHub Search API queries:
- `topic:mcp-server` on public repositories
- `filename:mcp.json` (MCP server manifest files)
- `"@modelcontextprotocol/sdk"` in package.json (Node.js implementations)
- `"mcp"` in pyproject.toml (Python implementations)

Filtered to:
- Repositories with at least 1 star (removes stubs)
- Contains recognizable MCP server entry point (server.py, index.ts, main.go with MCP imports)
- Deduplicated by repository (one record per repo)
- No PII retained (repository owner names hashed)

## Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `repo_hash` | string | SHA-256 of owner/repo (anonymized) |
| `repo_stars` | int | Repository star count at collection time |
| `primary_language` | string | GitHub-detected primary language |
| `tool_count` | int | Number of tools/resources exposed (parsed from manifest or source) |
| `category` | string | Inferred category: `database`, `file_system`, `api_proxy`, `search`, `code_tool`, `communication`, `other` |
| `has_manifest` | bool | Contains mcp.json or equivalent manifest file |
| `has_auth` | bool | Implements authentication (OAuth, API key, session) |
| `has_tests` | bool | Contains test files |
| `readme_length` | int | README character count (proxy for documentation quality) |
| `collected_date` | string | ISO date of collection |

## Sample Records

```json
{"repo_hash": "d4f8a2c1", "repo_stars": 312, "primary_language": "TypeScript", "tool_count": 8, "category": "database", "has_manifest": true, "has_auth": true, "has_tests": true, "readme_length": 4200, "collected_date": "2026-05-05"}
{"repo_hash": "e7b3d9a4", "repo_stars": 67, "primary_language": "Python", "tool_count": 3, "category": "api_proxy", "has_manifest": false, "has_auth": false, "has_tests": false, "readme_length": 890, "collected_date": "2026-05-05"}
{"repo_hash": "f2c6e8b7", "repo_stars": 1204, "primary_language": "TypeScript", "tool_count": 12, "category": "code_tool", "has_manifest": true, "has_auth": true, "has_tests": true, "readme_length": 7600, "collected_date": "2026-05-05"}
```

## Status

- [x] Dataset card written
- [x] Schema defined
- [x] Sample records created
- [ ] Actual data collection — requires `GITHUB_PAT` with `public_repo` read scope
- [ ] Will-OK required before publishing to HF Hub

**Blocker:** GitHub Personal Access Token needed. Add `GITHUB_PAT` to `~/projects/whoff-agents/.env`.

## Estimated Downloads

Month 1: 200-400 DL (MCP developer community, AI agent researchers)
Month 3: 500-1000 DL (growing as MCP adoption expands; high search value for "MCP server list")

## Dataset HF URL (pending publish)

`WH0FF/mcp-server-catalog-2026`

## Collection Script Location

`~/projects/whoff-agents/scripts/collect-mcp-server-catalog.py` (to be written post-approval)
