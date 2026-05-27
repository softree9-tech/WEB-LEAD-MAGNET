import socket
from urllib.parse import urlparse
import ipaddress
from functools import lru_cache

@lru_cache(maxsize=128)
def is_safe_url(url: str) -> bool:
    """
    Validates that a URL is safe to request.
    Prevents SSRF by checking all resolved IP addresses (IPv4 and IPv6)
    against private, loopback, and reserved ranges.
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

        # Resolve all IP addresses for the hostname (multi-stack support)
        # This protects against bypasses where a hostname resolves to both public and private IPs.
        try:
            addr_info = socket.getaddrinfo(hostname, None)
        except socket.gaierror:
            return False

        for info in addr_info:
            # info[4] is the sockaddr tuple. For IPv4 it's (address, port)
            # For IPv6 it's (address, port, flow info, scope id)
            ip_str = info[4][0]
            ip = ipaddress.ip_address(ip_str)

            if (ip.is_private or
                ip.is_loopback or
                ip.is_reserved or
                ip.is_multicast or
                ip.is_link_local):
                return False

        return True
    except Exception:
        return False
