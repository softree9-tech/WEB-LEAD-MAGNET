## 2025-05-15 - [SSRF Protection TOCTOU Risk]
**Vulnerability:** A standard URL validation check that resolves a hostname to an IP is vulnerable to DNS rebinding (TOCTOU).
**Learning:** Checking a URL's safety before a request doesn't guarantee the subsequent request will use the same IP, as the hostname may be re-resolved by the HTTP client.
**Prevention:** In high-security environments, either pinning the resolved IP or using a custom resolver/transport that enforces IP-level filtering during the connection phase is necessary.
