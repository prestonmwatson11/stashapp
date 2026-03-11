"""
LNS Combined Writer
Reads lns_combined_approved.json (exported from the browser editor)
and writes both hours AND phone numbers into the master Excel workbook.

Usage:
    python3 write_combined.py
    python3 write_combined.py --dry-run
"""

import json
import sys
from pathlib import Path
import openpyxl
from openpyxl.styles import PatternFill

WORKBOOK_PATH  = "US_Local_Needlepoint_Shops_Directory.xlsx"
COMBINED_JSON  = "lns_combined_approved.json"
HEADER_ROW     = 3
DATA_START     = 4

NEW_FILL = PatternFill(start_color="E6F4EA", end_color="E6F4EA", fill_type="solid")


def main():
    dry_run = "--dry-run" in sys.argv

    if not Path(COMBINED_JSON).exists():
        print(f"ERROR: {COMBINED_JSON} not found.")
        print("Export it from the browser editor (lns_editor.html) first.")
        return

    with open(COMBINED_JSON) as f:
        data = json.load(f)

    approved = {
        r["shop_name"]: r
        for r in data
        if r.get("hours_value") or r.get("phone_value")
    }
    print(f"Shops with data to write: {len(approved)}")

    wb = openpyxl.load_workbook(WORKBOOK_PATH)
    ws = wb["Master Dataset"]

    headers  = [c.value for c in ws[HEADER_ROW]]
    col_idx  = {h: i + 1 for i, h in enumerate(headers) if h}
    name_col  = col_idx["Shop Name"]
    hours_col = col_idx["Hours of Operation"]
    phone_col = col_idx["Phone Number"]

    hours_written = 0
    phone_written = 0

    for row in ws.iter_rows(min_row=DATA_START):
        name = row[name_col - 1].value
        if not name or str(name).startswith("  "):
            continue
        if name not in approved:
            continue

        entry = approved[name]

        if entry.get("hours_value"):
            cell = row[hours_col - 1]
            if not cell.value:  # don't overwrite existing data
                if dry_run:
                    print(f"  [HOURS] {name} → {entry['hours_value']}")
                else:
                    cell.value = entry["hours_value"]
                    cell.fill  = NEW_FILL
                hours_written += 1

        if entry.get("phone_value"):
            cell = row[phone_col - 1]
            if not cell.value:
                if dry_run:
                    print(f"  [PHONE] {name} → {entry['phone_value']}")
                else:
                    cell.value = entry["phone_value"]
                    cell.fill  = NEW_FILL
                phone_written += 1

    if not dry_run:
        wb.save(WORKBOOK_PATH)
        print(f"\n✓ Workbook updated.")
        print(f"  Hours written : {hours_written}")
        print(f"  Phones written: {phone_written}")
        print(f"  Saved → {WORKBOOK_PATH}")
    else:
        print(f"\n[DRY RUN] Would write {hours_written} hours, {phone_written} phones.")


if __name__ == "__main__":
    main()
