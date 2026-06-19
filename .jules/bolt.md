## 2025-05-22 - BeautifulSoup Parsing Optimization
**Learning:** Redundant parsing of the same HTML into BeautifulSoup objects in a multi-step analysis pipeline creates significant CPU overhead. Measured benchmark showed that reusing a pre-parsed soup object is ~97% faster than re-parsing for each specialized check.
**Action:** Always parse HTML once at the entry point of an agent and pass the soup object to downstream specialized analysis functions.
