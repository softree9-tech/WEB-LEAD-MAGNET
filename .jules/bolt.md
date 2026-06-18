## 2025-05-22 - [Parallelized I/O and Connection Pooling]
**Learning:** Sequential execution of heavy I/O tasks (like link checking) alongside browser automation (Playwright) creates a cumulative latency bottleneck. Additionally, repeated BeautifulSoup parsing of large HTML documents adds unnecessary CPU overhead (~100ms per parse).
**Action:** Offload I/O-bound tasks to a background thread pool concurrent with Playwright screenshots, implement connection pooling with `requests.Session` for batch network requests, and share a single pre-parsed `soup` instance across all analysis helpers.
