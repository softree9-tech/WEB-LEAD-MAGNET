## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2026-07-01 - Path Traversal & Information Disclosure
**Vulnerability:** Path traversal in file serving endpoints and information disclosure via raw exception strings in error responses.
**Learning:** Even when filenames are stored in a database, they should be treated as untrusted if they can be manipulated or if the database can be influenced by external input. Raw exception strings (`str(e)`) frequently leak internal path structures and implementation details.
**Prevention:** Use `os.path.basename()` to sanitize all file-related inputs before path joining. Implement generic error messages for all production-facing 500 errors to prevent leaking stack traces or internal logic.
