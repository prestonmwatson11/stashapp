# LNS Hours Scraping Kit

Three-stage pipeline to fill in "Hours of Operation" for the
US Local Needlepoint Shop directory.

---

## Quick Start

```bash
cd /home/claude/lns_scraper

# Stage 1 — Scrape all shop websites
python scrape_hours.py

# Stage 2 — Review results (interactive) 
python review_hours.py
# OR auto-approve everything that looks like clean hours text:
python review_hours.py --auto-approve-confident

# Stage 3 — Write approved hours back to the workbook
python write_hours.py
# Preview without saving:
python write_hours.py --dry-run
```

---

## Files

| File | Purpose |
|------|---------|
| `scrape_hours.py`  | Fetches each shop's homepage + contact/about sub-pages; extracts hours text via schema.org, CSS class detection, and regex |
| `review_hours.py`  | Interactive terminal review of scraped results; lets you approve, edit, or skip each one |
| `write_hours.py`   | Writes approved hours into the Excel workbook; marks new cells in light green |
| `lns_hours_results.json`  | *(generated)* Raw scrape output — one record per shop |
| `lns_hours_approved.json` | *(generated)* Reviewed results ready to write back |

---

## How the Scraper Works

For each shop with a website URL and no existing hours:

1. **Fetch homepage** — look for:
   - `<meta itemprop="openingHours">` (schema.org structured data)
   - Elements with class/id matching `hour`, `schedule`, `open`, `contact`
   - Regex patterns for day names, time ranges, "open/closed" phrases

2. **If not found on homepage** — find sub-pages whose link text or href
   contains: `contact`, `hours`, `visit`, `about`, `location`, `find-us`, etc.
   Fetch up to 4 sub-pages and repeat extraction.

3. **Save result** with status:
   - `found_homepage` — hours found on landing page
   - `found_subpage`  — hours found on a contact/about page
   - `not_found`      — site reachable but no hours detected
   - `unreachable`    — site timed out, 4xx/5xx, or non-HTML response
   - `no_url`         — shop has no website URL in the directory

---

## Resuming a Scrape

The scraper saves to `lns_hours_results.json` after each shop.
If interrupted, just re-run — it skips already-processed shops.

---

## Expected Results

Based on the directory's 218 shops with URLs, typical hit rates:

| Outcome | Expected |
|---------|---------|
| Hours found | ~45–55% (100–120 shops) |
| Not found (site up, no hours listed) | ~25–30% |
| Unreachable / broken URLs | ~15–20% |

Remaining gaps after scraping → use Google Places API
(`google_places_enrichment.py` — see next step).

---

## After Running

Newly written hours cells are highlighted light green in the
workbook for easy spot-checking. The original data is untouched
for any shop where hours weren't approved.
