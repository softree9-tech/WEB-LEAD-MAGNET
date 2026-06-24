## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Path Traversal Protection for Dynamic File Access
**Vulnerability:** Path traversal via unsanitized filename parameters in report viewing, downloading, and bulk-deletion endpoints.
**Learning:** Even when files are stored in a dedicated directory (e.g., `data/pdfs`), using `os.path.join` with raw user input allows attackers to escape the intended directory using `../` sequences and access or delete sensitive system files.
**Prevention:** Always sanitize filenames using `os.path.basename()` before joining them with a base directory. Additionally, wrap filenames in double quotes within the `Content-Disposition` header to prevent header injection or parsing issues with special characters.
