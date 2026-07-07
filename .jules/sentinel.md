## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Path Traversal in Report Endpoints
**Vulnerability:** Path traversal in `/api/reports/view/`, `/api/reports/download/`, and `/api/leads/download/` endpoints allowed reading/deleting arbitrary files via `../` payloads.
**Learning:** Relying on FastAPI's path parameter validation or database-stored paths is insufficient when those values are joined with local file system paths. Even database-sourced filenames should be treated as untrusted if they were originally derived from user input or external sources.
**Prevention:** Always apply `os.path.basename()` to any filename variable before using it in `os.path.join()` to ensure the resulting path remains within the intended directory.
