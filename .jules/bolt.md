## 2025-05-15 - [Efficient HTML Processing]
**Learning:** Redundant BeautifulSoup parsing and .lower() calls on large HTML strings significantly impact per-lead processing time in CPU-bound analysis agents.
**Action:** Always pre-compute html_lower and reuse a single BeautifulSoup instance across all analysis sub-functions to eliminate redundant overhead.
