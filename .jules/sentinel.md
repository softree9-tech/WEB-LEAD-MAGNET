## 2025-05-15 - SSRF Protection and Information Leakage Prevention
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-supplied URLs and potential information leakage through raw exception details in API responses.
**Learning:** An application that analyzes external websites is highly susceptible to SSRF if URLs are not strictly validated against internal/private IP ranges. Additionally, returning `str(e)` in `HTTPException` can expose sensitive internal path details or configuration errors.
**Prevention:** Implement a central `is_safe_url` utility that resolves hostnames to IPs and validates them against private/reserved ranges before any request is made. Always return generic error messages to clients while logging detailed errors to the server console.
