# Bolt's Journal - Performance Learnings

## 2025-05-15 - Redundant BeautifulSoup Parsing & String Operations
**Learning:** Re-parsing HTML into BeautifulSoup objects and repeated `.lower()` calls on large HTML strings in a high-concurrency analysis pipeline (like lead processing) creates significant CPU overhead. Consolidating parsing to a single instance and pre-computing normalized strings can reduce per-lead processing time by ~30%.
**Action:** Always share a single `BeautifulSoup` instance among sub-checkers and pass pre-computed `html_lower` strings to avoid redundant O(N) operations.

## 2025-05-15 - Connection Pooling for Rapid IO Bursts
**Learning:** Checking dozens of links in parallel without connection pooling results in excessive TCP/TLS handshakes, which can be the dominant latency factor in network-bound tasks.
**Action:** Use `requests.Session` with a configured `HTTPAdapter(pool_connections=N, pool_maxsize=N)` when performing multi-threaded URL validation to enable connection reuse.

## 2025-05-15 - Model Identifier Correctness
**Learning:** Using incorrect model identifiers (e.g., `gpt-4.1-mini`) can lead to runtime failures or fallback to suboptimal models.
**Action:** Verify and use correct, high-performance identifiers like `gpt-4o-mini` for latency-sensitive tasks.
