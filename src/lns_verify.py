#!/usr/bin/env python3
"""
lns_verify.py — Needlepoint shop verification script
Checks each shop in lns_combined_approved.json and adds a 'status' field.

Status values:
  confirmed_open   — has hours/phone/ig (manually verified, skipped)
  url_active       — URL returned 200 OK
  google_active    — URL dead/missing but Google search suggests active
  auto_removed     — no URL and no confirming signals
  url_dead         — URL failed and Google found no evidence of activity
  already_deleted  — was already marked deleted=true in source JSON

Usage:
  python3 lns_verify.py
  python3 lns_verify.py --input my_file.json --output my_output.json
  python3 lns_verify.py --dry-run          # print summary without writing
  python3 lns_verify.py --limit 10         # only process first N url-only shops (for testing)
"""

import json
import time
import argparse
import sys
import urllib.request
import urllib.error
import urllib.parse
import ssl
import re
from pathlib import Path
from typing import Optional, Tuple

# ── Config ────────────────────────────────────────────────────────────────────

DEFAULT_INPUT  = "lns_combined_approved.json"
DEFAULT_OUTPUT = "lns_verified.json"

# Seconds to wait between HTTP requests (be polite)
REQUEST_DELAY   = 1.5
# Seconds to wait between Google searches
GOOGLE_DELAY    = 3.0
# HTTP timeout in seconds
HTTP_TIMEOUT    = 10
# Max redirects to follow
MAX_REDIRECTS   = 5

# User-agent that most sites won't block
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
}

# Words in page content that strongly suggest a business is closed
CLOSED_SIGNALS = [
    "permanently closed",
    "we have closed",
    "we are closed",
    "shop is closed",
    "store is closed",
    "out of business",
    "no longer in business",
    "sadly closed",
    "closing our doors",
    "we've closed",
    "has closed",
]

# ── Helpers ───────────────────────────────────────────────────────────────────

def log(msg: str):
    print(msg, flush=True)


def fetch_url(url: str) -> Tuple[Optional[int], str]:
    """
    Attempt to GET a URL. Returns (status_code, page_text).
    status_code is None if the request failed entirely (timeout, DNS error, etc.)
    """
    # Ensure the URL has a scheme
    if not url.startswith(("http://", "https://")):
        url = "https://" + url

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT, context=ctx) as resp:
            body = resp.read(50_000).decode("utf-8", errors="ignore")
            return resp.status, body
    except urllib.error.HTTPError as e:
        return e.code, ""
    except Exception:
        return None, ""


def page_says_closed(text: str) -> bool:
    """Return True if the page content contains a strong closure signal."""
    lower = text.lower()
    return any(sig in lower for sig in CLOSED_SIGNALS)


def google_search(shop_name: str, city: str, state: str) -> str:
    """
    Perform a Google search and return the raw result page HTML.
    Uses the public Google search endpoint — no API key needed,
    but subject to rate-limiting. If blocked, returns "".
    """
    query = f'"{shop_name}" {city} {state} needlepoint'
    encoded = urllib.parse.quote_plus(query)
    url = f"https://www.google.com/search?q={encoded}&num=5"

    req = urllib.request.Request(url, headers={**HEADERS, "Referer": "https://www.google.com/"})
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE
    try:
        with urllib.request.urlopen(req, timeout=HTTP_TIMEOUT, context=ctx) as resp:
            return resp.read(80_000).decode("utf-8", errors="ignore")
    except Exception:
        return ""


def google_suggests_active(shop_name: str, city: str, state: str) -> bool:
    """
    Return True if Google search results suggest the shop is still active.
    Heuristic: shop name appears in snippet text AND no strong closure signal.
    """
    html = google_search(shop_name, city, state)
    if not html:
        return False  # blocked or failed — treat as no evidence

    # Strip HTML tags for easier scanning
    text = re.sub(r"<[^>]+>", " ", html).lower()

    name_lower = shop_name.lower()
    # Check if Google shows the business at all
    if name_lower not in text:
        return False

    # If Google shows it AND has closure language → not active
    if any(sig in text for sig in CLOSED_SIGNALS):
        return False

    # "Permanently closed" is often injected by Google Maps into search snippets
    if "permanently closed" in text:
        return False

    return True


# ── Main verification logic ───────────────────────────────────────────────────

