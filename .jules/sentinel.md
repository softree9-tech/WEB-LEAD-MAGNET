## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Multi-IP SSRF Bypass via socket.gethostbyname
**Vulnerability:** SSRF protection bypass where a hostname resolves to multiple IP addresses (e.g., both a public and a private IP, or dual-stack IPv4/IPv6).
**Learning:** `socket.gethostbyname` only returns the first IPv4 address it finds. If an attacker controls a DNS entry that returns a safe IPv4 address first but also includes unsafe IPv6 or secondary IPv4 addresses, a simple check of the first result is insufficient.
**Prevention:** Use `socket.getaddrinfo` to resolve all associated IP addresses for a hostname and validate every single one against forbidden ranges before allowing the request.
