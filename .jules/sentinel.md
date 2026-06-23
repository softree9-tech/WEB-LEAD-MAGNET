## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Path Traversal in File Handling Endpoints
**Vulnerability:** Path Traversal via unsanitized filenames in API endpoints serving or deleting PDF reports.
**Learning:** Using `os.path.join` with raw user input or database fields that can be manipulated (e.g. `../../filename`) allows access to files outside the intended directory.
**Prevention:** Always apply `os.path.basename()` to filenames before joining them with a directory path. Additionally, quote filenames in `Content-Disposition` headers to handle spaces correctly and prevent header injection.
