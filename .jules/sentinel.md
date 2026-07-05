## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Path Traversal in File Serving Endpoints
**Vulnerability:** Path traversal in `/api/reports/view/`, `/api/reports/download/`, and lead-related PDF endpoints allowing access to arbitrary files on the server.
**Learning:** Directly joining user-supplied strings or even database fields with a local base directory without sanitization creates directory escape risks. On Linux, `os.path.join` with a component starting with `/` or containing `../` can reset the path or go up levels.
**Prevention:** Always wrap filenames in `os.path.basename()` to strip directory components and restrict file access to a single flat directory. Combine with `os.path.exists()` checks for robust handling.
