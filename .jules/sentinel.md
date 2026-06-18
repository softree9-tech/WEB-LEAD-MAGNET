## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-22 - Multi-stack SSRF Protection (IPv6/Mapped IPs)
**Vulnerability:** SSRF bypass via IPv6 or IPv4-mapped IPv6 addresses.
**Learning:** `socket.gethostbyname` only resolves IPv4 addresses. On dual-stack systems, an attacker can use a hostname that resolves to both a safe IPv4 and a malicious IPv6 (or vice versa), or use IPv4-mapped IPv6 addresses (e.g., `::ffff:127.0.0.1`) to bypass filters that only check IPv4.
**Prevention:** Use `socket.getaddrinfo` to resolve all associated IP addresses for a hostname. Iterate through every result and validate each against forbidden ranges. Explicitly check for and normalize IPv4-mapped IPv6 addresses (`ip.ipv4_mapped` in `ipaddress` library) before validation.
