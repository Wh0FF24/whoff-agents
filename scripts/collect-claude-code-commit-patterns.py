#!/usr/bin/env python3
"""
Collects public GitHub commits co-authored by Claude Code and outputs
a JSONL dataset for WH0FF/claude-code-commit-patterns-2026.

Identifies commits via "Co-Authored-By: Claude" in the commit message,
covering the period when Claude Code accounted for ~4% of public GitHub commits.

Requires: GITHUB_PAT env var with public_repo read scope.
Output: data/claude-code-commit-patterns-2026.jsonl (one JSON object per line)

Usage:
  python3 scripts/collect-claude-code-commit-patterns.py
  python3 scripts/collect-claude-code-commit-patterns.py --start 2026-03-01 --end 2026-04-30 --max-results 2000
"""

import argparse
import hashlib
import json
import os
import re
import sys
import time
from datetime import date
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode


GITHUB_API = "https://api.github.com"
COLLECTED_DATE = date.today().isoformat()
SEARCH_PAGE_SIZE = 100
REQUEST_DELAY = 1.2  # slightly above 1s to stay within secondary rate limits

# Co-authorship patterns Claude Code uses
CLAUDE_COAUTHOR_PATTERNS = [
    "Co-Authored-By: Claude",
    "Co-authored-by: Claude",
    "co-authored-by: claude",
]


def github_request(path, token, params=None):
    url = f"{GITHUB_API}{path}"
    if params:
        url += "?" + urlencode(params)
    req = Request(url, headers={
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "whoff-agents-dataset-collector/1.0",
    })
    try:
        with urlopen(req, timeout=30) as resp:
            return json.loads(resp.read().decode())
    except HTTPError as e:
        body = e.read().decode()
        if e.code == 422:
            return {"items": [], "total_count": 0}  # Query too broad, skip
        raise RuntimeError(f"GitHub API error {e.code} on {url}: {body[:200]}")


def repo_hash(full_name):
    return hashlib.sha256(full_name.encode()).hexdigest()[:8]


def classify_commit_scope(files_changed, additions, deletions):
    total_changes = additions + deletions
    if files_changed == 1:
        return "single_file"
    elif files_changed <= 3 and total_changes <= 100:
        return "small_change"
    elif files_changed <= 10:
        return "moderate_refactor"
    else:
        return "broad_refactor"


def has_task_description(message):
    """Detect whether commit message describes a task (not just a diff summary)."""
    indicators = [
        r'\b(add|implement|fix|update|refactor|remove|create|build|improve)\b',
        r'\b(closes?|fixes?|resolves?)\s+#\d+',
        r'\b(feat|fix|docs|style|refactor|test|chore)\s*[:\(]',  # conventional commits
    ]
    lower = message.lower()
    return any(re.search(p, lower) for p in indicators)


def extract_message_excerpt(message, max_chars=200):
    """First line, truncated."""
    first_line = message.split("\n")[0].strip()
    return first_line[:max_chars] if first_line else ""


def collect(token, start_date, end_date, max_results, output_path):
    seen_shas = set()
    records = []
    page = 1

    query = f'"Co-Authored-By: Claude" committer-date:{start_date}..{end_date}'
    print(f"Collecting commits: {query}")
    print(f"Target: {max_results} unique records")

    while len(records) < max_results:
        try:
            data = github_request("/search/commits", token, {
                "q": query,
                "sort": "committer-date",
                "order": "desc",
                "per_page": SEARCH_PAGE_SIZE,
                "page": page,
            })
        except RuntimeError as e:
            print(f"Search failed on page {page}: {e}", file=sys.stderr)
            break

        items = data.get("items", [])
        if not items:
            break

        total_count = data.get("total_count", 0)
        print(f"  Page {page}: {len(items)} results (total indexed: {total_count})")

        for item in items:
            if len(records) >= max_results:
                break

            sha = item.get("sha", "")
            if sha in seen_shas:
                continue
            seen_shas.add(sha)

            commit_data = item.get("commit", {})
            message = commit_data.get("message", "")

            # Verify this actually has Claude co-authorship (search can be fuzzy)
            if not any(p.lower() in message.lower() for p in CLAUDE_COAUTHOR_PATTERNS):
                continue

            repo = item.get("repository", {})
            full_name = repo.get("full_name", "")
            language = repo.get("language") or "unknown"
            stars = repo.get("stargazers_count", 0)
            topics = repo.get("topics", [])

            # Get file stats from the commit detail endpoint
            time.sleep(REQUEST_DELAY)
            try:
                commit_detail = github_request(f"/repos/{full_name}/commits/{sha}", token)
                stats = commit_detail.get("stats", {})
                files = commit_detail.get("files", [])
                files_changed = len(files)
                additions = stats.get("additions", 0)
                deletions = stats.get("deletions", 0)
            except RuntimeError:
                files_changed = 0
                additions = 0
                deletions = 0

            committer_date = (commit_data.get("committer") or {}).get("date", "")[:10]

            record = {
                "commit_hash": sha[:8],
                "repo_hash": repo_hash(full_name),
                "repo_stars": stars,
                "primary_language": language,
                "repo_topics": topics[:5],  # cap at 5 for size
                "files_changed": files_changed,
                "additions": additions,
                "deletions": deletions,
                "commit_scope": classify_commit_scope(files_changed, additions, deletions),
                "has_task_description": has_task_description(message),
                "commit_message_excerpt": extract_message_excerpt(message),
                "committer_date": committer_date,
                "collected_date": COLLECTED_DATE,
            }
            records.append(record)

            if len(records) % 100 == 0:
                print(f"  Collected {len(records)} records so far...")

        if len(items) < SEARCH_PAGE_SIZE:
            break

        page += 1
        if page > 10:  # GitHub Search API caps at 1000 results
            break

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print(f"\nDone. {len(records)} records written to {output_path}")
    return records


def main():
    parser = argparse.ArgumentParser(description="Collect Claude Code commit patterns from GitHub")
    parser.add_argument("--start", default="2026-03-01", help="Start date YYYY-MM-DD")
    parser.add_argument("--end", default="2026-04-30", help="End date YYYY-MM-DD")
    parser.add_argument("--max-results", type=int, default=2000)
    parser.add_argument("--output", default="data/claude-code-commit-patterns-2026.jsonl")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_PAT")
    if not token:
        print("Error: GITHUB_PAT environment variable not set.", file=sys.stderr)
        sys.exit(1)

    collect(token, args.start, args.end, args.max_results, args.output)


if __name__ == "__main__":
    main()
