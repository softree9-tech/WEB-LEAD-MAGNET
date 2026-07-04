## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2026-07-04 - Path Traversal Mitigation in Static File Serving
**Vulnerability:** Path traversal in report viewing and download endpoints via unsanitized filename parameters.
**Learning:** Using `os.path.join` with user-provided strings is dangerous even if the base directory is hardcoded. On Linux, `os.path.basename()` effectively neutralizes forward-slash based traversal, but behaves differently with backslashes (treating them as literal characters).
**Prevention:** Always wrap user-supplied filenames in `os.path.basename()` before joining them to a path. For maximum security, validate that the resulting path is still within the intended directory using `os.path.abspath` and `os.path.commonpath`.
