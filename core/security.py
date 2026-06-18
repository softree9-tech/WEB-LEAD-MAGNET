import socket
from urllib.parse import urlparse
import ipaddress
import requests
import re
from typing import Optional, Any

# ─── Parked / Dead Domain Detection Patterns ────────────────────────────────
_PARKED_PATTERNS = [
    r"this domain is for sale",
    r"domain is parked",
    r"buy this domain",
    r"domain has expired",
    r"this site can.?t be reached",
    r"this webpage is not available",
    r"coming soon",
    r"under construction",
    r"parked by",
    r"domain parking",
    r"godaddy",
    r"sedoparking",
    r"hugedomains",
    r"dan\.com",
    r"afternic",
    r"this page isn.?t working",
    r"default web page",
    r"future home of something",
    r"website is under maintenance",
    r"if you are the owner of this website",
    r"web hosting.*default page",
    r"congratulations.*new hosting",
    r"it works!",  # Apache default
]
_PARKED_REGEX = re.compile("|".join(_PARKED_PATTERNS), re.IGNORECASE)


def is_safe_url(url: str) -> bool:
    """
    Validates that a URL is safe to request.
    Prevents SSRF by checking for private, loopback, and reserved IP ranges
    for ALL resolved IP addresses (IPv4 and IPv6).
    """
    if not url:
        return False
    try:
        # Prepend https if scheme is missing for parsing purposes
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url

        parsed = urlparse(url)
        if parsed.scheme not in ('http', 'https'):
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        # Basic check for common local hostnames
        if hostname.lower() in ('localhost', '127.0.0.1', '0.0.0.0', '::1'):
            return False

        # Resolve hostname to ALL associated IPs (IPv4 and IPv6)
        # This provides protection against dual-stack SSRF bypasses.
        addr_info = socket.getaddrinfo(hostname, None)
        for info in addr_info:
            ip_addr = info[4][0]
            # Handle IPv6-mapped IPv4 addresses (e.g., ::ffff:127.0.0.1)
            if ip_addr.startswith('::ffff:'):
                ip_addr = ip_addr.replace('::ffff:', '')

            ip = ipaddress.ip_address(ip_addr)
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_multicast or ip.is_link_local:
                return False

        return True
    except Exception:
        return False


def safe_request(method: str, url: str, **kwargs) -> requests.Response:
    """
    Performs a safe HTTP request by manually following redirects and validating
    each hop against is_safe_url. Prevents redirect-based SSRF.
    """
    max_redirects = kwargs.pop('max_redirects', 5)
    # We handle redirects manually
    kwargs['allow_redirects'] = False

    current_url = url
    for _ in range(max_redirects + 1):
        if not is_safe_url(current_url):
            raise requests.exceptions.RequestException(f"Unsafe URL detected: {current_url}")

        response = requests.request(method, current_url, **kwargs)

        if response.is_redirect:
            location = response.headers.get('Location')
            if not location:
                break
            current_url = urljoin(current_url, location)
            continue
        else:
            return response

    return response # Return the last redirect response if limit exceeded


def urljoin(base: str, url: str) -> str:
    """Simple urljoin fallback if needed, but we can use urllib.parse.urljoin."""
    from urllib.parse import urljoin as _urljoin
    return _urljoin(base, url)


def normalize_url(url: str) -> str:
    """Ensure url has a scheme for HTTP requests."""
    url = url.strip()
    if not url:
        return ""
    if not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def validate_website(url: str) -> dict:
    """
    Comprehensive website validation that runs BEFORE any AI analysis.
    Returns a dict with:
      - valid (bool): whether the website passed DNS resolution
      - error (str|None): professional error message if validation failed (hard invalidation)
      - warning (str|None): warning type if technical issues are present
      - technical_warning (str|None): specific technical warnings (SSL, timeout, 403)
      - url (str): normalized URL
    
    Checks performed (in order):
      1. Domain format validation (Hard invalidation)
      2. DNS resolution (Hard invalidation)
      3. HTTP accessibility (Soft warning)
      4. HTTP response success (Soft warning)
      5. Parked / dead / non-hosted domain detection (Hard invalidation)
    """
    # ── Step 0: Normalize ───────────────────────────────────────────────────
    url = normalize_url(url)
    if not url:
        return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

    # ── Step 1: Domain format validation ────────────────────────────────────
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname:
            return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

        # Reject obviously invalid domain patterns
        if "." not in hostname:
            return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

        # Reject localhost / internal
        if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
            return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

    except Exception:
        return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

    # ── Step 2: DNS resolution (SSRF Protection) ────────────────────────────
    if not is_safe_url(url):
        return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

    # ── Step 3 & 4: HTTP accessibility + status code (Non-blocking Warnings) ─
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        # Bypassing SSL errors in validation call as well to allow expired cert sites to proceed
        # Using safe_request to prevent redirect-based SSRF
        response = safe_request("GET", url, timeout=10, headers=headers, stream=True, verify=False)

        # Read a limited amount of body for parked-domain detection (first 50KB)
        body_chunk = ""
        try:
            raw_bytes = response.raw.read(51200)
            body_chunk = raw_bytes.decode("utf-8", errors="ignore")
        except Exception:
            pass
        finally:
            response.close()

        # Check for parked / dead / non-hosted domain detection (Hard invalidation if parked/empty)
        if body_chunk:
            stripped = body_chunk.strip()
            if len(stripped) < 200 and not re.search(r"<(div|section|main|article|p|h[1-6])", stripped, re.IGNORECASE):
                return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

            if _PARKED_REGEX.search(body_chunk):
                return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

        # Check HTTP status for warnings
        if response.status_code >= 400:
            status_text = "page not found" if response.status_code == 404 else "access error"
            return {
                "valid": True,
                "warning": "Website Accessible With Technical Issues",
                "technical_warning": f"Website returned a {response.status_code} ({status_text}). Unable to access some public pages.",
                "url": url
            }

    except requests.exceptions.SSLError:
        return {
            "valid": True,
            "warning": "Website Accessible With Technical Issues",
            "technical_warning": "SSL certificate error — the website's security certificate is invalid or expired.",
            "url": url
        }
    except requests.exceptions.Timeout:
        return {
            "valid": True,
            "warning": "Website Accessible With Technical Issues",
            "technical_warning": "Website timed out — connection limit reached or slow response.",
            "url": url
        }
    except requests.exceptions.TooManyRedirects:
        return {
            "valid": True,
            "warning": "Website Accessible With Technical Issues",
            "technical_warning": "Website has redirect loops or configuration issues.",
            "url": url
        }
    except Exception as e:
        # Any other connection/request issue (e.g. connection refused)
        if "Unsafe URL detected" in str(e):
             return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

        return {
            "valid": True,
            "warning": "Website Accessible With Technical Issues",
            "technical_warning": f"Website is unreachable due to technical issues: {str(e)}",
            "url": url
        }

    # ── All checks passed ───────────────────────────────────────────────────
    return {"valid": True, "error": None, "url": url}
