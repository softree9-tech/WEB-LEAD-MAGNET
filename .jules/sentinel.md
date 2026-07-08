## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2026-06-22 - Path Traversal in Report Endpoints
**Vulnerability:** Path traversal via user-supplied filenames in report viewing and download endpoints.
**Learning:** Joining user input directly into file paths, even when prefixed with a directory, allows attackers to escape the intended directory using `../` sequences.
**Prevention:** Always sanitize user-supplied filenames using `os.path.basename()` before joining them with a base directory. This ensures the resulting path stays within the intended folder.
