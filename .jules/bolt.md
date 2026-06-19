## 2025-05-15 - [Bottleneck] Redundant HTML Parsing
**Learning:** Initializing `BeautifulSoup` multiple times for the same HTML document in a pipeline (e.g., tech stack check, SEO check, accessibility check) is a major CPU bottleneck. Parsing a medium-sized page takes ~110-120ms, while the actual CSS/tag lookups take <10ms.
**Action:** Always parse HTML once at the entry point of the analyzer and pass the `soup` object to all sub-checkers.

## 2025-05-15 - [Optimization] Connection Pooling for Link Checking
**Learning:** Validating dozens of links on a single domain without connection pooling leads to significant overhead from repeated TCP/TLS handshakes.
**Action:** Use `requests.Session()` with an `HTTPAdapter` and `pool_maxsize` matching the concurrency level to reuse connections.

## 2025-05-15 - [Verification] Isolated Frontend Component Testing
**Learning:** When the full backend is unavailable or complex to set up, verifying frontend optimizations (like `React.useMemo`) can be done by injecting a temporary test route with mock data into `App.jsx` and using Playwright.
**Action:** Remember to clean up these temporary routes and mock data before submission.
