## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Comprehensive SSRF Protection and Secret Management
**Vulnerability:** Incomplete SSRF protection ignoring IPv6/dual-stack hostnames and hardcoded security bypass tokens.
**Learning:** `socket.gethostbyname` is insufficient for SSRF protection as it only resolves a single IPv4 address, allowing attackers to bypass checks by providing hostnames that resolve to both a public and a private IP, or by using IPv6/IPv4-mapped addresses. Additionally, hardcoded bypass tokens (like 'admin_bypass') are critical security risks that should be replaced with environment variables.
**Prevention:** Use `socket.getaddrinfo` to resolve and validate ALL IP addresses (IPv4 and IPv6) associated with a hostname. Implement normalization for IPv4-mapped IPv6 addresses. Always use environment variables for security bypasses and ensure they are only active when explicitly configured.
