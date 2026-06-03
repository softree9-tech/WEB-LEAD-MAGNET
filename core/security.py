import socket
from urllib.parse import urlparse
import ipaddress
import requests
from functools import lru_cache
import re

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
def is_safe_url(url: str) -> bool:
    """
    Validates that a URL is safe to request.
    Prevents SSRF by checking for private, loopback, and reserved IP ranges.
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

        # Resolve hostname to IP
        # This provides protection against standard SSRF.
        # DNS rebinding protection would require pinning the IP for the subsequent request.
        ip_addr = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_addr)

        if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_multicast or ip.is_link_local:
            return False

        return True
    except Exception:
        return False


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
      - valid (bool): whether the website passed all checks
      - error (str|None): professional error message if validation failed
      - url (str): normalized URL
    
    Checks performed (in order):
      1. Domain format validation
      2. DNS resolution
      3. HTTP accessibility (with timeout)
      4. HTTP response success (status code)
      5. Parked / dead / non-hosted domain detection
    """
    # ── Step 0: Normalize ───────────────────────────────────────────────────
    url = normalize_url(url)
    if not url:
        return {"valid": False, "error": "No website URL provided.", "url": url}

    # ── Step 1: Domain format validation ────────────────────────────────────
    try:
        parsed = urlparse(url)
        hostname = parsed.hostname
        if not hostname:
            return {"valid": False, "error": "Invalid website URL format.", "url": url}

        # Reject obviously invalid domain patterns
        if "." not in hostname:
            return {"valid": False, "error": "Invalid domain format — a valid domain must include a TLD (e.g., .com, .org).", "url": url}

        # Reject localhost / internal
        if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
            return {"valid": False, "error": "Internal or localhost addresses are not allowed.", "url": url}

    except Exception:
        return {"valid": False, "error": "Invalid website URL format.", "url": url}

    # ── Step 2: DNS resolution ──────────────────────────────────────────────
    try:
        ip_addr = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_addr)
        if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_multicast or ip.is_link_local:
            return {"valid": False, "error": "Invalid or unsafe website URL.", "url": url}
    except socket.gaierror:
        return {"valid": False, "error": f"DNS resolution failed — no active hosting detected for \"{hostname}\".", "url": url}
    except Exception:
        return {"valid": False, "error": f"Domain appears inactive or unavailable.", "url": url}

    # ── Step 3 & 4: HTTP accessibility + status code ────────────────────────
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        }
        response = requests.get(url, timeout=15, allow_redirects=True, headers=headers, stream=True)

        # Read a limited amount of body for parked-domain detection (first 50KB)
        body_chunk = ""
        try:
            raw_bytes = response.raw.read(51200)
            body_chunk = raw_bytes.decode("utf-8", errors="ignore")
        except Exception:
            pass
        finally:
            response.close()

        # Check HTTP status
        if response.status_code >= 500:
            return {"valid": False, "error": f"Website returned a server error (HTTP {response.status_code}). The site may be down or misconfigured.", "url": url}

        if response.status_code == 404:
            return {"valid": False, "error": "Website returned a 404 — page not found.", "url": url}

        if response.status_code >= 400:
            return {"valid": False, "error": f"Website returned an error (HTTP {response.status_code}). Unable to access the site.", "url": url}

        # ── Step 5: Parked / dead / non-hosted domain detection ─────────────
        if body_chunk:
            # Very short body with no meaningful content
            stripped = body_chunk.strip()
            if len(stripped) < 200 and not re.search(r"<(div|section|main|article|p|h[1-6])", stripped, re.IGNORECASE):
                return {"valid": False, "error": "No active website content detected — domain appears inactive or not hosted.", "url": url}

            if _PARKED_REGEX.search(body_chunk):
                return {"valid": False, "error": "No active hosting detected for this domain — it appears to be parked, expired, or a default page.", "url": url}

    except requests.exceptions.Timeout:
        return {"valid": False, "error": "Website timed out — unable to establish a connection within 15 seconds.", "url": url}
    except requests.exceptions.TooManyRedirects:
        return {"valid": False, "error": "Website has too many redirects and could not be reached.", "url": url}
    except requests.exceptions.SSLError:
        return {"valid": False, "error": "SSL certificate error — the website's security certificate is invalid or expired.", "url": url}
    except requests.exceptions.ConnectionError:
        return {"valid": False, "error": "Unable to establish a connection to the provided website.", "url": url}
    except requests.exceptions.RequestException:
        return {"valid": False, "error": "Website is currently unreachable.", "url": url}

    # ── All checks passed ───────────────────────────────────────────────────
    return {"valid": True, "error": None, "url": url}
