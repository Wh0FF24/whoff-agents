#!/usr/bin/env python3
"""Generate SeatSage Pro unlock codes.

Usage: python3 generate_codes.py [count]

Prints plaintext codes to stdout (KEEP PRIVATE — deliver via your payment
provider's post-purchase flow) and the SHA-256 hash array to paste into
js/config.js CODE_HASHES (append to the existing list so old codes stay valid).
"""
import hashlib
import json
import secrets
import sys

ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"  # no 0/O/1/I/L confusables


def make_code() -> str:
    part = lambda: "".join(secrets.choice(ALPHABET) for _ in range(4))
    return f"SAGE-{part()}-{part()}"


def main() -> None:
    count = int(sys.argv[1]) if len(sys.argv) > 1 else 100
    codes = [make_code() for _ in range(count)]
    print("# PLAINTEXT CODES — keep private:")
    print("\n".join(codes))
    print("\n# SHA-256 hashes — append inside CODE_HASHES in js/config.js:")
    print(json.dumps([hashlib.sha256(c.encode()).hexdigest() for c in codes], indent=1))


if __name__ == "__main__":
    main()
