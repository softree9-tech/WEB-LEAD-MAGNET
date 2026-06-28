## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Robust SSRF Protection and Redirect Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) bypasses via IPv4-mapped IPv6 addresses, multi-homed hosts (TOCTOU/partial resolution), and redirect chains.
**Learning:** Simple hostname resolution and standard  with  are vulnerable to various bypasses. A robust solution must resolve all associated IP addresses (v4 and v6) and manually validate each hop in a redirect chain.
**Prevention:** Use `socket.getaddrinfo` to validate all IPs associated with a hostname. Implement a `safe_requests_get` wrapper that sets `allow_redirects=False` and manually validates each `Location` header before following.

## 2025-05-15 - Robust SSRF Protection and Redirect Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) bypasses via IPv4-mapped IPv6 addresses, multi-homed hosts (TOCTOU/partial resolution), and redirect chains.
**Learning:** Simple hostname resolution and standard `requests.get` with `allow_redirects=True` are vulnerable to various bypasses. A robust solution must resolve all associated IP addresses (v4 and v6) and manually validate each hop in a redirect chain.
**Prevention:** Use `socket.getaddrinfo` to validate all IPs associated with a hostname. Implement a `safe_requests_get` wrapper that sets `allow_redirects=False` and manually validates each `Location` header before following.
