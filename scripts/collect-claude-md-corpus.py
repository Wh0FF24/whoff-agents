#!/usr/bin/env python3
"""
Collects CLAUDE.md files from public GitHub repositories and outputs
a JSONL dataset for WH0FF/claude-code-CLAUDE-md-corpus-2026.

Requires: GITHUB_PAT env var with public_repo read scope.
Output: data/claude-md-corpus-2026.jsonl (one JSON object per line)

Usage:
  python3 scripts/collect-claude-md-corpus.py
  python3 scripts/collect-claude-md-corpus.py --max-results 500 --output custom.jsonl
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
MIN_LINES = 50
MAX_LINES = 5000
# GitHub Search API returns max 1000 results per query (10 pages of 100)
SEARCH_PAGE_SIZE = 100
REQUEST_DELAY = 1.0  # seconds between requests to stay within rate limits


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
        raise RuntimeError(f"GitHub API error {e.code} on {url}: {body[:200]}")


def fetch_file_content(raw_url, token):
    req = Request(raw_url, headers={
        "Authorization": f"Bearer {token}",
        "User-Agent": "whoff-agents-dataset-collector/1.0",
    })
    try:
        with urlopen(req, timeout=30) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except (HTTPError, URLError):
        return None


def repo_hash(full_name):
    return hashlib.sha256(full_name.encode()).hexdigest()[:8]


def detect_sections(content):
    lower = content.lower()
    has_never_do = bool(re.search(r'\bnever\b|\bdo not\b|\bdon\'t\b|\bprohibit', lower))
    has_architecture = bool(re.search(r'\barchitecture\b|\barch\b|\bsystem design\b|\binfra\b', lower))
    has_commands = bool(re.search(r'##.*command|##.*run|`[a-z]+ run|`npm |`yarn |`python |`go ', lower))
    has_testing = bool(re.search(r'\btest\b|\bjest\b|\bpytest\b|\bvitest\b|\bgo test\b', lower))
    return has_never_do, has_architecture, has_commands, has_testing


def collect(token, max_results, output_path):
    seen_hashes = set()
    records = []
    page = 1

    print(f"Collecting CLAUDE.md files (target: {max_results} unique records)...")

    while len(records) < max_results:
        try:
            data = github_request("/search/code", token, {
                "q": "filename:CLAUDE.md",
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

            repo = item.get("repository", {})
            full_name = repo.get("full_name", "")
            raw_url = item.get("html_url", "").replace(
                "github.com", "raw.githubusercontent.com"
            ).replace("/blob/", "/")

            # Skip if we can't get raw URL
            if not raw_url or "raw.githubusercontent.com" not in raw_url:
                continue

            time.sleep(REQUEST_DELAY)

            content = fetch_file_content(raw_url, token)
            if content is None:
                continue

            lines = content.splitlines()
            line_count = len(lines)

            # Filter by line count
            if not (MIN_LINES <= line_count <= MAX_LINES):
                continue

            # Deduplicate by content hash
            content_hash = hashlib.sha256(content.encode()).hexdigest()
            if content_hash in seen_hashes:
                continue
            seen_hashes.add(content_hash)

            # Fetch repo metadata for stars and language
            time.sleep(REQUEST_DELAY)
            try:
                repo_data = github_request(f"/repos/{full_name}", token)
                stars = repo_data.get("stargazers_count", 0)
                language = repo_data.get("language") or "unknown"
                # Skip non-English repos (rough heuristic via description language detection)
            except RuntimeError:
                stars = 0
                language = "unknown"

            has_never_do, has_arch, has_commands, has_testing = detect_sections(content)

            record = {
                "repo_hash": repo_hash(full_name),
                "repo_stars": stars,
                "primary_language": language,
                "file_line_count": line_count,
                "has_never_do_section": has_never_do,
                "has_architecture_notes": has_arch,
                "has_command_list": has_commands,
                "has_testing_instructions": has_testing,
                "content": content,
                "collected_date": COLLECTED_DATE,
            }
            records.append(record)

            if len(records) % 50 == 0:
                print(f"  Collected {len(records)} records so far...")

        if len(items) < SEARCH_PAGE_SIZE:
            break

        page += 1
        # GitHub Search API caps at 10 pages (1000 results)
        if page > 10:
            break

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print(f"\nDone. {len(records)} records written to {output_path}")
    print(f"Unique content hashes: {len(seen_hashes)}")
    return records


def main():
    parser = argparse.ArgumentParser(description="Collect CLAUDE.md corpus from GitHub")
    parser.add_argument("--max-results", type=int, default=1000,
                        help="Max records to collect (default: 1000)")
    parser.add_argument("--output", default="data/claude-md-corpus-2026.jsonl",
                        help="Output JSONL file path")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_PAT")
    if not token:
        print("Error: GITHUB_PAT environment variable not set.", file=sys.stderr)
        print("Add a GitHub Personal Access Token with public_repo read scope.", file=sys.stderr)
        sys.exit(1)

    collect(token, args.max_results, args.output)


if __name__ == "__main__":
    main()
