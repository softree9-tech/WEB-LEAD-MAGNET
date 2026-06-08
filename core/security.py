import socket
from urllib.parse import urlparse, urljoin
import ipaddress
import requests
import re
from functools import lru_cache

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


@lru_cache(maxsize=1024)
def _resolve_hostname(hostname: str) -> list:
    """Resolves a hostname to a list of IP addresses (both IPv4 and IPv6)."""
    try:
        # getaddrinfo returns a list of 5-tuples: (family, type, proto, canonname, sockaddr)
        # sockaddr is (address, port) for IPv4 and (address, port, flow info, scope id) for IPv6
        results = socket.getaddrinfo(hostname, None)
        return list(set(r[4][0] for r in results))
    except Exception:
        return []


def is_safe_url(url: str) -> bool:
    """
    Validates that a URL is safe to request.
    Prevents SSRF by checking for private, loopback, and reserved IP ranges.
    Checks all resolved IP addresses (multi-IP and IPv6 support).
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

        # Resolve hostname to all associated IPs
        ip_addresses = _resolve_hostname(hostname)
        if not ip_addresses:
            # If we can't resolve it, we can't be sure it's safe if it was intended to be an IP
            # But usually it means the domain doesn't exist.
            # However, if hostname itself is an IP, it might still work.
            try:
                ip_addresses = [str(ipaddress.ip_address(hostname))]
            except ValueError:
                return False

        for ip_addr in ip_addresses:
            ip = ipaddress.ip_address(ip_addr)
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_multicast or ip.is_link_local:
                return False

            # Check for IPv4-mapped IPv6 addresses (e.g., ::ffff:127.0.0.1)
            if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
                if ip.ipv4_mapped.is_private or ip.ipv4_mapped.is_loopback:
                    return False

        return True
    except Exception:
        return False


def safe_request(method, url, max_redirects=5, **kwargs):
    """
    Performs a secure HTTP request with manual redirect handling and SSRF validation at each hop.
    Returns the final response object or raises a requests.exceptions.RequestException / ValueError.
    """
    # Force allow_redirects=False to handle them manually
    kwargs['allow_redirects'] = False

    current_url = url
    if not is_safe_url(current_url):
        raise ValueError(f"Unsafe URL blocked: {current_url}")

    for _ in range(max_redirects + 1):
        # We use the provided method (get, head, etc.)
        response = requests.request(method, current_url, **kwargs)

        if response.status_code in (301, 302, 303, 307, 308):
            new_url = response.headers.get("Location")
            if not new_url:
                return response

            new_url = urljoin(current_url, new_url)

            # Close intermediate response if it's a stream
            if kwargs.get('stream'):
                response.close()

            # SECURITY: Validate each hop
            if not is_safe_url(new_url):
                if not kwargs.get('stream'): # ensure non-stream is also handled if possible, though requests handles body usually
                    response.close()
                raise ValueError(f"Unsafe redirect blocked: {new_url}")

            current_url = new_url
            continue
        else:
            return response

    raise requests.exceptions.TooManyRedirects(f"Exceeded {max_redirects} redirects")


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

    # ── Step 2: DNS & Safety Check ──────────────────────────────────────────
    if not is_safe_url(url):
        return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

    # ── Step 3 & 4: HTTP accessibility + status code (Non-blocking Warnings) ─
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }

        # Bypassing SSL errors in validation call as well to allow expired cert sites to proceed
        try:
            response = safe_request("GET", url, timeout=10, headers=headers, stream=True, verify=False)
        except ValueError:
            return {"valid": False, "error": "Invalid domain — unable to locate website.", "url": url}

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
        return {
            "valid": True,
            "warning": "Website Accessible With Technical Issues",
            "technical_warning": f"Website is unreachable due to technical issues: {str(e)}",
            "url": url
        }

    # ── All checks passed ───────────────────────────────────────────────────
    return {"valid": True, "error": None, "url": url}

