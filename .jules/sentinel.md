## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Hardened SSRF with Multi-Stack Resolution
**Vulnerability:** SSRF bypass via dual-stack hostnames (resolving to both public and private IPs) or IPv6 literals.
**Learning:** Using `socket.gethostbyname` only resolves to a single IPv4 address, potentially missing private IPv6 addresses or secondary private IPv4 addresses associated with a hostname. Attackers can exploit this by providing a hostname that has multiple A/AAAA records.
**Prevention:** Use `socket.getaddrinfo` to resolve *all* associated IP addresses (IPv4 and IPv6) and validate every single one against forbidden ranges before allowing the request.
