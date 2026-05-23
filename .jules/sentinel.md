## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Dual-Stack SSRF Bypass via gethostbyname
**Vulnerability:** Server-Side Request Forgery (SSRF) bypasses in environments supporting IPv6 or hostnames with multiple A/AAAA records.
**Learning:** `socket.gethostbyname` only returns a single IPv4 address, ignoring IPv6 addresses (like `::1`) and other potential IPs associated with a hostname. An attacker can provide a hostname that resolves to both a public IP (to pass a naive check) and a private IP, or use IPv6 literals if they aren't explicitly handled.
**Prevention:** Use `socket.getaddrinfo` to resolve all potential IP addresses for a hostname and validate every single one against forbidden ranges before allowing the request.
