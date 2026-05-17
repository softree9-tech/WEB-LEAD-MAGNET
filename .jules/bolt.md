# Bolt's Journal - Critical Performance Learnings

## 2025-05-14 - Playwright Lifecycle & DOM Parsing Optimization
**Learning:** In memory-constrained environments (like Render's 512MB RAM free tier), keeping a Chromium browser open while performing heavy DOM analysis or network-bound link checks is a major resource bottleneck. Additionally, re-parsing large HTML strings into BeautifulSoup multiple times adds unnecessary CPU overhead.
**Action:** Always capture all required browser assets (HTML, headers, screenshots) immediately and close the browser in a `finally` block before starting analysis. Pass pre-parsed `soup` objects to analysis helper functions to avoid redundant parsing.
