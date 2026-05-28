# Bolt's Journal - Critical Learnings Only

## 2025-05-14 - Initial Setup
**Learning:** Bolt is here to make things fast.
**Action:** Always measure before and after.

## 2025-05-14 - DOM Reuse and Security Caching
**Learning:** Reusing the `BeautifulSoup` object for multiple DOM-based analysis tasks (broken links, CTA detection, etc.) yielded a ~77% performance improvement in local benchmarks. Additionally, caching URL safety checks avoids redundant regex/IP parsing for the same domain.
**Action:** Always check for opportunities to pass parsed DOM objects to sub-functions rather than re-parsing HTML strings.
