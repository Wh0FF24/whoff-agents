#!/usr/bin/env python3
"""
Collects MCP server implementations from public GitHub repositories and
outputs a JSONL dataset for WH0FF/mcp-server-catalog-2026.

Uses multiple search strategies to find MCP servers:
  1. topic:mcp-server
  2. filename:mcp.json (manifest files)
  3. "@modelcontextprotocol/sdk" in package.json (Node.js)
  4. "mcp" in pyproject.toml keywords (Python)

Requires: GITHUB_PAT env var with public_repo read scope.
Output: data/mcp-server-catalog-2026.jsonl

Usage:
  python3 scripts/collect-mcp-server-catalog.py
  python3 scripts/collect-mcp-server-catalog.py --max-results 500 --output custom.jsonl
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
REQUEST_DELAY = 1.2

CATEGORY_PATTERNS = {
    "database": [r'\b(sql|postgres|mysql|sqlite|mongo|redis|database|db)\b'],
    "file_system": [r'\b(file|filesystem|directory|folder|path|storage)\b'],
    "api_proxy": [r'\b(api|rest|http|endpoint|proxy|wrapper)\b'],
    "search": [r'\b(search|index|query|retrieval|rag|embedding)\b'],
    "code_tool": [r'\b(code|lint|test|build|compile|debug|git|github)\b'],
    "communication": [r'\b(slack|discord|email|message|chat|notification)\b'],
}


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
        if e.code in (422, 404):
            return {}
        raise RuntimeError(f"GitHub API {e.code} on {url}: {body[:200]}")


def fetch_raw(url, token):
    raw_url = url.replace("github.com", "raw.githubusercontent.com").replace("/blob/", "/")
    req = Request(raw_url, headers={
        "Authorization": f"Bearer {token}",
        "User-Agent": "whoff-agents-dataset-collector/1.0",
    })
    try:
        with urlopen(req, timeout=20) as resp:
            return resp.read().decode("utf-8", errors="replace")
    except (HTTPError, URLError):
        return None


def repo_hash(full_name):
    return hashlib.sha256(full_name.encode()).hexdigest()[:8]


def infer_category(name, description, topics):
    text = f"{name} {description or ''} {' '.join(topics)}".lower()
    for category, patterns in CATEGORY_PATTERNS.items():
        if any(re.search(p, text) for p in patterns):
            return category
    return "other"


def count_tools_from_manifest(content):
    """Parse mcp.json or package.json to estimate tool count."""
    if not content:
        return 0
    try:
        data = json.loads(content)
        # mcp.json format
        tools = data.get("tools", [])
        if tools:
            return len(tools)
        # Some servers list capabilities
        caps = data.get("capabilities", {})
        if caps:
            return len(caps.get("tools", []))
    except (json.JSONDecodeError, TypeError):
        pass
    # Fallback: count function/tool definitions in source
    tool_matches = re.findall(r'"name"\s*:\s*"[^"]+"\s*,\s*"description"', content)
    return len(tool_matches)


def search_repos(token, query, seen_repos):
    """Run one search query, yield unique repo full_names."""
    page = 1
    while page <= 5:  # cap at 500 results per query strategy
        try:
            data = github_request("/search/repositories", token, {
                "q": query,
                "sort": "stars",
                "order": "desc",
                "per_page": SEARCH_PAGE_SIZE,
                "page": page,
            })
        except RuntimeError as e:
            print(f"  Search error: {e}", file=sys.stderr)
            break

        items = data.get("items", [])
        if not items:
            break

        for item in items:
            fn = item.get("full_name", "")
            if fn and fn not in seen_repos:
                seen_repos.add(fn)
                yield item

        if len(items) < SEARCH_PAGE_SIZE:
            break
        page += 1
        time.sleep(REQUEST_DELAY)


def collect(token, max_results, output_path):
    seen_repos = set()
    records = []

    search_strategies = [
        'topic:mcp-server stars:>=1',
        'topic:mcp-server-implementation stars:>=1',
        '"modelcontextprotocol" in:readme stars:>=2',
        'filename:mcp.json "tools"',
    ]

    print(f"Collecting MCP server catalog (target: {max_results} records)...")

    for strategy in search_strategies:
        if len(records) >= max_results:
            break
        print(f"  Strategy: {strategy}")

        for repo_item in search_repos(token, strategy, seen_repos):
            if len(records) >= max_results:
                break

            full_name = repo_item.get("full_name", "")
            stars = repo_item.get("stargazers_count", 0)
            language = repo_item.get("language") or "unknown"
            description = repo_item.get("description") or ""
            topics = repo_item.get("topics", [])
            default_branch = repo_item.get("default_branch", "main")

            # Fetch repo details for has_tests, readme_length
            time.sleep(REQUEST_DELAY)
            try:
                tree = github_request(
                    f"/repos/{full_name}/git/trees/{default_branch}",
                    token,
                    {"recursive": "1"}
                )
            except RuntimeError:
                tree = {}

            file_paths = [f.get("path", "") for f in tree.get("tree", [])]

            has_manifest = any(
                p.endswith("mcp.json") or p == "mcp.json"
                for p in file_paths
            )
            has_tests = any(
                re.search(r'(test|spec|__tests__|tests)/', p) or
                p.endswith((".test.ts", ".test.js", ".test.py", "_test.go"))
                for p in file_paths
            )
            has_auth = any(
                re.search(r'(auth|oauth|apikey|api_key|token)', p.lower())
                for p in file_paths
            )

            # Try to get tool count from manifest
            tool_count = 0
            if has_manifest:
                manifest_path = next(
                    (p for p in file_paths if p.endswith("mcp.json")),
                    None
                )
                if manifest_path:
                    manifest_url = f"https://github.com/{full_name}/blob/{default_branch}/{manifest_path}"
                    content = fetch_raw(manifest_url, token)
                    tool_count = count_tools_from_manifest(content)

            # Readme length as documentation quality proxy
            readme_path = next(
                (p for p in file_paths if p.lower() in ("readme.md", "readme.rst", "readme.txt")),
                None
            )
            readme_length = 0
            if readme_path:
                readme_url = f"https://github.com/{full_name}/blob/{default_branch}/{readme_path}"
                readme_content = fetch_raw(readme_url, token)
                if readme_content:
                    readme_length = len(readme_content)

            category = infer_category(full_name.split("/")[-1], description, topics)

            record = {
                "repo_hash": repo_hash(full_name),
                "repo_stars": stars,
                "primary_language": language,
                "tool_count": tool_count,
                "category": category,
                "has_manifest": has_manifest,
                "has_auth": has_auth,
                "has_tests": has_tests,
                "readme_length": readme_length,
                "collected_date": COLLECTED_DATE,
            }
            records.append(record)

            if len(records) % 50 == 0:
                print(f"  Collected {len(records)} records...")

    os.makedirs(os.path.dirname(output_path) or ".", exist_ok=True)
    with open(output_path, "w", encoding="utf-8") as f:
        for record in records:
            f.write(json.dumps(record, ensure_ascii=False) + "\n")

    print(f"\nDone. {len(records)} records written to {output_path}")
    return records


def main():
    parser = argparse.ArgumentParser(description="Collect MCP server catalog from GitHub")
    parser.add_argument("--max-results", type=int, default=500)
    parser.add_argument("--output", default="data/mcp-server-catalog-2026.jsonl")
    args = parser.parse_args()

    token = os.environ.get("GITHUB_PAT")
    if not token:
        print("Error: GITHUB_PAT environment variable not set.", file=sys.stderr)
        sys.exit(1)

    collect(token, args.max_results, args.output)


if __name__ == "__main__":
    main()
