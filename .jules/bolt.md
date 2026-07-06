## 2026-07-06 - [Optimized BeautifulSoup usage and HTML processing]
**Learning:** Repeatedly parsing the same HTML with BeautifulSoup and calling `.lower()` on large HTML strings in a loop (or multiple times per lead) is a significant CPU bottleneck. Connection pooling with `requests.Session` also improves performance when checking multiple external links.
**Action:** Reuse a single BeautifulSoup instance and pre-compute normalized (lowercased) HTML strings for all analysis sub-functions. Use `requests.Session` with a configured `HTTPAdapter` for parallel I/O tasks like broken link checking.
