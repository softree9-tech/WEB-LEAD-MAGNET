## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Dual-Stack SSRF and Redirect Validation
**Vulnerability:** SSRF bypasses via IPv6-mapped IPv4 addresses and internal redirects during website validation.
**Learning:** `socket.gethostbyname` only returns a single IPv4 address, which can be bypassed if a hostname resolves to both a public IPv4 and a private IPv6 address. Additionally, standard `requests.get` with `allow_redirects=True` follows redirects without re-validating the target URL, allowing attackers to redirect the crawler from a safe public URL to an internal one.
**Prevention:** Use `socket.getaddrinfo` to resolve and validate ALL associated IP addresses (IPv4 and IPv6). Manually handle redirects (`allow_redirects=False`) and validate each new `Location` header against the safety check before proceeding.
