## 2025-05-15 - [SSRF Protection with IP Validation]
**Vulnerability:** Server-Side Request Forgery (SSRF) via user-provided website URLs and discovered broken links.
**Learning:** Initial URL validation in `is_safe_url` resolving hostnames to IPs is a good first step but vulnerable to DNS rebinding (TOCTOU) because the subsequent HTTP request might re-resolve the hostname to a different (malicious) IP.
**Prevention:** Implement `is_safe_url` to validate against private/local IP ranges and ensure it's used at all ingress points. For high-security environments, pin the request to the validated IP to prevent DNS rebinding.
