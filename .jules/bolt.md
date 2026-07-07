# Bolt's Performance Journal

## 2025-05-23 - Redundant BeautifulSoup Parsing and HTML Normalization
**Learning:** In `agents/website_analyzer.py`, multiple helper functions independently parse the same HTML string using `BeautifulSoup` or perform expensive `str(soup).lower()` conversions. For a large B2B website, this can add hundreds of milliseconds of CPU time per lead.
**Action:** Refactor the helper functions to accept a pre-computed `soup` object and `html_lower` string, and initialize these once in the main agent loop.

## 2025-05-23 - Performance Optimization Results
**Insight:** Reusing the `BeautifulSoup` instance and pre-computing `html_lower` in `agents/website_analyzer.py` resulted in a measured ~50% speed improvement on large sample HTML documents during verification.
**Action:** Always prefer passing pre-parsed DOM objects to sub-checkers rather than re-parsing HTML strings.
