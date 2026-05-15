# Bolt's Journal - Critical Learnings Only

## 2025-05-15 - Initializing Bolt's Journal
**Learning:** Performance-obsessed agent "Bolt" is ready to optimize the Softree Lead Engine.
**Action:** Always measure first, optimize second.

## 2025-05-15 - Optimizing Playwright Lifecycle & DOM Parsing
**Learning:** Holding a Playwright browser open during network-bound tasks (like checking 50 broken links) and CPU-bound tasks (like heavy DOM parsing) is extremely inefficient on resource-constrained environments (512MB RAM). Reordering the agent logic to "Capture & Close" immediately freed up significant RAM ~5-10 seconds earlier per request. Additionally, re-parsing HTML into BeautifulSoup in child functions is a silent performance killer.
**Action:** Always decouple data acquisition (Browser) from data analysis (BS4/Python). Pass the `soup` object instead of the `html` string to avoid redundant parsing.
