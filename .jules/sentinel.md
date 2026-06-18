## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2026-06-11 - SSRF via Redirects
**Vulnerability:** Server-Side Request Forgery (SSRF) via HTTP redirects. Initial URL validation can be bypassed if the server follows redirects to internal or private IP addresses without re-validating the destination.
**Learning:** Even with robust initial IP validation, an application remains vulnerable to SSRF if it automatically follows redirects. Attackers can provide a safe-looking URL that redirects to a sensitive internal resource (e.g., `169.254.169.254` on AWS).
**Prevention:** Disable automatic redirect following in HTTP libraries (e.g., `allow_redirects=False` in `requests`). Implement a custom redirect handler that manually follows each hop and re-validates every destination URL/IP against a security policy before the next request is made.
