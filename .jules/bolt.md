## 2026-06-05 - DOM Parsing Consolidation
**Learning:** Redundant BeautifulSoup parsing was adding ~0.7s - 0.9s of overhead per lead analysis. By parsing once and passing the object to helpers like count_broken_links, we significantly reduce CPU cycles.
**Action:** Always check if a DOM object can be passed to downstream analysis functions instead of re-parsing the HTML string.