def classify_shop(shop: dict, dry_run: bool = False) -> dict:
    """
    Add a 'status' field to the shop dict based on verification rules.
    Returns the updated shop dict.
    """
    s = shop.copy()

    # 1. Already deleted in source
    if s.get("deleted"):
        s["status"] = "already_deleted"
        return s

    # 2. Has manual confirming signals → confirmed open, no network check
    if s.get("hours_value") or s.get("phone_value") or s.get("ig_value"):
        s["status"] = "confirmed_open"
        return s

    # 3. No URL and no confirming signals → auto-remove
    if not s.get("url"):
        s["status"] = "auto_removed"
        return s

    # 4. Has URL → check it
    if dry_run:
        s["status"] = "pending"
        return s

    url = s["url"]
    name = s["shop_name"]
    city = s.get("city", "")
    state = s.get("state", "")

    log(f"  → Checking URL: {url}")
    status_code, body = fetch_url(url)
    time.sleep(REQUEST_DELAY)

    if status_code and 200 <= status_code < 400:
        # URL is alive
        if page_says_closed(body):
            # Site is up but announces closure
            log(f"  ✗ URL alive but page says CLOSED")
            s["status"] = "url_dead"
        else:
            log(f"  ✓ URL active ({status_code})")
            s["status"] = "url_active"
    else:
        # URL is dead or errored — fall back to Google
        reason = f"HTTP {status_code}" if status_code else "connection failed"
        log(f"  ✗ URL failed ({reason}) — trying Google …")
        time.sleep(GOOGLE_DELAY)
        if google_suggests_active(name, city, state):
            log(f"  ✓ Google suggests active")
            s["status"] = "google_active"
        else:
            log(f"  ✗ Google found no evidence of activity")
            s["status"] = "url_dead"

    return s


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Verify LNS shop list")
    parser.add_argument("--input",   default=DEFAULT_INPUT,  help="Input JSON file")
    parser.add_argument("--output",  default=DEFAULT_OUTPUT, help="Output JSON file")
    parser.add_argument("--dry-run", action="store_true",    help="Skip network calls; just categorize")
    parser.add_argument("--limit",   type=int, default=None, help="Only process first N URL-only shops")
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        log(f"ERROR: Input file not found: {input_path}")
        sys.exit(1)

    with open(input_path, encoding="utf-8") as f:
        shops = json.load(f)

    log(f"Loaded {len(shops)} shops from {input_path}")
    log("")

    results = []
    counts = {
        "confirmed_open":  0,
        "url_active":      0,
        "google_active":   0,
        "auto_removed":    0,
        "url_dead":        0,
        "already_deleted": 0,
        "pending":         0,
    }

    # Separate URL-only shops so we can apply --limit cleanly
    url_only_processed = 0

    for i, shop in enumerate(shops):
        name = shop.get("shop_name", "Unknown")
        city = shop.get("city", "")
        state = shop.get("state", "")

        # Determine if this is a URL-only shop (needs network check)
        needs_network = (
            not shop.get("deleted")
            and not shop.get("hours_value")
            and not shop.get("phone_value")
            and not shop.get("ig_value")
            and shop.get("url")
        )

        if needs_network and args.limit is not None:
            if url_only_processed >= args.limit:
                # Skip remaining URL-only shops past the limit
                s = shop.copy()
                s["status"] = "pending"
                results.append(s)
                counts["pending"] += 1
                continue
            url_only_processed += 1

        log(f"[{i+1}/{len(shops)}] {name} — {city}, {state}")
        updated = classify_shop(shop, dry_run=args.dry_run)
        results.append(updated)
        counts[updated["status"]] += 1

    # ── Summary ──────────────────────────────────────────────────────────────
    log("")
    log("═" * 50)
    log("VERIFICATION SUMMARY")
    log("═" * 50)
    log(f"  Confirmed open  (manual signals):  {counts['confirmed_open']}")
    log(f"  URL active      (HTTP 200):        {counts['url_active']}")
    log(f"  Google active   (URL dead, Google ok): {counts['google_active']}")
    log(f"  Auto-removed    (no URL, no data): {counts['auto_removed']}")
    log(f"  URL dead        (failed + no Google evidence): {counts['url_dead']}")
    log(f"  Already deleted (source deleted=true): {counts['already_deleted']}")
    if counts["pending"]:
        log(f"  Pending         (skipped / dry-run): {counts['pending']}")
    log("─" * 50)
    keep = counts["confirmed_open"] + counts["url_active"] + counts["google_active"]
    remove = counts["auto_removed"] + counts["url_dead"]
    log(f"  KEEP:   {keep}")
    log(f"  REMOVE: {remove}")
    log("═" * 50)

    if not args.dry_run:
        output_path = Path(args.output)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        log(f"\nOutput written to: {output_path}")
    else:
        log("\n[Dry run — no file written]")


if __name__ == "__main__":
    main()
