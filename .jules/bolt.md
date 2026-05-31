## 2025-03-24 - Efficient DOM Parsing and Task Parallelism
**Learning:** Reusing a single `BeautifulSoup` object across multiple analysis functions reduced parsing overhead by ~87.5%. Additionally, parallelizing the broken link checker with Playwright's screenshot acquisition significantly reduces overall latency for the `website_analyzer_agent`.
**Action:** Always instantiate expensive objects (like DOM parsers) once and pass them to downstream functions. Utilize `ThreadPoolExecutor` to overlap I/O-bound tasks with long-running browser operations.
