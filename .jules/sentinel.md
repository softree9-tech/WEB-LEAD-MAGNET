## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-07-02 - Defense in Depth: SSRF Redirects and Path Traversal
**Vulnerability:** Multiple critical gaps including SSRF via redirect chains, path traversal in report endpoints, and information disclosure in error responses.
**Learning:** Security is not a single check. SSRF protection must account for redirects (each hop must be validated) and dual-stack bypasses (IPv6 mapped addresses). Path traversal risks are high when joining user-supplied filenames with server paths.
**Prevention:** Use `os.path.basename()` to sanitize all file-related inputs. Implement a wrapper around `requests` that manually follows and validates redirects hop-by-hop. Resolve all IP addresses (A and AAAA records) via `getaddrinfo` to ensure comprehensive range validation. Avoid returning `str(e)` to users.
