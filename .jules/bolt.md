## 2025-05-15 - [Optimization Pattern: BeautifulSoup & HTML Normalization]
**Learning:** Initializing multiple `BeautifulSoup` instances or repeatedly calling `.lower()` on large HTML strings (often 500KB+) in analysis helpers causes significant CPU spikes and increases per-lead processing time.
**Action:** Initialize a single `BeautifulSoup` instance and a pre-computed `html_lower` string at the start of the analysis pipeline and pass them into all sub-checkers.

## 2025-05-15 - [Resource Management: Browser Lifecycle]
**Learning:** Keeping the Playwright browser context open during LLM execution and secondary API calls (Lighthouse, SSL) wastes RAM and slows down concurrent lead processing.
**Action:** Terminate the browser context immediately after capturing HTML and screenshots. Perform all remaining Python-based analysis and LLM calls after the browser is closed.
