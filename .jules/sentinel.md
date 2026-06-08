## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Redirect-Based SSRF and Multi-IP Validation
**Vulnerability:** Redirect-based SSRF bypass where initial URL is safe but redirects to a private IP/hostname. Also, `socket.gethostbyname` only returns one IPv4 address, missing IPv6 or other resolved IPs that might be malicious.
**Learning:** Security validation must be applied to every hop in a redirect chain. Centralizing request logic in a `safe_request` wrapper ensures that manual redirect handling and `is_safe_url` validation are consistently applied. Using `socket.getaddrinfo` is necessary to validate all resolved IP addresses, including IPv4-mapped IPv6.
**Prevention:** Use a `safe_request` helper that disables automatic redirects and manually validates each hop's URL before following. Validate all IPs returned by `getaddrinfo`.
