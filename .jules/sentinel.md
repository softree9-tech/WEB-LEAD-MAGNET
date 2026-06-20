## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.
## 2026-06-20 - [CRITICAL] Fix Path Traversal in Report Endpoints
**Vulnerability:** Path traversal in report viewing and downloading endpoints.
**Learning:** Endpoints using `os.path.join` with user-controlled filenames allowed arbitrary file access outside the intended directory.
**Prevention:** Always sanitize filenames using `os.path.basename()` before constructing file paths to ensure only files within the target directory are accessed.
