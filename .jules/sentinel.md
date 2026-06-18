## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-23 - Dual-Stack SSRF Bypass via IPv6
**Vulnerability:** `socket.gethostbyname` only resolves IPv4 addresses. On dual-stack systems, an attacker can bypass SSRF filters by providing an IPv6 address (e.g., `[::1]`) or an IPv4-mapped IPv6 address (e.g., `::ffff:127.0.0.1`) which `gethostbyname` fails to resolve or ignores.
**Learning:** Modern SSRF protection must account for the entire IP address space (IPv4 and IPv6) and normalization of mapped addresses.
**Prevention:** Use `socket.getaddrinfo` to retrieve all associated IP addresses for a hostname and validate each one against private/reserved ranges for both address families.
