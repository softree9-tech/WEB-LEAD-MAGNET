## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Dual-Stack and Redirect SSRF Bypasses
**Vulnerability:** SSRF via IPv4/IPv6 dual-stack hostnames and multi-hop HTTP redirects.
**Learning:** Even if the primary IP (IPv4) is safe, a hostname might resolve to an internal IPv6 address which `socket.gethostbyname` ignores. Additionally, `requests` following redirects automatically can bypass initial URL validation if a public URL redirects to an internal one.
**Prevention:** Use `socket.getaddrinfo` to resolve and validate ALL IP addresses associated with a host. Use a custom `safe_request` helper that disables automatic redirects and manually validates every 'Location' hop against the security policy before proceeding.
