## 2025-05-15 - [Consolidated BeautifulSoup Parsing]
**Learning:** In the `website_analyzer_agent`, the HTML was being parsed into a `BeautifulSoup` object multiple times (once in the main agent and once in `count_broken_links`). For large pages, this is a significant CPU and memory bottleneck. Reusing a single `BeautifulSoup` instance across all downstream functions improved efficiency.
**Action:** Always check if a DOM tree can be shared across multiple analysis functions instead of re-parsing raw HTML.

## 2025-05-15 - [Security Utility Caching]
**Learning:** High-frequency calls to `is_safe_url` during broken link analysis (up to 50 links) resulted in redundant CPU and potential I/O overhead. Since many links share hostnames or domains, caching the results of safety checks provides a measurable speed boost.
**Action:** Implement LRU caching for stateless security validation functions that are called in loops.
