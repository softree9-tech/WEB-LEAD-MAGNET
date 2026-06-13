# Bolt's Journal - Critical Learnings Only

## 2025-05-15 - Redundant BeautifulSoup Parsing
**Learning:** Redundant BeautifulSoup parsing is a significant bottleneck. Re-using `soup` objects across sub-checkers in `agents/website_analyzer.py` reduces parsing latency by ~87% for typical 1k-element HTML pages.
**Action:** Always pass the existing `soup` object to helper functions instead of re-parsing the HTML string.

## 2025-05-15 - DOM Traversal vs Parsing
**Learning:** Reusing results from a combined check (like `check_conversion_elements`) instead of re-searching the DOM with `find_all` for individual elements provides only a negligible (~0.7%) speedup. The primary bottleneck is the initial parse and network I/O.
**Action:** Prioritize optimizing network I/O (DNS, connection pooling) and reducing parsing frequency over micro-optimizing DOM traversals within an already parsed object.
