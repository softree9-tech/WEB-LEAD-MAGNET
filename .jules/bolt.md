# Bolt's Journal - Performance Insights

## 2025-05-15 - [DOM Parsing & Parallelization]
**Learning:** Re-parsing the same HTML into multiple BeautifulSoup objects is a significant CPU bottleneck. Reusing a single object improved performance by ~95% for DOM-based tasks. Additionally, parallelizing link checking with the screenshot process significantly reduces wall-clock time.
**Action:** Always parse HTML once and pass the pre-parsed object to downstream analysis functions. Use background executors for I/O-bound tasks that don't depend on the browser state.

## 2025-05-15 - [Browser Resource Optimization]
**Learning:** Playwright browser instances are resource-intensive. Using memory-efficient flags like `--disable-dev-shm-usage` and `--memory-pressure-off` helps stability in constrained environments.
**Action:** Use optimized browser launch arguments in production/containerized environments.
