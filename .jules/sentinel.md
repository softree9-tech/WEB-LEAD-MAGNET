## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Dual-Stack SSRF Bypass Mitigation
**Vulnerability:** Hostnames resolving to multiple IP addresses (IPv4 and IPv6) could bypass SSRF checks if only the first resolved address (usually IPv4) was validated.
**Learning:** `socket.gethostbyname` only returns one IPv4 address. If a hostname resolves to a public IPv4 but also a private IPv6 (or vice versa), an attacker could potentially reach internal services.
**Prevention:** Use `socket.getaddrinfo` to resolve and validate ALL associated IP addresses for a hostname. If any address is private, loopback, or reserved, the entire URL must be rejected.
