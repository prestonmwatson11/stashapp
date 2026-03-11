"""
LNS Hours Reviewer — Stage 2
Loads lns_hours_results.json and lets you approve, edit, or skip
each scraped result before writing back to the workbook.

Usage:
    python review_hours.py [--auto-approve-confident]

Options:
    --auto-approve-confident   Automatically approve results where
                               status is found_* and best_guess looks
                               like clean hours text (no manual review).
"""

import json
import re
import sys
import textwrap
from pathlib import Path

RESULTS_JSON = "lns_hours_results.json"
APPROVED_JSON = "lns_hours_approved.json"

# Heuristic: does this string look like clean hours text?
LOOKS_LIKE_HOURS = re.compile(
    r'(?:mon|tue|wed|thu|fri|sat|sun|open|closed|am|pm|:\d{2})',
    re.IGNORECASE,
)

def looks_confident(text: str) -> bool:
    return bool(LOOKS_LIKE_HOURS.search(text)) and len(text) < 200


def load_results() -> list[dict]:
    with open(RESULTS_JSON) as f:
        return json.load(f)


def load_approved() -> dict:
    if Path(APPROVED_JSON).exists():
        with open(APPROVED_JSON) as f:
            return {r["shop_name"]: r for r in json.load(f)}
    return {}


def save_approved(approved: dict):
    with open(APPROVED_JSON, "w") as f:
        json.dump(list(approved.values()), f, indent=2)


def review():
    auto_approve = "--auto-approve-confident" in sys.argv
    results  = load_results()
    approved = load_approved()

    found = [r for r in results if r["status"] in ("found_homepage", "found_subpage")]
    not_found    = [r for r in results if r["status"] == "not_found"]
    unreachable  = [r for r in results if r["status"] == "unreachable"]
    no_url       = [r for r in results if r["status"] == "no_url"]

    print(f"\n── Scrape Results ──────────────────────────────")
    print(f"  Hours found  : {len(found)}")
    print(f"  Not found    : {len(not_found)}")
    print(f"  Unreachable  : {len(unreachable)}")
    print(f"  No URL       : {len(no_url)}")
    print(f"  Already reviewed: {len(approved)}")

    to_review = [r for r in found if r["shop_name"] not in approved]
    print(f"\n  Pending review: {len(to_review)}")

    if not to_review:
        print("\nAll found results already reviewed.")
        _print_final_stats(approved)
        return

    print("\nFor each result, press:")
    print("  [Enter]    Accept best_guess as-is")
    print("  [e]        Edit the hours text manually")
    print("  [s]        Skip (do not write this one)")
    print("  [a]        All remaining — accept all confident ones automatically")
    print("  [q]        Quit and save progress\n")

    auto_rest = False

    for i, r in enumerate(to_review, 1):
        if auto_rest or (auto_approve and looks_confident(r["best_guess"] or "")):
            if looks_confident(r["best_guess"] or ""):
                r["approved_hours"] = r["best_guess"]
                r["review_status"] = "auto_approved"
                approved[r["shop_name"]] = r
                continue

        print(f"── [{i}/{len(to_review)}] {r['shop_name']} · {r['city']}, {r['state']}")
        print(f"   Source : {r['source_page']}")
        print(f"   Status : {r['status']}")
        print()

        for j, h in enumerate(r["hours_found"], 1):
            print(f"   [{j}] {textwrap.shorten(h, 120)}")
        print()
        print(f"   Best guess → {r['best_guess']}")
        print()

        choice = input("   Action [Enter/e/s/a/q]: ").strip().lower()

        if choice == "q":
            save_approved(approved)
            print(f"\nProgress saved. {len(approved)} reviews saved.")
            return
        elif choice == "a":
            auto_rest = True
            r["approved_hours"] = r["best_guess"]
            r["review_status"] = "approved"
        elif choice == "e":
            new_text = input("   Enter corrected hours: ").strip()
            r["approved_hours"] = new_text if new_text else r["best_guess"]
            r["review_status"] = "edited"
        elif choice == "s":
            r["review_status"] = "skipped"
            approved[r["shop_name"]] = r
            print()
            continue
        else:
            r["approved_hours"] = r["best_guess"]
            r["review_status"] = "approved"

        approved[r["shop_name"]] = r
        save_approved(approved)
        print()

    save_approved(approved)
    _print_final_stats(approved)


def _print_final_stats(approved: dict):
    statuses = {}
    for r in approved.values():
        s = r.get("review_status", "unknown")
        statuses[s] = statuses.get(s, 0) + 1
    print("\n── Review Summary ──")
    for k, v in sorted(statuses.items(), key=lambda x: -x[1]):
        print(f"  {k}: {v}")
    ready = sum(1 for r in approved.values() if r.get("approved_hours"))
    print(f"\n  Ready to write back: {ready} shops")
    print(f"\nNext step: python write_hours.py")


if __name__ == "__main__":
    review()
