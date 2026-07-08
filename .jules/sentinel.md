## 2025-05-14 - SSRF Protection with IP Validation
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided URLs in website analysis and lead processing endpoints.
**Learning:** Standard URL validation that only checks for the presence of a protocol or basic hostname patterns is insufficient. Attackers can use decimal IP representations, custom hostnames pointing to internal IPs, or IPv6 loopback addresses to bypass simple blacklists.
**Prevention:** Implement a robust validation function that resolves hostnames to IP addresses and checks them against private, loopback, and reserved ranges (RFC 1918, etc.). Note: Standard `socket.gethostbyname` resolution followed by a request is still technically vulnerable to DNS rebinding (TOCTOU) if the TTL is low; for high-security environments, the resolved IP should be pinned for the actual request.

## 2025-05-15 - Path Traversal Mitigation in Report Endpoints
**Vulnerability:** Path traversal in endpoints serving PDF reports, allowing access to arbitrary files on the server using '..' sequences.
**Learning:** Even when files are stored in a dedicated directory, using unsanitized user input (or database fields derived from user input) in file path construction is dangerous.
**Prevention:** Always wrap user-supplied filenames in 'os.path.basename()' before joining them with a directory path. This ensures that only the filename itself is used, neutralizing any directory traversal attempts.
