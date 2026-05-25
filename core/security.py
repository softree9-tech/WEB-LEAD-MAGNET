import socket
from urllib.parse import urlparse
import ipaddress
from functools import lru_cache

@lru_cache(maxsize=128)
def is_safe_url(url: str) -> bool:
    """
    Validates that a URL is safe to request.
    Prevents SSRF by checking for private, loopback, and reserved IP ranges.
    Uses socket.getaddrinfo to validate all resolved IP addresses (IPv4 & IPv6).
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

        # Resolve hostname to all associated IP addresses (IPv4 and IPv6)
        try:
            addr_info = socket.getaddrinfo(hostname, None)
        except socket.gaierror:
            return False

        for info in addr_info:
            ip_addr = info[4][0]
            # Handle IPv6 scope IDs if present (e.g., fe80::1%lo0)
            if '%' in ip_addr:
                ip_addr = ip_addr.split('%')[0]

            ip = ipaddress.ip_address(ip_addr)

            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_multicast or ip.is_link_local:
                return False

        return True
    except Exception:
        return False
