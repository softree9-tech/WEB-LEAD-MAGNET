# Sentinel's Journal - Critical Security Learnings

## YYYY-MM-DD - [Title]
**Vulnerability:** [What you found]
**Learning:** [Why it existed]
**Prevention:** [How to avoid next time]

## 2026-06-04 - SSRF Bypass via Redirects and Dual-Stack Hostnames
**Vulnerability:** SSRF bypasses via unvalidated HTTP redirects and incomplete hostname resolution (only checking a single IP).
**Learning:** Standard library functions like `socket.gethostbyname` may only return a single IPv4 address, missing associated IPv6 addresses that could point to internal resources. Furthermore, `requests` with `allow_redirects=True` follows redirects automatically without re-validating the security of the new target URL.
**Prevention:** Use `socket.getaddrinfo` to resolve and validate all associated IP addresses (IPv4 and IPv6). For HTTP requests, always set `allow_redirects=False` and implement a manual redirect loop that validates each new `Location` header against the safety filter before proceeding.

## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.
