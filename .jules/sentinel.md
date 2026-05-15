## 2025-05-14 - [SSRF and Information Leakage Prevention]
**Vulnerability:** Server-Side Request Forgery (SSRF) via unvalidated user-provided URLs and Information Leakage via raw exception details in API responses.
**Learning:** The application used Playwright and `requests` to visit user-provided URLs without checking if they pointed to internal, loopback, or reserved IP addresses. Additionally, some endpoints returned `str(e)` on failure, potentially exposing system internals.
**Prevention:** Implement a robust `is_safe_url` utility that resolves hostnames and verifies that the resulting IP addresses are not in private or reserved ranges using the `ipaddress` library. Always return generic error messages to the client and log specific error details to the server console.
