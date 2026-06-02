## 2025-05-22 - BeautifulSoup Re-parsing Bottleneck
**Learning:** Initializing 'BeautifulSoup' multiple times for the same HTML content is a major performance bottleneck in the 'website_analyzer_agent'. Additionally, calling individual check functions that re-traverse the DOM after 'check_conversion_elements' has already processed them is redundant.
**Action:** Always initialize 'BeautifulSoup' once at the top of the scraping section and pass the object to downstream functions. Reuse structured data from complex checks (like 'conversion_elements') instead of re-invoking simple check helpers.
