## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Dual-Stack SSRF Protection
**Vulnerability:** Hostnames resolving to multiple IP addresses (IPv4 and IPv6) could bypass SSRF checks if only the first resolved address is validated.
**Learning:** `socket.gethostbyname()` only returns a single IPv4 address. An attacker can configure a hostname with a public IPv4 address and a private IPv6 address (or vice-versa) to bypass simple checks.
**Prevention:** Use `socket.getaddrinfo()` to retrieve *all* associated IP addresses for a hostname and validate every single one against restricted ranges before allowing the request.
