## 2025-05-22 - BeautifulSoup Parsing Optimization
**Learning:** Redundant HTML parsing into BeautifulSoup objects is a significant CPU bottleneck in multi-stage website analysis. Reusing a single BeautifulSoup object across helper functions reduced parsing overhead by ~87.5% per execution.
**Action:** Always initialize DOM parsers (like BeautifulSoup) once at the start of a processing pipeline and share the object with downstream analysis functions.

## 2025-05-22 - DNS Caching for SSRF Checks
**Learning:** Repeated hostname resolution in security validation functions (like `is_safe_url`) adds significant latency during link-heavy operations (e.g., broken link checking).
**Action:** Use `@lru_cache` on safety validation functions that perform network-level checks (like DNS resolution) to avoid redundant overhead for the same hostnames.
