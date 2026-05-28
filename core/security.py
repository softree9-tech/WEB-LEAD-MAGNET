import socket
from urllib.parse import urlparse
import ipaddress
from functools import lru_cache

@lru_cache(maxsize=128)
def _is_safe_hostname(hostname: str) -> bool:
    """
    Resolves and validates a hostname's IP addresses.
    Returns True if ALL associated IP addresses are safe.
    """
    if not hostname:
        return False

    # Basic check for common local hostnames
    if hostname.lower() in ('localhost', '127.0.0.1', '0.0.0.0', '::1'):
        return False

    try:
        # Use getaddrinfo to resolve ALL IP addresses (both IPv4 and IPv6)
        # associated with the hostname.
        addr_info = socket.getaddrinfo(hostname, None)
        for family, kind, proto, canonname, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip = ipaddress.ip_address(ip_str)

            # Check for unsafe ranges
            if (ip.is_private or
                ip.is_loopback or
                ip.is_reserved or
                ip.is_multicast or
                ip.is_link_local or
                ip.is_unspecified):
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
