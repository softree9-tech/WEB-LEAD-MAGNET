import socket
from urllib.parse import urlparse
import ipaddress

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

        # Resolve hostname to all associated IPs (IPv4 and IPv6)
        # Using getaddrinfo prevents bypasses where a hostname resolves to multiple IPs,
        # some of which might be internal/private.
        addr_info = socket.getaddrinfo(hostname, None)
        for item in addr_info:
            ip_addr = item[4][0]
            ip = ipaddress.ip_address(ip_addr)
            if ip.is_private or ip.is_loopback or ip.is_reserved or ip.is_multicast or ip.is_link_local:
                return False

        return True
    except Exception:
        return False
