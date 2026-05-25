import socket
from urllib.parse import urlparse
import ipaddress
from functools import lru_cache

@lru_cache(maxsize=128)
def _is_safe_hostname(hostname: str) -> bool:
    """
    Checks if a hostname resolves only to safe (public) IP addresses.
    Cached to prevent redundant DNS lookups.
    """
    if hostname.lower() in ('localhost', '127.0.0.1', '0.0.0.0', '::1'):
        return False

    try:
        # getaddrinfo handles both IPv4 and IPv6 and returns all associated IPs
        addr_info = socket.getaddrinfo(hostname, None)
        for info in addr_info:
            ip_str = info[4][0]
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_multicast or ip.is_link_local:
                return False
        return True
    except Exception:
        return False

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

        return _is_safe_hostname(hostname)
    except Exception:
        return False
