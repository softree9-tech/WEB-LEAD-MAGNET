## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2026-06-07 - Dual-Stack SSRF and Information Leakage
**Vulnerability:** Incomplete SSRF protection only checking IPv4, hardcoded admin bypass tokens, and internal information leakage via raw exception strings.
**Learning:** Checking only one IP address (typically IPv4 via `gethostbyname`) is insufficient for dual-stack hosts. Attackers can use IPv6 loopback or local addresses if the server supports IPv6. Additionally, hardcoded tokens and leaking raw exceptions provide attackers with easy bypasses and system insights.
**Prevention:** Use `socket.getaddrinfo` to resolve all associated IP addresses (both IPv4 and IPv6) and validate every one of them. Use environment variables for all bypass tokens or secrets, and mask internal exceptions in API responses.
