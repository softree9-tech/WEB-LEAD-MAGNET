## 2025-05-15 - Optimize Website Analyzer performance

**Learning:** Playwright browser instances are resource-intensive. Keeping them open while performing CPU-bound DOM analysis (BeautifulSoup) or network-bound checks (broken links) significantly increases memory pressure and latency. Redundant DOM parsing with BeautifulSoup also adds unnecessary overhead.

**Action:** Always capture all required data from the browser (HTML, screenshots) and close the browser immediately before performing subsequent analysis. Pass pre-parsed BeautifulSoup objects to analysis functions instead of raw HTML strings to avoid redundant parsing. Ensure variables extracted within the browser block are checked for existence (using `locals()`) if moved to a path that follows an optional success block, preventing `UnboundLocalError`.
